from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3

app = Flask(__name__)
app.secret_key = "secret123"


def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    # USERS
    c.execute('''CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
    )''')

    # CART
    c.execute('''CREATE TABLE IF NOT EXISTS cart(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        product TEXT,
        price INTEGER
    )''')

    # WISHLIST
    c.execute('''CREATE TABLE IF NOT EXISTS wishlist(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        product TEXT,
        price INTEGER
    )''')

    # ORDERS
    c.execute('''CREATE TABLE IF NOT EXISTS orders(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        product TEXT,
        price INTEGER
    )''')

    # REVIEWS
    c.execute('''CREATE TABLE IF NOT EXISTS reviews(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        product TEXT,
        rating INTEGER,
        comment TEXT
    )''')

    conn.commit()
    conn.close()

init_db()


@app.route("/")
def home():
    if "user" not in session:
        return redirect("/login")
    return render_template("index.html")



@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]

        conn = sqlite3.connect("database.db")
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=? AND password=?", (u,p))
        user = c.fetchone()
        conn.close()

        if user:
            session["user"] = u
            return redirect("/")
        return "Invalid login"

    return render_template("login.html")


@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]

        conn = sqlite3.connect("database.db")
        c = conn.cursor()
        c.execute("INSERT INTO users(username,password) VALUES (?,?)", (u,p))
        conn.commit()
        conn.close()

        return redirect("/login")

    return render_template("signup.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")



@app.route("/profile")
def profile():
    if "user" not in session:
        return redirect("/login")

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM orders WHERE username=?", (session["user"],))
    total_orders = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM cart WHERE username=?", (session["user"],))
    cart_items = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM wishlist WHERE username=?", (session["user"],))
    wishlist_items = c.fetchone()[0]

    conn.close()

    return render_template(
        "profile.html",
        user=session["user"],
        total_orders=total_orders,
        cart_items=cart_items,
        wishlist_items=wishlist_items
    )


@app.route("/add_cart", methods=["POST"])
def add_cart():
    if "user" not in session:
        return jsonify({"msg":"login required"})

    data = request.json

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO cart(username,product,price) VALUES (?,?,?)",
              (session["user"], data["name"], data["price"]))
    conn.commit()
    conn.close()

    return jsonify({"msg":"added"})


@app.route("/get_cart")
def get_cart():
    if "user" not in session:
        return jsonify([])

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT id, product, price FROM cart WHERE username=?",
              (session["user"],))
    data = c.fetchall()
    conn.close()

    return jsonify(data)


@app.route("/remove_cart/<int:id>")
def remove_cart(id):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("DELETE FROM cart WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"msg":"removed"})


@app.route("/clear_cart")
def clear_cart():
    if "user" not in session:
        return jsonify({"msg":"login required"})

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("DELETE FROM cart WHERE username=?", (session["user"],))
    conn.commit()
    conn.close()

    return jsonify({"msg":"cleared"})



@app.route("/add_wishlist", methods=["POST"])
def add_wishlist():
    if "user" not in session:
        return jsonify({"msg":"login required"})

    data = request.json

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO wishlist(username,product,price) VALUES (?,?,?)",
              (session["user"], data["name"], data["price"]))
    conn.commit()
    conn.close()

    return jsonify({"msg":"added"})


@app.route("/get_wishlist")
def get_wishlist():
    if "user" not in session:
        return jsonify([])

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT id, product, price FROM wishlist WHERE username=?",
              (session["user"],))
    data = c.fetchall()
    conn.close()

    return jsonify(data)


@app.route("/remove_wishlist/<int:id>")
def remove_wishlist(id):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("DELETE FROM wishlist WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"msg":"removed"})



@app.route("/order", methods=["POST"])
def order():
    if "user" not in session:
        return jsonify({"msg":"login required"})

    items = request.json

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    for i in items:
        c.execute("INSERT INTO orders(username,product,price) VALUES (?,?,?)",
                  (session["user"], i["name"], i["price"]))

    # clear cart after order
    c.execute("DELETE FROM cart WHERE username=?", (session["user"],))

    conn.commit()
    conn.close()

    return jsonify({"msg":"success"})



@app.route("/orders")
def orders():
    if "user" not in session:
        return redirect("/login")

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("SELECT product, price FROM orders WHERE username=?",
              (session["user"],))
    data = c.fetchall()

    conn.close()

    return render_template("orders.html", orders=data)



@app.route("/review", methods=["POST"])
def review():
    if "user" not in session:
        return jsonify({"msg":"login required"})

    data = request.json

    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO reviews(username,product,rating,comment) VALUES (?,?,?,?)",
              (session["user"], data["product"], data["rating"], data["comment"]))
    conn.commit()
    conn.close()

    return jsonify({"msg":"review added"})


@app.route("/get_reviews/<product>")
def get_reviews(product):
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT username, rating, comment FROM reviews WHERE product=?",
              (product,))
    data = c.fetchall()
    conn.close()

    return jsonify(data)



@app.route("/cart")
def cart():
    return render_template("cart.html")


@app.route("/wishlist")
def wishlist():
    return render_template("wishlist.html")


@app.route("/checkout")
def checkout():
    return render_template("checkout.html")


if __name__ == "__main__":
    app.run(debug=True)