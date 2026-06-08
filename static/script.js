// 
// PRODUCTS 
// 
const products = [
  {name:"Chocolate", price:100, img:"chocolate.jpg.jpeg"},
  {name:"Vanilla", price:90, img:"vanilla.jpg.jpeg"},
  {name:"Strawberry", price:110, img:"strawberry.jpg.jpeg"},
  {name:"Mango", price:120, img:"mango.jpg.jpeg"},
  {name:"Oreo Blast", price:150, img:"oreo.jpg.jpeg"},
  {name:"Butterscotch", price:130, img:"butterscotch.jpg.jpeg"},
  {name:"Coffee Crunch", price:140, img:"coffee.jpg.jpeg"},
  {name:"Pista Delight", price:120, img:"pista.jpg.jpeg"},
  {name:"Blueberry", price:160, img:"blueberry.jpg.jpeg"},
  {name:"Kiwi Fresh", price:150, img:"kiwi.jpg.jpeg"},
  {name:"Black Currant", price:170, img:"blackcurrant.jpg.jpeg"},
  {name:"Raspberry Ripple", price:160, img:"raspberry.jpg.jpeg"},
  {name:"Mint Choco Chip", price:150, img:"mint.jpg.jpeg"},
  {name:"Caramel Swirl", price:140, img:"caramel.jpg.jpeg"},
  {name:"Honey Almond", price:180, img:"almond.jpg.jpeg"},
  {name:"Cheesecake Ice Cream", price:200, img:"cheesecake.jpg.jpeg"},
  {name:"Tutti Frutti", price:110, img:"tutti.jpg.jpeg"},
  {name:"Bubblegum Fun", price:130, img:"bubblegum.jpg.jpeg"},
  {name:"Nutella Swirl", price:190, img:"nutella.jpg.jpeg"},
  {name:"Dry Fruit Special", price:210, img:"dryfruit.jpg.jpeg"}
];


// 
// SHOW PRODUCTS
//
function displayProducts(id){
  let container = document.getElementById(id);
  if(!container) return;

  container.innerHTML = "";

  products.forEach((p,i)=>{

    container.innerHTML += `
      <div class="card">
        <img src="/static/images/${p.img}" class="product-img">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <button onclick="addToCart(${i})">Add to Cart</button>
        <button onclick="addToWishlist(${i})">❤️ Wishlist</button>

        <!-- ⭐ STAR -->
        <div id="stars${i}">
          <span onclick="setRating(${i},1)">☆</span>
          <span onclick="setRating(${i},2)">☆</span>
          <span onclick="setRating(${i},3)">☆</span>
          <span onclick="setRating(${i},4)">☆</span>
          <span onclick="setRating(${i},5)">☆</span>
        </div>

        <input type="hidden" id="rating${i}">
        <input type="text" id="comment${i}" placeholder="Write review">

        <button onclick="addReview('${p.name}', ${i})">Submit</button>

        <div id="reviews${i}"></div>
      </div>
    `;

    setTimeout(()=>{
      loadReviews(p.name, "reviews"+i);
    },100);
  });
}


// 
// ⭐ STAR RATING
// 
function setRating(i,value){
  document.getElementById("rating"+i).value = value;

  let stars = document.querySelectorAll(`#stars${i} span`);

  stars.forEach((s,index)=>{
    if(index < value){
      s.innerText = "⭐";
      s.style.color = "gold";
    } else {
      s.innerText = "☆";
      s.style.color = "gray";
    }
  });
}


// 
// 💬 ADD REVIEW
// 
function addReview(product,i){
  let rating = document.getElementById("rating"+i).value;
  let comment = document.getElementById("comment"+i).value;

  if(!rating){
    alert("Select rating ⭐");
    return;
  }

  fetch("/review", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({product, rating, comment})
  })
  .then(()=> {
    alert("Review added ⭐");
    loadReviews(product,"reviews"+i);
  });
}


// 
// 📥 LOAD REVIEWS
// 
function loadReviews(product,containerId){
  fetch(`/get_reviews/${product}`)
  .then(res=>res.json())
  .then(data=>{
    let div = document.getElementById(containerId);
    if(!div) return;

    div.innerHTML = "<b>Reviews:</b>";

    if(data.length === 0){
      div.innerHTML += "<p>No reviews</p>";
      return;
    }

    data.forEach(r=>{
      let stars = "⭐".repeat(r[1]);
      div.innerHTML += `<p><b>${r[0]}</b><br>${stars}<br>${r[2]}</p>`;
    });
  });
}


//
// 🛒 ADD TO CART (DB)
// 
function addToCart(i){
  fetch("/add_cart", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(products[i])
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.msg === "login required"){
      alert("Login first!");
      window.location.href="/login";
      return;
    }
    alert("Added to Cart 🍦");
  });
}


// 
// 🛍️ DISPLAY CART
// 
function displayCart(){
  fetch("/get_cart")
  .then(res=>res.json())
  .then(data=>{
    let div = document.getElementById("cartItems");
    let total = 0;

    if(!div) return;

    div.innerHTML = "";

    if(data.length === 0){
      div.innerHTML = "<h2 style='text-align:center;'>Cart Empty</h2>";
      document.getElementById("total").innerText = "";
      return;
    }

    data.forEach(item=>{
      total += item[2];

      div.innerHTML += `
        <div class="card">
          <p>${item[1]} - ₹${item[2]}</p>
          <button onclick="removeItem(${item[0]})">Remove</button>
        </div>
      `;
    });

    document.getElementById("total").innerText = "Total ₹" + total;
  });
}


// 
// ❌ REMOVE CART ITEM
// 
function removeItem(id){
  fetch("/remove_cart/"+id)
  .then(()=> displayCart());
}


// 
// ❤️ ADD WISHLIST (DB)
// 
function addToWishlist(i){
  fetch("/add_wishlist", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify(products[i])
  })
  .then(()=> {
    updateWishlistCount();
    alert("Added to Wishlist ❤️");
  });
}


// 
// ❤️ DISPLAY WISHLIST
// 
function displayWishlist(){
  fetch("/get_wishlist")
  .then(res=>res.json())
  .then(data=>{
    let div = document.getElementById("wishlistItems");
    if(!div) return;

    div.innerHTML = "";

    if(data.length === 0){
      div.innerHTML = "<h3>No items</h3>";
      return;
    }

    data.forEach(item=>{
      div.innerHTML += `
        <div class="card">
          <p>${item[1]} - ₹${item[2]}</p>
          <button onclick="removeWish(${item[0]})">Remove</button>
        </div>
      `;
    });
  });
}


// 
// ❌ REMOVE WISHLIST
// 
function removeWish(id){
  fetch("/remove_wishlist/"+id)
  .then(()=> displayWishlist());
}


// 
// ❤️ COUNT
// 
function updateWishlistCount(){
  fetch("/get_wishlist")
  .then(res=>res.json())
  .then(data=>{
    let el = document.getElementById("wishCount");
    if(el) el.innerText = data.length;
  });
}


// 
// 💳 PLACE ORDER
// 
function placeOrder(){
  fetch("/get_cart")
  .then(res=>res.json())
  .then(cart=>{

    if(cart.length === 0){
      alert("Cart empty!");
      return;
    }

    let items = cart.map(i => ({
      name: i[1],
      price: i[2]
    }));

    fetch("/order", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(items)
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.msg === "login required"){
        alert("Login first!");
        window.location.href="/login";
        return;
      }

      alert("Order placed 🎉");

      fetch("/clear_cart").then(()=>{
        window.location.href = "/";
      });
    });

  });
}