// ===== TECHMART ADMIN JS =====

// ── Auto-dismiss alerts ────────────────────────
document.querySelectorAll('.alert-auto').forEach(el => {
  setTimeout(() => {
    el.style.transition = 'opacity 0.5s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 4000);
});

// ── Stat counter animation ─────────────────────
document.querySelectorAll('.stat-value').forEach(el => {
  const text = el.textContent.trim();
  const num = parseFloat(text.replace(/[^0-9.]/g, ''));
  if (!num || num === 0) return;
  const prefix = text.match(/^\$/) ? '$' : '';
  let current = 0;
  const duration = 800;
  const step = num / (duration / 16);
  const timer = setInterval(() => {
    current = Math.min(current + step, num);
    el.textContent = prefix + (Number.isInteger(num) ? Math.floor(current) : current.toFixed(2));
    if (current >= num) clearInterval(timer);
  }, 16);
});

// ── Sidebar mobile toggle ──────────────────────
function toggleSidebar() {
  document.getElementById('adminSidebar').classList.toggle('open');
}
// Close sidebar on outside click
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('adminSidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (sidebar && sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) && toggle && !toggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// ── Image preview on file select ──────────────


// ── Delete confirmation ────────────────────────
document.querySelectorAll('form[onsubmit]').forEach(f => {
  // handled inline via onsubmit="return confirm()"
});

// ── Table search filter ────────────────────────
const tableSearch = document.getElementById('tableSearch');
if (tableSearch) {
  tableSearch.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ── Status bar animation on load ──────────────
window.addEventListener('load', () => {
  document.querySelectorAll('.status-seg').forEach(seg => {
    const w = seg.style.width;
    seg.style.width = '0';
    setTimeout(() => { seg.style.width = w; }, 200);
  });
});

// ── Responsive table scroll hint ──────────────
document.querySelectorAll('.table-responsive').forEach(wrap => {
  if (wrap.scrollWidth > wrap.clientWidth) {
    const hint = document.createElement('div');
    hint.innerHTML = '<small style="color:var(--text-muted)"><i class="bi bi-arrow-left-right me-1"></i>Scroll to see more</small>';
    hint.style.cssText = 'text-align:center;padding:6px;display:block';
    wrap.after(hint);
    wrap.addEventListener('scroll', () => hint.remove(), { once: true });
  }
});

// ── Toast for admin ────────────────────────────
function showAdminToast(msg, type='success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const id = 'at_' + Date.now();
  const c = type==='success'
    ? {bg:'#dcfce7',color:'#15803d',border:'#16a34a',icon:'✅'}
    : {bg:'#fee2e2',color:'#dc2626',border:'#dc2626',icon:'❌'};
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast show" style="background:${c.bg};color:${c.color};
      border-left:4px solid ${c.border};border-radius:12px;min-width:240px;
      box-shadow:0 8px 24px rgba(0,0,0,.12)">
      <div class="d-flex align-items-center">
        <div class="toast-body fw-semibold" style="flex:1">${c.icon} ${msg}</div>
        <button class="btn-close me-2" onclick="document.getElementById('${id}').remove()"></button>
      </div>
    </div>
  `);
  setTimeout(() => document.getElementById(id)?.remove(), 3500);
}
