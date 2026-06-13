// ===== PAGE: SEARCH =====

let mapInstance = null;
let searchState = {
  query: '', category: 'penginapan',
  budget: [100000, 1500000], wifi: 0,
  suasana: [], rating: 0,
  facilities: [], showMap: false,
  inspirationMode: false,
  sortBy: 'rating',   // 'rating' | 'price_asc' | 'price_desc'
};

function renderSearchPage() {
  const page = el('div', 'page fade-in');

  // Hero slides data
  const heroSlides = [
    { img: 'img/hero-beach.png',   label: '📍 Pantai Indrayanti, Gunung Kidul' },
    { img: 'img/hero-culture.png', label: '☕ Workation Cafe Khas Jogja' },
    { img: 'img/hero-aerial.png',  label: '🏔️ Perbukitan Karst Gunung Kidul' },
  ];

  // Hero
  const hero = el('div', 'hero');
  hero.innerHTML = `
    <!-- Slideshow background -->
    <div class="hero-slideshow" id="hero-slideshow">
      ${heroSlides.map((s, i) => `
        <div class="hero-slide ${i===0?'active':''}" style="background-image:url('${s.img}')" data-label="${s.label}"></div>
      `).join('')}
    </div>

    <!-- Overlays -->
    <div class="hero-overlay"></div>
    <div class="hero-tint"></div>

    <!-- Slide location label -->
    <div class="hero-slide-label visible" id="hero-slide-label">${heroSlides[0].label}</div>

    <!-- Dot indicators -->
    <div class="hero-dots" id="hero-dots">
      ${heroSlides.map((_, i) => `<button class="hero-dot ${i===0?'active':''}" onclick="goToSlide(${i})" aria-label="Slide ${i+1}"></button>`).join('')}
    </div>

    <!-- Content -->
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

  // Init slideshow after DOM is inserted
  setTimeout(initHeroSlideshow, 50);

  // Inspiration toggle
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

  // Map
  if (searchState.showMap) {
    const mapSec = el('div', 'container mt-4');
    mapSec.innerHTML = `<div class="map-container"><div id="map"></div></div>`;
    page.appendChild(mapSec);
  }

  // Main layout
  const main = el('div', 'container', '');
  main.style.cssText = 'padding-top:2rem;padding-bottom:4rem';
  const layout = el('div', 'sidebar-layout');

  // Sidebar filter
  layout.appendChild(renderFilterSidebar());

  // Results
  const results = el('div', '');
  results.appendChild(renderSearchResults());
  layout.appendChild(results);
  main.appendChild(layout);
  page.appendChild(main);

  // Init map after render
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
      <div style="font-size:0.75rem;color:var(--gray-400);margin-top:4px">
        Geser slider lalu klik Terapkan Filter
      </div>
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
      <div style="font-size:0.75rem;color:var(--gray-400);margin-top:4px">${searchState.rating > 0 ? `≥ ${searchState.rating} bintang` : 'Semua rating'}</div>
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
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gray-400)">
      <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
      <p>Tidak ada hasil ditemukan. Coba ubah filter.</p>
    </div>`;
  } else {
    items.forEach(item => grid.appendChild(renderItemCard(item)));
  }
  wrap.appendChild(grid);
  return wrap;
}

