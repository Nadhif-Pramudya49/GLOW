// ===== PAGE: SEARCH =====

let mapInstance = null;
let API_DATA = null; // Store for fetched API data
let searchState = {
  query: '', category: 'penginapan',
  budget: [100000, 1500000], wifi: 0,
  suasana: [], rating: 0,
  facilities: [], showMap: false,
  inspirationMode: false,
  sortBy: 'rating',   // 'rating' | 'price_asc' | 'price_desc'
};

async function renderSearchPage() {
  const page = el('div', 'page fade-in');

  // Fetch data if not already fetched
  if (!API_DATA) {
    page.innerHTML = `
      <div style="max-width:1280px; margin:0 auto; padding:5rem 1.5rem;">
        <div style="margin-bottom:2rem;">
          <div style="height:40px; width:200px; background:var(--gray-200); border-radius:8px; margin-bottom:1rem; animation:pulse 1.5s infinite;"></div>
          <div style="height:20px; width:300px; background:var(--gray-200); border-radius:4px; animation:pulse 1.5s infinite;"></div>
        </div>
        <div class="grid-3">
          ${Array(6).fill().map(() => `
            <div class="card" style="border:1px solid var(--gray-100); box-shadow:none;">
              <div style="height:200px; background:var(--gray-200); animation:pulse 1.5s infinite;"></div>
              <div class="card-body">
                <div style="height:20px; width:60%; background:var(--gray-200); border-radius:4px; margin-bottom:1rem; animation:pulse 1.5s infinite;"></div>
                <div style="height:15px; width:40%; background:var(--gray-200); border-radius:4px; margin-bottom:1.5rem; animation:pulse 1.5s infinite;"></div>
                <div style="height:36px; width:100%; background:var(--gray-200); border-radius:8px; animation:pulse 1.5s infinite;"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <style>@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }</style>
      </div>`;
    
    try {
      API_DATA = await LocationService.getLocations();

      setTimeout(renderApp, 0);
      return page;
    } catch (error) {
      console.error('API Fetch Error:', error);
      if (typeof DATA !== 'undefined') {
        API_DATA = DATA;
        setTimeout(renderApp, 0);
        return page;
      }
      page.innerHTML = `<div style="text-align:center;padding:8rem 1rem;color:var(--gray-500);max-width:500px;margin:0 auto;">
        <svg style="width:64px;height:64px;margin-bottom:1.5rem;color:var(--gray-300);display:inline-block;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <h3 style="font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--gray-800);margin-bottom:0.5rem;">Gagal memuat data destinasi.</h3>
        <p style="margin-bottom:2rem;line-height:1.6;">Periksa koneksi atau coba beberapa saat lagi.</p>
        <button class="btn btn-primary" onclick="renderApp()">
          <svg style="width:16px;height:16px;margin-right:0.5rem;display:inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Coba Lagi
        </button>
      </div>`;
      return page;
    }
  }

  // Hero slides data
  const heroSlides = [
    { img: 'assets/images/hero-beach.png',   label: '📍 Pantai Indrayanti, Gunung Kidul' },
    { img: 'assets/images/hero-culture.png', label: '☕ Workation Cafe Khas Jogja' },
    { img: 'assets/images/hero-aerial.png',  label: '🏔️ Perbukitan Karst Gunung Kidul' },
  ];

  // Hero
  const hero = el('div', 'hero');
  hero.innerHTML = `
    <div class="hero-slideshow" id="hero-slideshow">
      ${heroSlides.map((s, i) => `
        <div class="hero-slide ${i===0?'active':''}" style="background-image:url('${s.img}')" data-label="${s.label}"></div>
      `).join('')}
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-tint"></div>
    <div class="hero-slide-label visible" id="hero-slide-label">${heroSlides[0].label}</div>
    <div class="hero-dots" id="hero-dots">
      ${heroSlides.map((_, i) => `<button class="hero-dot ${i===0?'active':''}" onclick="goToSlide(${i})" aria-label="Slide ${i+1}"></button>`).join('')}
    </div>
    <div class="hero-content">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,166,35,0.2);border:1px solid rgba(245,166,35,0.4);border-radius:100px;padding:6px 16px;margin-bottom:1.5rem;font-size:0.875rem;color:var(--gold)">
        ✨ Workation Platform #1 di Gunung Kidul
      </div>
      <h1 class="hero-title">Temukan <span>workation spot</span><br/>sempurna di Gunung Kidul </h1>
      <p class="hero-sub">Cari hotel, cafe, wisata, kuliner semua dalam satu platform terintegrasi</p>
      <div class="search-bar">
        <span style="font-size:1.25rem">🔍</span>
        <input type="text" id="hero-search" placeholder="Cari tempat, cafe, wisata..." value="${searchState.query}" oninput="handleSearch(this.value)" />
        <button class="btn btn-primary" onclick="applySearch()">Cari Sekarang</button>
      </div>
      <div class="tabs mt-4" style="justify-content:center">
        ${[['penginapan','🏨 Penginapan'],['workspace','☕ Workspace/Cafe'],['wisata','🏖️ Wisata'],['kuliner','🍽️ Kuliner']].map(([id,label])=>`
          <button class="tab-btn ${searchState.category===id?'active':''}" onclick="setCategory('${id}')">${label}</button>
        `).join('')}
      </div>
    </div>
  `;
  page.appendChild(hero);

  setTimeout(initHeroSlideshow, 50);

  const inspBar = el('div', 'container', '');
  inspBar.style.cssText = 'padding-top:1.5rem;display:flex;justify-content:flex-end;gap:1rem';
  inspBar.innerHTML = `
    <button class="btn btn-ghost" onclick="toggleInspiration()" id="insp-btn">
      ${searchState.inspirationMode ? '🎨 Keluar Inspiration Mode' : '🌟 Inspiration Mode'}
    </button>
    <button class="btn btn-ghost" onclick="toggleMap()" id="map-btn">
      ${searchState.showMap ? '🗺️ Sembunyikan Peta' : '🗺️ Tampilkan Peta'}
    </button>
  `;
  page.appendChild(inspBar);

  if (searchState.inspirationMode) {
    page.appendChild(renderInspirationMode());
    return page;
  }

  if (searchState.showMap) {
    const mapSec = el('div', 'container mt-4');
    mapSec.innerHTML = `<div class="map-container"><div id="map"></div></div>`;
    page.appendChild(mapSec);
  }

  const main = el('div', 'container', '');
  main.style.cssText = 'padding-top:2rem;padding-bottom:4rem';
  const layout = el('div', 'sidebar-layout');
  layout.appendChild(renderFilterSidebar());
  const results = el('div', '');
  results.appendChild(renderSearchResults());
  layout.appendChild(results);
  main.appendChild(layout);
  page.appendChild(main);

  if (searchState.showMap) {
    setTimeout(initMap, 100);
  }

  return page;
}

function renderFilterSidebar() {
  const sidebar = el('div', 'filter-sidebar');
  sidebar.innerHTML = `
    <div class="filter-title">🎛️ Filter Pencarian</div>
    <div class="filter-section">
      <div class="filter-section-label">Budget (per malam/hari)</div>
      <div id="budget-label" style="font-size:0.875rem;font-weight:600;color:var(--green);margin-bottom:8px">
        ${formatRupiah(searchState.budget[0])} – ${formatRupiah(searchState.budget[1])}
      </div>
      <input type="range" class="range-slider" id="budget-min" min="100000" max="1500000" step="50000"
        value="${searchState.budget[0]}" oninput="updateBudget('min',this.value)" />
      <input type="range" class="range-slider" id="budget-max" min="100000" max="1500000" step="50000"
        value="${searchState.budget[1]}" oninput="updateBudget('max',this.value)" />
    </div>
    <div class="filter-section">
      <div class="filter-section-label">Kecepatan WiFi</div>
      ${[['0','Tidak perlu'],['10','> 10 Mbps'],['50','> 50 Mbps'],['100','> 100 Mbps']].map(([v,l])=>`
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;font-size:0.875rem">
          <input type="radio" name="wifi" value="${v}" ${searchState.wifi==v?'checked':''} onchange="searchState.wifi=${v};renderApp()" style="accent-color:var(--green)" />
          ${l}
        </label>
      `).join('')}
    </div>
    <div class="filter-section">
      <div class="filter-section-label">Suasana</div>
      <div class="flex flex-wrap gap-2">
        ${['Tenang','Outdoor','Pantai','Petualangan','Pemandangan laut','Sunrise','Seafood','Tradisional'].map(s=>`
          <span class="chip ${searchState.suasana.includes(s)?'active':''}" onclick="toggleSuasana('${s}')">${s}</span>
        `).join('')}
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-section-label">Rating Minimum</div>
      <div class="star-input" id="rating-filter">
        ${[1,2,3,4,5].map(n=>`<span class="${n<=searchState.rating?'active':''}" onclick="setRatingFilter(${n})">★</span>`).join('')}
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-section-label">Fasilitas</div>
      ${['Colokan','AC','Kolam Renang','Parkir','Spa','Guide'].map(f=>`
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;font-size:0.875rem">
          <input type="checkbox" ${searchState.facilities.includes(f)?'checked':''} onchange="toggleFacility('${f}')" style="accent-color:var(--green)" />
          ${getFacilityIcon(f)} ${f}
        </label>
      `).join('')}
    </div>
    <button class="btn btn-secondary btn-full" onclick="applyFilters()">✅ Terapkan Filter</button>
    <button class="btn btn-ghost btn-full mt-2" onclick="resetFilters()">↺ Reset</button>
  `;
  return sidebar;
}

function renderSearchResults() {
  const wrap = el('div', '');
  const items = getFilteredItems();
  const header = el('div', 'flex items-center justify-between mb-3');
  header.innerHTML = `
    <div>
      <span style="font-weight:700;color:var(--gray-700)">${items.length} tempat ditemukan</span>
      <span style="font-size:0.875rem;color:var(--gray-400);margin-left:8px">• ${searchState.category === 'penginapan' ? '🏨 Penginapan' : searchState.category === 'workspace' ? '☕ Workspace' : searchState.category === 'wisata' ? '🏖️ Wisata' : '🍽️ Kuliner'}</span>
    </div>
    <select class="form-input" style="width:auto;padding:6px 12px" onchange="sortResults(this.value)">
      <option value="rating"   ${searchState.sortBy==='rating'   ?'selected':''}>Urutkan: Rating Terbaik</option>
      <option value="price_asc" ${searchState.sortBy==='price_asc'?'selected':''}>Harga Terendah</option>
      <option value="price_desc" ${searchState.sortBy==='price_desc'?'selected':''}>Harga Tertinggi</option>
    </select>
  `;
  wrap.appendChild(header);
  const grid = el('div', 'grid-3');
  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gray-400)"><p>Tidak ada hasil ditemukan.</p></div>`;
  } else {
    items.forEach(item => grid.appendChild(renderItemCard(item)));
  }
  wrap.appendChild(grid);
  return wrap;
}

