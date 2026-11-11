const $=id=>document.getElementById(id);
const products=window.products;
let visibleProducts=[...products],activeIndex=0,activeColor=null,activeSize="M",cart=[],favorites=new Set();
const money=n=>"S/ "+n.toFixed(2);
const current=()=>visibleProducts[activeIndex];
function showToast(message){const toast=$("toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);}
function renderProduct(){
 const p=current();if(!p)return;
 activeColor=activeColor&&p.colors.some(c=>c.hex===activeColor)?activeColor:p.color;
 activeSize=p.sizes.includes(activeSize)?activeSize:p.sizes[0];
 $("product-name").textContent=p.name;$("product-category").textContent=p.label;$("product-price").textContent=money(p.price);$("product-description").textContent=p.description;
 const photo=$("product-photo");photo.src=p.image;photo.alt=p.name+" — fotografía de referencia";photo.onerror=()=>{photo.style.display="none";photo.parentElement.classList.add("image-failed");};photo.onload=()=>{photo.style.display="block";photo.parentElement.classList.remove("image-failed");};
 $("current-index").textContent=String(activeIndex+1).padStart(2,"0");$("total-index").textContent=String(visibleProducts.length).padStart(2,"0");
 $("color-options").innerHTML=p.colors.map(c=>`<button class="swatch ${c.hex===activeColor?"selected":""}" style="background:${c.hex}" title="${c.name}" aria-label="Color ${c.name}" data-color="${c.hex}"></button>`).join("");
 $("size-options").innerHTML=p.sizes.map(s=>`<button class="size-button ${s===activeSize?"selected":""}" data-size="${s}">${s}</button>`).join("");
 $("favorite-button").classList.toggle("selected",favorites.has(p.id));$("favorite-button").textContent=favorites.has(p.id)?"♥":"♡";
 $("previous-product").querySelector(".side-product-label").textContent="ANTERIOR";
 $("next-product").querySelector(".side-product-label").textContent="SIGUIENTE";
 const previous=visibleProducts[(activeIndex-1+visibleProducts.length)%visibleProducts.length];
 const next=visibleProducts[(activeIndex+1)%visibleProducts.length];
 $("previous-product").querySelector(".side-product-image").style.backgroundImage=`url("${previous.image}")`;
 $("next-product").querySelector(".side-product-image").style.backgroundImage=`url("${next.image}")`;
 renderGrid();
}
function setIndex(next){activeIndex=(next+visibleProducts.length)%visibleProducts.length;activeColor=null;renderProduct();}
function renderGrid(){
 const grid=$("product-grid");if(!grid)return;
 grid.innerHTML=visibleProducts.map(p=>`<button class="catalog-card ${p.id===current()?.id?"selected":""}" data-product-id="${p.id}"><span class="catalog-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></span><span class="catalog-meta"><span><small>${p.label}</small><strong>${p.name}</strong></span><b>${money(p.price)}</b></span></button>`).join("");
}
$("product-grid")?.addEventListener("click",e=>{
 const card=e.target.closest("[data-product-id]");if(!card)return;
 const index=visibleProducts.findIndex(p=>p.id===Number(card.dataset.productId));if(index<0)return;
 activeIndex=index;activeColor=null;renderProduct();
 $("stage").scrollIntoView({behavior:"smooth",block:"center"});
});
function filterCategory(category){
 visibleProducts=category==="all"?[...products]:products.filter(p=>p.category===category);
 activeIndex=0;renderProduct();
 document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b.dataset.category===category));
}
document.querySelectorAll(".category").forEach(b=>b.addEventListener("click",()=>filterCategory(b.dataset.category)));
$("previous-product").addEventListener("click",()=>setIndex(activeIndex-1));
$("next-product").addEventListener("click",()=>setIndex(activeIndex+1));
$("color-options").addEventListener("click",e=>{const b=e.target.closest("[data-color]");if(!b)return;activeColor=b.dataset.color;renderProduct();});
$("size-options").addEventListener("click",e=>{const b=e.target.closest("[data-size]");if(!b)return;activeSize=b.dataset.size;renderProduct();});
$("favorite-button").addEventListener("click",()=>{const id=current().id;favorites.has(id)?favorites.delete(id):favorites.add(id);renderProduct();showToast(favorites.has(id)?"Añadido a favoritos":"Eliminado de favoritos");});
$("auto-rotate").addEventListener("click",()=>{const active=$("product-photo").classList.toggle("photo-motion");$("auto-rotate").classList.toggle("active",active);showToast(active?"Movimiento activado":"Movimiento pausado");});
$("add-cart").addEventListener("click",()=>{const p=current();cart.push({...p,color:activeColor,size:activeSize,lineId:Date.now()});renderCart();showToast("Prenda añadida a tu bolsa");});
function renderCart(){
 $("cart-count").textContent=cart.length;
 $("cart-items").innerHTML=cart.length?cart.map(item=>`<div class="cart-row"><div><strong>${item.name}</strong><small>Talla ${item.size} · ${item.colors.find(c=>c.hex===item.color)?.name||"Color"}</small><small>${money(item.price)}</small></div><button data-remove="${item.lineId}" aria-label="Eliminar">×</button></div>`).join(""):'<p class="empty-cart">Tu bolsa está esperando nuevas piezas.</p>';
 $("cart-subtotal").textContent=money(cart.reduce((sum,item)=>sum+item.price,0));
}
$("cart-items").addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;cart=cart.filter(item=>item.lineId!==Number(b.dataset.remove));renderCart();});
function toggleCart(open){$("cart-drawer").classList.toggle("open",open);$("cart-overlay").classList.toggle("open",open);}
$("cart-toggle").addEventListener("click",()=>toggleCart(true));$("close-cart").addEventListener("click",()=>toggleCart(false));$("cart-overlay").addEventListener("click",()=>toggleCart(false));
$("checkout-button").addEventListener("click",()=>showToast("Esta es una demo: pronto podrás comprar aquí."));
$("search-toggle").addEventListener("click",()=>{const query=prompt("¿Qué prenda estás buscando?");if(!query)return;const match=products.find(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.category.toLowerCase().includes(query.toLowerCase()));if(!match){showToast("No encontramos esa prenda");return;}visibleProducts=[...products];activeIndex=visibleProducts.findIndex(p=>p.id===match.id);document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b.dataset.category==="all"));renderProduct();});
$("menu-toggle").addEventListener("click",()=>document.querySelector(".main-nav").classList.toggle("open"));
renderProduct();renderCart();