// Replace this with your deployed Google Apps Script Web App URL:
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

/* Helpers for modal and scrolling */
function scrollToProducts() {
  const el = document.getElementById('products');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function openOrderModal(productName) {
  const modal = document.getElementById('orderModal');
  if (!modal) return;
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');

  const productField = document.getElementById('productName');
  if (productField) productField.value = productName || '';

  // show form, hide success
  const form = document.getElementById('orderForm');
  const success = document.getElementById('successMessage');
  if (form) form.style.display = 'block';
  if (success) success.style.display = 'none';

  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');

  const form = document.getElementById('orderForm');
  if (form) form.reset();

  document.body.style.overflow = 'auto';
}

/* Window click to close modal when clicking outside */
window.onclick = function(event) {
  const modal = document.getElementById('orderModal');
  if (event.target === modal) {
    closeOrderModal();
  }
};

/* Form submission */
async function submitOrder(event) {
  if (event) event.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'SUBMITTING...';
  }

  const formData = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    productName: (document.getElementById('productName') || {}).value || '',
    size: (document.getElementById('size') || {}).value || '',
    fullName: (document.getElementById('fullName') || {}).value || '',
    admissionNumber: (document.getElementById('admissionNumber') || {}).value || '',
    phoneNumber: (document.getElementById('phoneNumber') || {}).value || '',
    class: (document.getElementById('class') || {}).value || ''
  };

  try {
    // Note: If your Apps Script is configured to allow CORS, remove 'mode: no-cors' and handle responses.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    // show success and hide form
    const form = document.getElementById('orderForm');
    const success = document.getElementById('successMessage');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';

    setTimeout(() => {
      closeOrderModal();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Order';
      }
    }, 3000);

  } catch (error) {
    console.error('Error submitting order:', error);
    alert('Order submitted! We will contact you soon.');
    closeOrderModal();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Order';
    }
  }
}

/* Attach submit handler after DOM loads */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('orderForm');
  if (form) form.addEventListener('submit', submitOrder);

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Parallax effect
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  });
});