function renderInspirationMode() {
  const allItems = [...(API_DATA.penginapan||[]), ...(API_DATA.workspace||[]), ...(API_DATA.wisata||[]), ...(API_DATA.kuliner||[])];
  const heights = [220, 280, 200, 260, 240, 300];
  const sec = el('div', 'container', '');
  sec.style.cssText = 'padding-top:2rem;padding-bottom:4rem';
  sec.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem">
      <h2 class="section-title">🌟 Inspirasi Workation</h2>
    </div>
    <div class="masonry">
      ${allItems.map((item, i) => `
        <div class="masonry-item" style="height:${heights[i % heights.length]}px" onclick="openDetail('${item.id}','${item.category}')">
          <div style="width:100%;height:100%;background:url('${item.img}') center/cover no-repeat;"></div>
          <div class="masonry-overlay">
            <div style="color:#fff;font-weight:700;font-size:0.9rem">${item.name}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  return sec;
}

function getFilteredItems() {
  let items = (API_DATA && API_DATA[searchState.category]) || [];
  
  // Text search
  if (searchState.query) {
    const q = searchState.query.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.desc||'').toLowerCase().includes(q));
  }

  const filteredItems = items; // Temporary variable to log
  console.log("FILTERED (" + searchState.category + "):", filteredItems);

  // Budget filter (wisata gratis selalu lolos)
  if (+searchState.wifi > 0) items = items.filter(i => i.wifi >= +searchState.wifi);
  if (searchState.rating > 0) items = items.filter(i => i.rating >= searchState.rating);
  if (searchState.suasana.length > 0) {
    items = items.filter(i => searchState.suasana.some(sel => (i.suasana || []).some(s => s.toLowerCase().includes(sel.toLowerCase()))));
  }
  if (searchState.facilities.length > 0) {
    items = items.filter(i => searchState.facilities.every(f => (i.facilities || []).includes(f)));
  }
  if (searchState.sortBy === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (searchState.sortBy === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);
  else items = [...items].sort((a, b) => b.rating - a.rating);
  return items;
}

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.L || !API_DATA) return;
  if (mapInstance) { mapInstance.remove(); mapInstance = null; }
  mapInstance = L.map('map').setView([-8.15, 110.61], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(mapInstance);

  const allItems = [...(API_DATA.penginapan||[]), ...(API_DATA.workspace||[]), ...(API_DATA.wisata||[]), ...(API_DATA.kuliner||[])];
  allItems.forEach(item => {
    const icon = L.divIcon({
      html: `<div style="background:#1a4a3a;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid #fff">📍</div>`,
      iconSize: [32, 32], iconAnchor: [16, 16], className: ''
    });
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(mapInstance);
    marker.bindPopup(`<strong>${item.name}</strong><br/>⭐ ${item.rating}`);
  });
}

function handleSearch(val) { searchState.query = val; }
function applySearch() { renderApp(); }
function setCategory(cat) { searchState.category = cat; renderApp(); }
function toggleMap() { searchState.showMap = !searchState.showMap; renderApp(); }
function toggleInspiration() { searchState.inspirationMode = !searchState.inspirationMode; renderApp(); }
function updateBudget(type, val) {
  const v = +val;
  if (type === 'min') searchState.budget[0] = Math.min(v, searchState.budget[1]);
  else searchState.budget[1] = Math.max(v, searchState.budget[0]);
  const lbl = document.getElementById('budget-label');
  if (lbl) lbl.textContent = `${formatRupiah(searchState.budget[0])} – ${formatRupiah(searchState.budget[1])}`;
}
function toggleSuasana(s) {
  const idx = searchState.suasana.indexOf(s);
  if (idx >= 0) searchState.suasana.splice(idx, 1); else searchState.suasana.push(s);
  renderApp();
}
function toggleFacility(f) {
  const idx = searchState.facilities.indexOf(f);
  if (idx >= 0) searchState.facilities.splice(idx, 1); else searchState.facilities.push(f);
  renderApp();
}
function setRatingFilter(n) { searchState.rating = searchState.rating === n ? 0 : n; renderApp(); }
function applyFilters() { renderApp(); showToast('✅ Filter diterapkan!'); }
function resetFilters() {
  searchState = { ...searchState, budget:[100000,1500000], wifi:0, suasana:[], rating:0, facilities:[] };
  renderApp();
}
function sortResults(by) { searchState.sortBy = by; renderApp(); }
