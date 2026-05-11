// ===== GLOBAL STATE MANAGER =====

const State = {
  currentPage: 'search',
  package: {
    name: 'Paket Workation Saya',
    penginapan: null,
    nights: 3,
    workspaces: [],
    transport: null,
    activities: [],
  },
  booking: {
    step: 1,
    checkIn: '',
    checkOut: '',
    itinerary: {},
    payment: null,
    bookingCode: '',
  },
  savedPackages: JSON.parse(localStorage.getItem('glow_packages') || '[]'),
  listeners: {},

  get(key) { return this[key]; },

  set(key, value) {
    this[key] = value;
    this.notify(key);
  },

  subscribe(key, fn) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(fn);
  },

  notify(key) {
    (this.listeners[key] || []).forEach(fn => fn(this[key]));
  },

  savePackage() {
    const pkg = { ...this.package, id: Date.now(), saved: new Date().toLocaleDateString('id-ID') };
    this.savedPackages.push(pkg);
    localStorage.setItem('glow_packages', JSON.stringify(this.savedPackages));
  },

  calcTotal() {
    const p = this.package;
    let total = 0;
    if (p.penginapan) total += p.penginapan.price * p.nights;
    p.workspaces.forEach(w => total += w.price * (w.days || 1));
    if (p.transport) total += p.transport.price * p.nights;
    p.activities.forEach(a => total += a.price);
    return total;
  },

  getProgress() {
    const p = this.package;
    let count = 0;
    if (p.penginapan) count++;
    if (p.workspaces.length > 0) count++;
    if (p.transport) count++;
    if (p.activities.length > 0) count++;
    return (count / 4) * 100;
  }
};

// ===== UTILITY FUNCTIONS =====

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '⭐';
  if (half) s += '✨';
  return s;
}

function getCategoryBadge(cat) {
  const map = {
    penginapan: { label: '🏨 Penginapan', cls: 'badge-penginapan' },
    workspace: { label: '☕ Workspace', cls: 'badge-workspace' },
    wisata: { label: '🏖️ Wisata', cls: 'badge-wisata' },
    kuliner: { label: '🍽️ Kuliner', cls: 'badge-kuliner' },
  };
  return map[cat] || { label: cat, cls: '' };
}

function getFacilityIcon(fac) {
  const map = { 'Colokan':'🔌', 'AC':'❄️', 'Kolam Renang':'🏊', 'Parkir':'🅿️', 'Pet-friendly':'🐾', 'Spa':'💆', 'Guide':'🧭' };
  return map[fac] || '✅';
}

function el(tag, cls, html='') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function navigate(page, data={}) {
  State.currentPage = page;
  State._navData = data;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showModal(content) {
  const overlay = el('div', 'modal-overlay fade-in');
  overlay.innerHTML = `<div class="modal slide-up">${content}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return overlay;
}

function closeModal() {
  document.querySelector('.modal-overlay')?.remove();
}
