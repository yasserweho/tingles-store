const img = src => {
  if (!src) return "";
  const key = src.split("/").pop();
  return (window.TINGLES_IMG && TINGLES_IMG[key]) || src;
};
const cartKey = "tingles-cart";
const getCart = () => JSON.parse(localStorage.getItem(cartKey) || "[]");
const setCart = items => { localStorage.setItem(cartKey, JSON.stringify(items)); updateBag(); renderDrawer(); };
const addToCart = (product, size, qty=1) => {
  const items = getCart();
  const key = product.id + "|" + size;
  const found = items.find(i => i.key === key);
  if (found) found.qty += qty;
  else items.push({ key, id: product.id, name: product.name, price: product.price, img: product.img, size, qty });
  setCart(items);
  openDrawer();
};
const updateBag = () => {
  const n = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".bag-count").forEach(el => { el.textContent = n; el.classList.toggle("show", n > 0); });
};
function chrome(active="") {
  const links = [
    ["Women", "shop.html?gender=women"],
    ["Men", "shop.html?gender=men"],
    ["Accessories", "shop.html?gender=accessories"],
    ["Shoes", "shop.html?gender=accessories"],
    ["Activity", "shop.html"],
    ["Markdowns", "shop.html?sale=1"]
  ];
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="announce">Free shipping on orders over $150 · <a href="shop.html">Shop the October edit</a></div>
    <header class="site">
      <div class="nav">
        <a class="logo" href="index.html">TINGLES</a>
        <nav class="nav-left">
          ${links.map(([l,h]) => `<div class="nav-item"><a class="nav-link" href="${h}">${l}</a>
            <div class="mega"><div class="mega-grid">
              <div><h4>Categories</h4><a href="shop.html?gender=women">Women</a><a href="shop.html?gender=men">Men</a><a href="shop.html?cat=leggings">Leggings</a><a href="shop.html?cat=jackets">Jackets</a><a href="shop.html?cat=hoodies">Hoodies</a></div>
              <div><h4>Activity</h4><a href="shop.html?activity=yoga">Yoga</a><a href="shop.html?activity=run">Run</a><a href="shop.html?activity=train">Train</a></div>
              <div><h4>Featured</h4><a href="product.html?id=cloudline">Cloudline Legging</a><a href="product.html?id=pace">Pace Shell</a><a href="shop.html?sale=1">Markdowns</a></div>
              <div><h4>Tingles</h4><a href="about.html">Our story</a><a href="about.html">Fabric</a><a href="cart.html">Bag</a></div>
            </div></div>
          </div>`).join("")}
        </nav>
        <div class="nav-right">
          <button class="icon-btn menu-toggle" aria-label="Menu">Menu</button>
          <button class="icon-btn" id="searchBtn" aria-label="Search">Search</button>
          <a class="icon-btn" href="about.html" aria-label="Account">Account</a>
          <a class="icon-btn" href="cart.html" aria-label="Bag">Bag <span class="bag-count"></span></a>
        </div>
      </div>
      <div class="search-panel" id="searchPanel">
        <input id="searchInput" placeholder="Search leggings, jackets, run..." />
        <div id="searchHits"></div>
      </div>
    </header>
      <div class="search-panel" id="searchPanel">
        <input id="searchInput" placeholder="Search leggings, jackets, run..." />
        <div id="searchHits"></div>
      </div>
    </header>
    <div class="drawer-back" id="drawerBack"></div>
    <aside class="drawer" id="drawer">
      <header style="display:flex;justify-content:space-between;align-items:center"><strong>Your bag</strong><button class="icon-btn" id="closeDrawer">Close</button></header>
      <div class="items" id="drawerItems"></div>
      <footer>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span>Subtotal</span><strong id="drawerTotal">$0</strong></div>
        <a class="btn" href="cart.html" style="width:100%">View bag & checkout</a>
      </footer>
    </aside>
  `);
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="site">
      <div class="foot-grid">
        <div>
          <div class="logo">TINGLES</div>
          <p>Technical apparel for quiet effort. Designed in-house. Not affiliated with any other athletic brand.</p>
        </div>
        <div><h4>Shop</h4><a href="shop.html?gender=women">Women</a><br><a href="shop.html?gender=men">Men</a><br><a href="shop.html?gender=accessories">Accessories</a></div>
        <div><h4>Help</h4><a href="about.html">Shipping</a><br><a href="about.html">Returns</a><br><a href="about.html">Size guide</a></div>
        <div><h4>Company</h4><a href="about.html">About</a><br><a href="about.html">Stores</a><br><a href="about.html">Careers</a></div>
        <div><h4>Contact</h4><p>hello@tingles.store<br>Mon–Fri, 9–6</p></div>
      </div>
      <div class="legal">© ${new Date().getFullYear()} Tingles. Original storefront demo. Product names, photos, and copy are original and are not affiliated with lululemon athletica.</div>
    </footer>
  `);
  document.getElementById("searchBtn").onclick = () => document.getElementById("searchPanel").classList.toggle("open");
  document.getElementById("searchInput").oninput = e => {
    const q = e.target.value.toLowerCase();
    const hits = TINGLES.products.filter(p => (p.name + p.cat + p.activity).toLowerCase().includes(q)).slice(0, 5);
    document.getElementById("searchHits").innerHTML = hits.map(p => `<a href="product.html?id=${p.id}" style="display:block;padding:8px 0">${p.name} — ${money(p.price)}</a>`).join("");
  };
  document.getElementById("closeDrawer").onclick = closeDrawer;
  document.getElementById("drawerBack").onclick = closeDrawer;
  document.querySelector(".menu-toggle").onclick = () => {
    document.querySelector(".nav-left").style.display = document.querySelector(".nav-left").style.display === "flex" ? "none" : "flex";
    document.querySelector(".nav-left").style.flexDirection = "column";
    document.querySelector(".nav-left").style.position = "absolute";
    document.querySelector(".nav-left").style.top = "72px";
    document.querySelector(".nav-left").style.left = "0";
    document.querySelector(".nav-left").style.background = "#fff";
    document.querySelector(".nav-left").style.padding = "16px";
  };
  window.addEventListener("scroll", () => document.querySelector("header.site").classList.toggle("scrolled", scrollY > 4));
  updateBag();
  renderDrawer();
}
function openDrawer(){ document.getElementById("drawer").classList.add("open"); document.getElementById("drawerBack").classList.add("open"); }
function closeDrawer(){ document.getElementById("drawer").classList.remove("open"); document.getElementById("drawerBack").classList.remove("open"); }
function renderDrawer(){
  const items = getCart();
  const box = document.getElementById("drawerItems");
  if (!box) return;
  box.innerHTML = items.length ? items.map(i => `<div style="display:grid;grid-template-columns:72px 1fr;gap:10px;padding:12px 0;border-bottom:1px solid var(--line)">
    <img src="${img(i.img)}" alt="" style="width:72px;height:90px;object-fit:cover">
    <div><strong>${i.name}</strong><div style="color:var(--muted);font-size:13px">Size ${i.size} · Qty ${i.qty}</div><div>${money(i.price * i.qty)}</div>
    <button class="icon-btn" data-remove="${i.key}">Remove</button></div></div>`).join("") : "<p>Your bag is empty.</p>";
  box.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => setCart(getCart().filter(x => x.key !== b.dataset.remove)));
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  const t = document.getElementById("drawerTotal");
  if (t) t.textContent = money(total);
}
function card(p){
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="media" style="background-image:url('${img(p.img)}')">${p.badge?`<span class="badge">${p.badge}</span>`:""}</div>
    <h3>${p.name}</h3>
    <div class="price">${p.compare?`<s>${money(p.compare)}</s>`:""}${money(p.price)}</div>
    <div class="swatches">${p.colors.slice(0,3).map(c=>`<span class="swatch" title="${c}" style="background:${c==="Black"?"#161616":c==="Sage"?"#8fa08a":c==="Sand"?"#d8cbb8":c==="Cream"||c==="Bone"?"#f3efe8":c==="Charcoal"?"#4d5156":c==="Espresso"?"#3b2a24":c==="Navy"?"#1d2a3a":"#ccc"}"></span>`).join("")}</div>
  </a>`;
}
function qs(){ return Object.fromEntries(new URLSearchParams(location.search)); }
