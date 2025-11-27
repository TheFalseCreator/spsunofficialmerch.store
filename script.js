// script.js — GuptaGang.Shop demo store
// Minimal, dependency-free store with localStorage cart

const PRODUCTS = [
  { id: 'p1', title: 'Classic Tee', price: 399, img: 'https://picsum.photos/seed/tee/800/600', desc: 'Comfortable cotton tee — everyday staple.' },
  { id: 'p2', title: 'Retro Hoodie', price: 899, img: 'https://picsum.photos/seed/hoodie/800/600', desc: 'Warm, soft, retro fit.' },
  { id: 'p3', title: 'Sticker Pack', price: 99, img: 'https://picsum.photos/seed/sticker/800/600', desc: '12 vinyl stickers.' },
  { id: 'p4', title: 'Cap — Snapback', price: 249, img: 'https://picsum.photos/seed/cap/800/600', desc: 'One-size adjustable snapback.' },
  { id: 'p5', title: 'Canvas Tote', price: 299, img: 'https://picsum.photos/seed/tote/800/600', desc: 'Durable carry-all tote.' },
  { id: 'p6', title: 'Limited Print', price: 1299, img: 'https://picsum.photos/seed/print/800/600', desc: 'A3 art print, limited run.' }
];

const SELECTORS = {
  products: document.getElementById('products'),
  modal: document.getElementById('product-modal'),
  modalBody: document.getElementById('modal-body'),
  closeModal: document.getElementById('close-modal'),
  viewCartBtn: document.getElementById('view-cart'),
  viewProductsBtn: document.getElementById('view-products'),
  cartCount: document.getElementById('cart-count'),
  checkoutSection: document.getElementById('checkout'),
  orderSummary: document.getElementById('order-summary'),
  simulatePayment: document.getElementById('simulate-payment'),
  backToShop: document.getElementById('back-to-shop'),
  paymentResult: document.getElementById('payment-result'),
  year: document.getElementById('year')
};

// Simple cart stored as {productId: qty}
let cart = JSON.parse(localStorage.getItem('gg_cart') || '{}');

function saveCart(){ localStorage.setItem('gg_cart', JSON.stringify(cart)); renderCartCount(); }
function addToCart(id, qty=1){
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  showToast('Added to cart');
}
function removeFromCart(id){
  delete cart[id];
  saveCart();
}
function updateQty(id, qty){
  if(qty <= 0) removeFromCart(id);
  else cart[id] = qty;
  saveCart();
}

function renderCartCount(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  SELECTORS.cartCount.textContent = count;
}

// Render product grid
function renderProducts(){
  SELECTORS.products.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img class="product-image" src="${p.img}" alt="${p.title}">
      <h3 class="product-title">${p.title}</h3>
      <p class="small">${p.desc}</p>
      <div class="row" style="margin-top:12px">
        <strong class="product-price">₹${p.price}</strong>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="btn view" data-id="${p.id}">View</button>
          <button class="btn primary add" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    SELECTORS.products.appendChild(card);
  });

  // attach events
  document.querySelectorAll('.btn.add').forEach(b=>{
    b.addEventListener('click', e => addToCart(e.currentTarget.dataset.id));
  });
  document.querySelectorAll('.btn.view').forEach(b=>{
    b.addEventListener('click', e => openModal(e.currentTarget.dataset.id));
  });
}

