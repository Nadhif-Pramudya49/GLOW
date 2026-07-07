// ===== GLOBAL STATE MANAGER =====

const defaultState = {
  user: null,
  currentPage: 'search',
  favorites: [],
  package: {
    name: 'Paket Workation Saya',
    penginapan: [],
    penginapanSchedule: [],
    nights: 4, // Default to 4
    workspaces: [],
    workspacesSchedule: [],
    meetingDay: null,
    meetingTime: "10:00",
    meetingPax: 2,
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
};

let storedState = null;
try {
  const saved = localStorage.getItem('glow_app_state');
  if (saved) {
    storedState = JSON.parse(saved);
  }
} catch (e) {}

const State = storedState ? { ...defaultState, ...storedState, listeners: {} } : { ...defaultState };

// Ensure favorites is always an array (migration for old local storage)
if (!State.favorites) State.favorites = [];

// Migrate old penginapan format (Object) to new format (Array)
if (State.package) {
  if (State.package.penginapan && !Array.isArray(State.package.penginapan)) {
    State.package.penginapan = [State.package.penginapan];
  } else if (!State.package.penginapan) {
    State.package.penginapan = [];
  }
  if (!State.package.workspaces) State.package.workspaces = [];
  if (!State.package.activities) State.package.activities = [];
  
  State.package.penginapan = State.package.penginapan.filter(Boolean);
  State.package.workspaces = State.package.workspaces.filter(Boolean);
  State.package.activities = State.package.activities.filter(Boolean);
  
  if (!State.package.penginapanSchedule) State.package.penginapanSchedule = [];
  
  // Force auto-split if there is a hotel but no schedule
  if (State.package.penginapan.length > 0 && State.package.penginapanSchedule.length === 0) {
    // Basic logic directly here to avoid calling methods not yet bound
    const nights = State.package.nights || 4;
    State.package.penginapanSchedule = Array(nights).fill(State.package.penginapan[0].id);
  }
  
  if (!State.package.workspacesSchedule) State.package.workspacesSchedule = [];
  if (State.package.meetingDay === undefined) State.package.meetingDay = null;
  if (State.package.meetingTime === undefined) State.package.meetingTime = "10:00";
  if (State.package.meetingPax === undefined) State.package.meetingPax = 2;
  
  // Force auto-split if there is a workspace but no schedule
  if (State.package.workspaces.length > 0 && State.package.workspacesSchedule.length === 0) {
    const nights = State.package.nights || 4;
    let schedule = [];
    const ws = State.package.workspaces;
    for (let i=0; i<nights; i++) {
       schedule.push(ws[i % ws.length].id);
    }
    State.package.workspacesSchedule = schedule;
  }
}

// Re-assign methods since JSON.parse drops them
Object.assign(State, {
  get(key) { return this[key]; },

  set(key, value) {
    this[key] = value;
    this.saveAppState();
    this.notify(key);
  },

  subscribe(key, fn) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(fn);
  },

  notify(key) {
    (this.listeners[key] || []).forEach(fn => fn(this[key]));
  },

  async savePackage() {
    if (!this.user) {
      alert("Silakan login terlebih dahulu untuk menyimpan paket.");
      return;
    }
    const pkg = { ...this.package };
    try {
      const savedObj = await PackageService.savePackage(pkg);
      // Format it for the frontend State
      const formatted = { 
        ...pkg, 
        _dbId: savedObj.id, 
        name: savedObj.name, 
        saved: new Date(savedObj.createdAt).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}) 
      };
      this.savedPackages.push(formatted);
      this.notify('savedPackages');
    } catch(e) {
      alert("Gagal menyimpan paket: " + e.message);
    }
  },

  saveAppState() {
    try {
      const toSave = {
        user: this.user,
        currentPage: this.currentPage,
        package: this.package,
        booking: this.booking,
        favorites: this.favorites
      };
      localStorage.setItem('glow_app_state', JSON.stringify(toSave));
    } catch(e) {}
  },

  autoSplitPenginapan() {
    const p = this.package;
    if (!p.penginapan || p.penginapan.length === 0) {
      p.penginapanSchedule = [];
      return;
    }
    
    // Split the nights across the chosen accommodations
    const nights = p.nights || 4;
    const hotels = p.penginapan;
    const schedule = [];
    
    const nightsPerHotel = Math.floor(nights / hotels.length);
    let remainder = nights % hotels.length;
    
    for (let i = 0; i < hotels.length; i++) {
      let daysForThisHotel = nightsPerHotel + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      
      for (let j = 0; j < daysForThisHotel; j++) {
        schedule.push(hotels[i].id);
      }
    }
    p.penginapanSchedule = schedule;
  },

  syncSchedules(newNights) {
    const adjustArr = (arr, items) => {
      if (!arr || !items || items.length === 0) return [];
      if (arr.length > newNights) return arr.slice(0, newNights);
      const newArr = [...arr];
      const toAdd = newNights - arr.length;
      for (let i = 0; i < toAdd; i++) {
        newArr.push(items[i % items.length].id);
      }
      return newArr;
    };
    
    const penginapanArr = Array.isArray(this.package.penginapan) ? this.package.penginapan : (this.package.penginapan ? [this.package.penginapan] : []);
    this.package.penginapanSchedule = adjustArr(this.package.penginapanSchedule, penginapanArr);
    this.package.workspacesSchedule = adjustArr(this.package.workspacesSchedule, this.package.workspaces);
    this.package.nights = newNights;
    
    this.saveAppState();
  },

  autoSplitWorkspaces() {
    const p = this.package;
    if (!p.workspaces || p.workspaces.length === 0) {
      p.workspacesSchedule = [];
      return;
    }
    
    // Split the nights across the chosen workspaces (round-robin as default recommendation)
    const nights = p.nights || 4;
    const ws = p.workspaces;
    const schedule = [];
    
    // Simple round robin
    for (let i = 0; i < nights; i++) {
      schedule.push(ws[i % ws.length].id);
    }
    p.workspacesSchedule = schedule;
  },

  calcTotal() {
    const p = this.package;
    let total = 0;
    
    // Calculate based on penginapanSchedule
    if (p.penginapanSchedule && p.penginapanSchedule.length > 0) {
      p.penginapanSchedule.forEach(hotelId => {
        const hotel = p.penginapan.find(h => h.id === hotelId);
        if (hotel) total += hotel.price;
      });
    }

    if (p.workspacesSchedule && p.workspacesSchedule.length > 0) {
      p.workspacesSchedule.forEach(wsId => {
        if (wsId !== 'libur') {
          const ws = p.workspaces.find(w => w.id === wsId);
          if (ws) total += ws.price;
        }
      });
    }

    if (p.transport) total += (p.transport.price || 0) * (p.nights || 4);
    p.activities.forEach(a => total += a.price);
    return total;
  },

  getProgress() {
    const p = this.package;
    let count = 0;
    if (p.penginapan && p.penginapan.length > 0) count++;
    if (p.workspaces.length > 0) count++;
    if (p.transport) count++;
    if (p.activities.length > 0) count++;
    return (count / 4) * 100;
  },

  // ===== FAVORITES HELPERS =====
  addFavorite(id) {
    const strId = String(id);
    if (!this.favorites.includes(strId)) {
      this.set('favorites', [...this.favorites, strId]);
      FavoriteService.addFavorite(strId).catch(e => {
        console.warn('Failed to add favorite in backend', e);
      });
    }
  },
  
  removeFavorite(id) {
    const strId = String(id);
    this.set('favorites', this.favorites.filter(favId => favId !== strId));
    FavoriteService.removeFavorite(strId).catch(e => {
      console.warn('Failed to remove favorite in backend', e);
    });
  },
  
  toggleFavorite(id) {
    if (!this.user) {
      if (typeof showLoginRequiredPopup === 'function') showLoginRequiredPopup('Silakan login terlebih dahulu untuk menyimpan favorit.');
      return false;
    }
    const strId = String(id);
    if (this.isFavorite(strId)) {
      this.removeFavorite(strId);
      return false;
    } else {
      this.addFavorite(strId);
      return true;
    }
  },
  
  isFavorite(id) {
    return this.favorites.includes(String(id));
  }
});