function renderInspirationMode() {
  const allItems = [...DATA.penginapan, ...DATA.workspace, ...DATA.wisata, ...DATA.kuliner];
  const catColors = { penginapan:'#1d4ed8', workspace:'#065f46', wisata:'#9d174d', kuliner:'#92400e' };
  const catLabels = { penginapan:'🏨 Penginapan', workspace:'☕ Workspace', wisata:'🏖️ Wisata', kuliner:'🍽️ Kuliner' };
  // Varied heights for masonry effect
  const heights = [220, 280, 200, 260, 240, 300, 210, 270, 190, 250, 230, 280,
                   200, 260, 220, 290, 210, 240, 270, 200, 250, 230, 280, 260];
  const sec = el('div', 'container', '');
  sec.style.cssText = 'padding-top:2rem;padding-bottom:4rem';
  sec.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem">
      <h2 class="section-title">🌟 Inspirasi Workation</h2>
      <p class="section-sub">Temukan tempat impianmu melalui galeri foto indah</p>
    </div>
    <div class="masonry">
      ${allItems.map((item, i) => `
        <div class="masonry-item" style="height:${heights[i % heights.length]}px" onclick="openDetail('${item.id}','${item.category}')">
          <div style="width:100%;height:100%;background:url('${item.img}') center/cover no-repeat;"></div>
          <div class="masonry-overlay">
            <span style="display:inline-block;background:${catColors[item.category]};color:#fff;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:100px;margin-bottom:4px">${catLabels[item.category]}</span>
            <div style="color:#fff;font-weight:700;font-size:0.9rem;text-shadow:0 1px 4px rgba(0,0,0,0.6)">${item.name}</div>
            <button class="btn btn-primary btn-sm mt-1" onclick="event.stopPropagation();openDetail('${item.id}','${item.category}')">Explore →</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  return sec;
}

function getFilteredItems() {
  let items = DATA[searchState.category] || [];

  // Text search
  if (searchState.query) {
    const q = searchState.query.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.desc||'').toLowerCase().includes(q));
  }

  // Budget filter (wisata gratis selalu lolos)
  items = items.filter(i => i.price === 0 || (i.price >= searchState.budget[0] && i.price <= searchState.budget[1]));

  // WiFi filter
  if (+searchState.wifi > 0) items = items.filter(i => i.wifi >= +searchState.wifi);

  // Rating filter
  if (searchState.rating > 0) items = items.filter(i => i.rating >= searchState.rating);

  // Suasana filter — partial match (lowercase, any token)
  if (searchState.suasana.length > 0) {
    items = items.filter(i =>
      searchState.suasana.some(sel =>
        (i.suasana || []).some(s => s.toLowerCase().includes(sel.toLowerCase()))
      )
    );
  }

  // Fasilitas filter — ALL must be present
  if (searchState.facilities.length > 0) {
    items = items.filter(i =>
      searchState.facilities.every(f => (i.facilities || []).includes(f))
    );
  }

  // Sort
  if (searchState.sortBy === 'price_asc') {
    items = [...items].sort((a, b) => a.price - b.price);
  } else if (searchState.sortBy === 'price_desc') {
    items = [...items].sort((a, b) => b.price - a.price);
  } else {
    items = [...items].sort((a, b) => b.rating - a.rating);
  }

  return items;
}

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.L) return;
  if (mapInstance) { mapInstance.remove(); mapInstance = null; }
  mapInstance = L.map('map').setView([-8.15, 110.61], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);

  const colorMap = { penginapan:'#1d4ed8', workspace:'#065f46', wisata:'#9d174d', kuliner:'#92400e' };
  const allItems = [...DATA.penginapan, ...DATA.workspace, ...DATA.wisata, ...DATA.kuliner];
  allItems.forEach(item => {
    const color = colorMap[item.category] || '#333';
    const icon = L.divIcon({
      html: `<div style="background:${color};color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
        ${{penginapan:'🏨',workspace:'☕',wisata:'🏖️',kuliner:'🍽️'}[item.category]}
      </div>`,
      iconSize: [32, 32], iconAnchor: [16, 16], className: ''
    });
    const priceStr = item.price === 0 ? 'Gratis' : formatRupiah(item.price);
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(mapInstance);
    marker.bindPopup(`
      <div style="min-width:180px;font-family:'Inter',sans-serif">
        <img src="${item.img}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px" />
        <strong style="font-size:0.875rem">${item.name}</strong><br/>
        <span style="color:#F5A623">⭐ ${item.rating}</span>
        <span style="float:right;font-weight:700;color:#1a4a3a">${priceStr}</span>
      </div>
    `);
  });
}

// Event handlers
function handleSearch(val) { searchState.query = val; }
function applySearch() { renderApp(); }
function setCategory(cat) { searchState.category = cat; renderApp(); }
function toggleMap() { searchState.showMap = !searchState.showMap; renderApp(); }
function toggleInspiration() { searchState.inspirationMode = !searchState.inspirationMode; renderApp(); }
function updateBudget(type, val) {
  const v = +val;
  if (type === 'min') {
    // Jangan biarkan min > max
    searchState.budget[0] = Math.min(v, searchState.budget[1]);
  } else {
    // Jangan biarkan max < min
    searchState.budget[1] = Math.max(v, searchState.budget[0]);
  }
  // Update slider value in DOM without full re-render for better UX
  const minEl = document.getElementById('budget-min');
  const maxEl = document.getElementById('budget-max');
  if (minEl) minEl.value = searchState.budget[0];
  if (maxEl) maxEl.value = searchState.budget[1];
  // Update displayed range label
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
function sortResults(by) {
  searchState.sortBy = by;
  renderApp();
}
