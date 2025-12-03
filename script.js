/* --------------- Replace this with your Apps Script URL --------------- */
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // <-- put your web app URL here

/* Quick popup element refs */
const quickPopup = () => document.getElementById('quickOrderPopup');
const quickForm = () => document.getElementById('quickOrderForm');
const quickSuccess = () => document.getElementById('quickSuccess');
const quickSubmitBtn = () => document.getElementById('quickSubmit');

/* Scroll helper */
function scrollToProducts() {
  const el = document.getElementById('products');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* Open the compact quick order popup and prefill product */
function openQuickOrder(productName = '') {
  const popup = quickPopup();
  if (!popup) return;
  popup.setAttribute('aria-hidden', 'false');
  // put product name into hidden field
  const hidden = document.getElementById('quickProduct');
  if (hidden) hidden.value = productName;
  // reset form view
  const form = quickForm();
  if (form) {
    form.hidden = false;
    form.reset();
  }
  const success = quickSuccess();
  if (success) success.hidden = true;
  document.body.style.overflow = 'hidden';
}

/* Close the popup */
function closeQuickOrder() {
  const popup = quickPopup();
  if (!popup) return;
  popup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
}

/* Click outside to close (optional) */
document.addEventListener('click', (e) => {
  const popup = quickPopup();
  if (!popup) return;
  if (popup.getAttribute('aria-hidden') === 'false') {
    const inner = popup.querySelector('.quick-popup-inner');
    if (inner && !inner.contains(e.target) && !e.target.matches('.product-btn')) {
      closeQuickOrder();
    }
  }
});

/* Submit quick order */
async function handleQuickSubmit(e) {
  e.preventDefault();
  const submitBtn = quickSubmitBtn();
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing...';
  }

  // gather fields
  const payload = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    product: (document.getElementById('quickProduct') || {}).value || '',
    name: (document.getElementById('qName') || {}).value || '',
    class: (document.getElementById('qClass') || {}).value || '',
    admission: (document.getElementById('qAdmission') || {}).value || '',
    phone: (document.getElementById('qPhone') || {}).value || ''
  };

  // basic client validation (phone length)
  const phone = payload.phone.replace(/\D/g,'');
  if (!/^\d{10}$/.test(phone)) {
    alert('Please enter a valid 10-digit phone number.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
    return;
  }

  // Optional: client-side simple rate limit
  const last = Number(localStorage.getItem('lastQuickOrderAt') || 0);
  if (Date.now() - last < 10_000) { // 10s throttle
    alert('Please wait a few seconds before placing another order.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
    return;
  }
  localStorage.setItem('lastQuickOrderAt', Date.now());

  try {
    // If your Apps Script supports CORS and returns JSON, remove mode:'no-cors' to read response
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // show success message
    const form = quickForm();
    if (form) form.hidden = true;
    const success = quickSuccess();
    if (success) success.hidden = false;

    // reset button / auto-close after delay
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Order';
      }
      // keep popup open so user sees success, then close
      setTimeout(closeQuickOrder, 1200);
    }, 800);

  } catch (err) {
    console.error('Quick order error:', err);
    alert('We could not place the order right now. Please try again later.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  }
}

/* Attach handlers on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  const form = quickForm();
  if (form) form.addEventListener('submit', handleQuickSubmit);

  // smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