// ===== UTILITY FUNCTIONS =====

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '★';
  return s;
}

function getCategoryBadge(item) {
  const cat = typeof item === 'string' ? item : item.category;
  const map = {
    penginapan: { label: (item && item.type) || 'Akomodasi', cls: 'badge-penginapan' },
    workspace: { label: 'Cafe & Coworking', cls: 'badge-workspace' },
    wisata: { label: 'Wisata', cls: 'badge-wisata' },
    kuliner: { label: 'Kuliner', cls: 'badge-kuliner' },
  };
  return map[cat] || { label: cat, cls: '' };
}

function getFacilityIcon(fac) {
  const map = {
    'Colokan': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11V7a4 4 0 1 1 8 0v4"/><path d="M8 11h8v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V11z"/></svg>',
    'AC': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'Kolam Renang': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-4 5-4 5 4 5 4 5-4 5-4 5 4 5 4"/></svg>',
    'Parkir': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16V8h4a2 2 0 1 1 0 4H9"/></svg>',
    'Pet-friendly': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="18" cy="8" r="2"/><circle cx="6" cy="8" r="2"/><circle cx="16" cy="17" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
    'Spa': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
    'Guide': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    'WiFi': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>'
  };
  // Normalize string for WiFi match
  if (fac && fac.toLowerCase().includes('wifi')) {
    return map['WiFi'];
  }
  return map[fac] || '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}

function el(tag, cls, html='') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function navigate(page, data={}) {
  State._navData = data;
  
  let hash = '#' + page;
  if (Object.keys(data).length > 0) {
    const params = new URLSearchParams(data).toString();
    hash += '?' + params;
    State.currentPage = page + '?' + params;
  } else {
    State.currentPage = page;
  }
  
  State.saveAppState();
  window.history.pushState(data, '', hash);
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showModal(content, options = { closeOnBackdrop: true }) {
  const overlay = el('div', 'modal-overlay fade-in');
  const modal = el('div', 'modal slide-up');
  
  if (typeof content === 'string') {
    modal.innerHTML = content;
  } else {
    modal.appendChild(content);
  }
  
  overlay.appendChild(modal);
  if (options.closeOnBackdrop) {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }
  document.body.appendChild(overlay);
  return overlay;
}

function closeModal() {
  document.querySelector('.modal-overlay')?.remove();
}