// Modal view
function openModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  SELECTORS.modalBody.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <img src="${p.img}" alt="${p.title}" style="width:100%;border-radius:8px;object-fit:cover">
      <div>
        <h2>${p.title}</h2>
        <p class="small">${p.desc}</p>
        <p style="margin-top:12px"><strong>Price: ₹${p.price}</strong></p>
        <label for="qty">Quantity</label>
        <input id="qty" type="number" min="1" value="1" style="width:80px;padding:8px;margin:8px 0;border-radius:8px;border:1px solid #ddd">
        <div style="display:flex;gap:8px">
          <button id="modal-add" class="btn primary">Add to cart</button>
          <button id="modal-close" class="btn">Close</button>
        </div>
      </div>
    </div>
  `;
  SELECTORS.modal.classList.remove('hidden');
  document.getElementById('modal-add').addEventListener('click', ()=>{
    const qty = Math.max(1, parseInt(document.getElementById('qty').value || '1', 10));
    addToCart(id, qty);
    SELECTORS.modal.classList.add('hidden');
  });
  document.getElementById('modal-close').addEventListener('click', ()=> SELECTORS.modal.classList.add('hidden'));
}

SELECTORS.closeModal.addEventListener('click', ()=> SELECTORS.modal.classList.add('hidden'));
SELECTORS.modal.addEventListener('click', (e)=>{ if(e.target === SELECTORS.modal) SELECTORS.modal.classList.add('hidden') });

// Navigation
SELECTORS.viewCartBtn.addEventListener('click', showCheckout);
SELECTORS.viewProductsBtn.addEventListener('click', ()=> {
  SELECTORS.checkoutSection.classList.add('hidden');
  SELECTORS.products.classList.remove('hidden');
  SELECTORS.paymentResult.textContent = '';
});

SELECTORS.backToShop.addEventListener('click', ()=> {
  SELECTORS.checkoutSection.classList.add('hidden');
  SELECTORS.products.classList.remove('hidden');
});

// Render checkout / order summary
function showCheckout(){
  SELECTORS.products.classList.add('hidden');
  SELECTORS.checkoutSection.classList.remove('hidden');
  renderOrderSummary();
}

function renderOrderSummary(){
  const lines = [];
  let total = 0;
  for(const [id, qty] of Object.entries(cart)){
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) continue;
    const lineTotal = p.price * qty;
    total += lineTotal;
    lines.push(`
      <div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f0f0f0">
        <img src="${p.img}" alt="${p.title}" style="width:72px;height:56px;object-fit:cover;border-radius:6px">
        <div style="flex:1">
          <strong>${p.title}</strong>
          <div class="small">₹${p.price} × 
            <input type="number" min="0" value="${qty}" data-id="${id}" style="width:60px;padding:6px;margin-left:6px;border-radius:6px;border:1px solid #ddd">
          </div>
        </div>
        <div style="text-align:right">
          <div>₹${lineTotal}</div>
          <button class="btn remove" data-id="${id}">Remove</button>
        </div>
      </div>
    `);
  }

  if(lines.length === 0){
    SELECTORS.orderSummary.innerHTML = '<p>Your cart is empty. Add something nice :)</p>';
    SELECTORS.simulatePayment.disabled = true;
    return;
  }

  const summaryHtml = `
    ${lines.join('')}
    <div style="padding-top:12px;text-align:right">
      <strong>Total: ₹${total}</strong>
    </div>
    <p class="small">We use a simulated payment flow in this demo. Replace with Razorpay/Stripe integration when ready.</p>
  `;

  SELECTORS.orderSummary.innerHTML = summaryHtml;
  SELECTORS.simulatePayment.disabled = false;

  // Attach qty change handlers
  document.querySelectorAll('#order-summary input[type="number"]').forEach(input=>{
    input.addEventListener('change', (e)=>{
      const id = e.currentTarget.dataset.id;
      const q = Math.max(0, parseInt(e.currentTarget.value || '0', 10));
      if(q === 0) removeFromCart(id); else updateQty(id, q);
      renderOrderSummary();
    });
  });

  document.querySelectorAll('#order-summary .remove').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
      renderOrderSummary();
    });
  });
}

// Simulated payment — replace with real payment gateway
SELECTORS.simulatePayment.addEventListener('click', ()=> {
  SELECTORS.simulatePayment.disabled = true;
  SELECTORS.paymentResult.textContent = 'Processing payment...';
  // Simulate network payment time
  setTimeout(()=> {
    // In a real integration you'd call your backend to create a payment/order
    const orderId = 'GGORD-'+Math.random().toString(36).slice(2,9).toUpperCase();
    SELECTORS.paymentResult.textContent = `Payment successful. Order ID: ${orderId}`;
    // clear cart
    cart = {};
    saveCart();
    renderOrderSummary();
  }, 1100);
});

// Small toast
function showToast(text){
  const t = document.createElement('div');
  t.textContent = text;
  t.style.cssText = 'position:fixed;right:18px;bottom:18px;background:#111;color:#fff;padding:10px 14px;border-radius:8px;opacity:.95;z-index:999';
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1600);
}

// init
renderProducts();
renderCartCount();
SELECTORS.year.textContent = new Date().getFullYear();

// Helpful: expose for console debugging
window.GG = { PRODUCTS, getCart: ()=>cart };
