// ===== TECHMART MAIN JS =====

// ── Toast ──────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const id = 'toast_' + Date.now();
  const colors = {
    success: { bg: '#dcfce7', color: '#15803d', border: '#16a34a', icon: '✅' },
    error:   { bg: '#fee2e2', color: '#dc2626', border: '#dc2626', icon: '❌' },
    info:    { bg: '#dbeafe', color: '#1d4ed8', border: '#3b82f6', icon: 'ℹ️' },
    warn:    { bg: '#fef3c7', color: '#d97706', border: '#f59e0b', icon: '⚠️' }
  };
  const c = colors[type] || colors.info;
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast show" role="alert"
         style="background:${c.bg};color:${c.color};border-left:4px solid ${c.border};
                border-radius:12px;min-width:260px;box-shadow:0 8px 24px rgba(0,0,0,0.12)">
      <div class="d-flex align-items-center">
        <div class="toast-body fw-semibold" style="flex:1">${c.icon} ${message}</div>
        <button type="button" class="btn-close me-2" onclick="document.getElementById('${id}').remove()"></button>
      </div>
    </div>
  `);
  setTimeout(() => document.getElementById(id)?.remove(), 3500);
}

// ── Add to Cart ────────────────────────────────
document.addEventListener('click', async function(e) {
  const btn = e.target.closest('[data-add-cart]');
  if (!btn) return;
  e.preventDefault();
  const productId = btn.dataset.addCart;
  const qtyEl = document.getElementById('qtyInput');
  const qty = qtyEl ? parseInt(qtyEl.value) : 1;
  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Adding...';

  try {
    const res = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: qty })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Added to cart!', 'success');
      // Animate cart badge
      document.querySelectorAll('.cart-badge').forEach(el => {
        el.textContent = data.cartCount;
        el.style.display = 'flex';
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = 'pulse 0.4s ease';
      });
      // Button feedback
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Added!';
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
      }, 1500);
      return;
    } else if (res.status === 401 || (data.message && data.message.toLowerCase().includes('login'))) {
      window.location.href = '/auth/login';
      return;
    } else {
      showToast(data.message || 'Could not add to cart', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
  }
  btn.disabled = false;
  btn.innerHTML = originalHTML;
});

// ── Qty Input Controls ─────────────────────────
function changeQty(delta) {
  const input = document.getElementById('qtyInput');
  if (!input) return;
  const max = parseInt(input.max) || 999;
  const newVal = Math.min(max, Math.max(1, parseInt(input.value || 1) + delta));
  input.value = newVal;
}

// ── Wishlist Toggle (UI only) ──────────────────
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.wish-btn');
  if (!btn) return;
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  icon.className = btn.classList.contains('active') ? 'bi bi-heart-fill' : 'bi bi-heart';
  showToast(btn.classList.contains('active') ? 'Added to favourites!' : 'Removed from favourites', 'info');
});

// ── Delivery Toggle ────────────────────────────
document.querySelectorAll('.delivery-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.delivery-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const inp = document.getElementById('deliveryType');
    if (inp) inp.value = this.dataset.type;
  });
});

// ── Payment Selection ──────────────────────────
document.querySelectorAll('.payment-option').forEach(opt => {
  opt.addEventListener('click', function() {
    document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
    this.classList.add('selected');
    const radio = this.querySelector('input[type=radio]');
    if (radio) radio.checked = true;
  });
});

// ── Image Preview ──────────────────────────────
const imgInput = document.getElementById('productImage');
const imgPreview = document.getElementById('imgPreview');
if (imgInput && imgPreview) {
  imgInput.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
}

// ── Price Range Slider ─────────────────────────
const priceRange = document.getElementById('priceRange');
const rangeMax   = document.getElementById('rangeMax');
const maxPriceInput = document.getElementById('maxPriceInput');
if (priceRange) {
  priceRange.addEventListener('input', function() {
    if (rangeMax)    rangeMax.textContent = '$' + this.value;
    if (maxPriceInput) maxPriceInput.value = this.value;
  });
}

// ── Product Detail Tabs ────────────────────────
document.querySelectorAll('.detail-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const target = this.dataset.tab;
    document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById(target)?.classList.add('active');
  });
});

// ── Back to Top ────────────────────────────────
const btt = document.createElement('button');
btt.id = 'backToTop';
btt.innerHTML = '<i class="bi bi-arrow-up"></i>';
btt.title = 'Back to top';
document.body.appendChild(btt);
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 400);
});
btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Page Progress Bar ──────────────────────────
const bar = document.createElement('div');
bar.className = 'page-progress';
document.body.prepend(bar);
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';
});

// ── Mobile Search Toggle ───────────────────────
const mobileSearchToggle = document.getElementById('mobileSearchToggle');
if (mobileSearchToggle) {
  mobileSearchToggle.addEventListener('click', () => {
    const bar = document.getElementById('mobileSearchBar');
    if (bar) { bar.style.display = bar.style.display === 'none' ? 'block' : 'none'; }
  });
}

// ── Auto dismiss alerts ────────────────────────
document.querySelectorAll('.alert-auto').forEach(el => {
  setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 4000);
});
