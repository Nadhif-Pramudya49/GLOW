// ===== PAGE: SEARCH =====

let mapInstance = null;
let API_DATA = null; // Store for fetched API data
let searchState = {
  query: '', category: 'semua',
  budget: 1500000, wifi: 0,
  suasana: [], rating: 0,
  facilities: [], showMap: false,
  inspirationMode: false,
  sortBy: 'rating',   // 'rating' | 'price_asc' | 'price_desc'
  openFilter: null,
};

function renderSearchPage() {
  const page = el('div', 'page');

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
    
    // Kick off async fetch without blocking the render
    (async () => {
      try {
        API_DATA = await LocationService.getLocations();
        renderApp();
      } catch (error) {
        console.error('API Fetch Error:', error);
        if (typeof DATA !== 'undefined') {
          API_DATA = DATA;
          renderApp();
        } else {
          // If no fallback data, show error state on re-render by setting API_DATA to empty array or specific error state
          API_DATA = [];
          renderApp();
        }
      }
    })();
    
    return page;
  }

  // Hero slides data
  const heroSlides = [
    { img: 'assets/images/hero-beach.png',   label: 'Pantai Indrayanti, Gunung Kidul' },
    { img: 'assets/images/hero-culture.png', label: 'Workation Cafe Khas Jogja' },
    { img: 'assets/images/hero-aerial.png',  label: 'Perbukitan Karst Gunung Kidul' },
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
      <h1 class="hero-title">Temukan <span>workation spot</span><br/>sempurna di Gunung Kidul </h1>
      <p class="hero-sub">Cari hotel, cafe, wisata, kuliner semua dalam satu<br/>platform terintegrasi untuk produktivitas maksimal.</p>
      <div class="search-bar">
        <input type="text" id="hero-search" placeholder="Cari tempat, cafe, wisata, kuliner..." value="${searchState.query}" oninput="handleSearch(this.value)" onkeydown="if(event.key==='Enter') applySearch()" />
        <button class="btn btn-primary" onclick="applySearch()">Cari Sekarang</button>
      </div>
      <div class="tabs mt-2" style="justify-content:flex-start">
        ${[['semua','Semua'],['penginapan','Penginapan'],['workspace','Workspace / Cafe'],['wisata','Wisata'],['kuliner','Kuliner'],['budaya','Budaya']].map(([id,label])=>`
          <button class="tab-btn ${searchState.category===id?'active':''}" onclick="setCategory('${id}')">${label}</button>
        `).join('')}
      </div>
    </div>
  `;
  page.appendChild(hero);

  setTimeout(initHeroSlideshow, 50);

  if (searchState.category === 'semua' && !searchState.query) {
    const kat = renderKategoriPopuler();
    kat.classList.add('fade-in');
    page.appendChild(kat);
  }

  page.appendChild(renderHorizontalFilter());

  const main = el('div', 'container fade-in', '');
  main.style.cssText = 'padding-top:2rem;padding-bottom:4rem;position:relative';
  
  main.appendChild(renderSearchResults());
  page.appendChild(main);

  // Inspiration Mode - Always shown
  page.appendChild(renderInspirationMode());

  // Map - Always shown
  const mapSec = el('div', 'container mb-4');
  mapSec.style.marginTop = '2rem';
  mapSec.innerHTML = `<div class="map-container" style="height:400px; border-radius:16px; overflow:hidden; z-index:1; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"><div id="map" style="width:100%; height:100%;"></div></div>`;
  page.appendChild(mapSec);
  setTimeout(initMap, 100);

  return page;
}

function toggleFilter(filterName, event) {
  if (event) event.stopPropagation();
  if (searchState.openFilter === filterName) {
    searchState.openFilter = null;
  } else {
    searchState.openFilter = filterName;
  }
  renderApp();
}

// Global click handler to close dropdowns
document.addEventListener('click', (e) => {
  if (searchState.openFilter && !e.target.closest('.filter-item')) {
    searchState.openFilter = null;
    renderApp();
  }
});

function renderHorizontalFilter() {
  const wrapper = el('div', 'filter-wrapper');
  
  let activeFiltersCount = 0;
  const activeChips = [];

  if (searchState.budget < 1500000) {
    activeFiltersCount++;
    activeChips.push({ id: 'budget', val: '', label: `Maks. ${formatRupiah(searchState.budget)}` });
  }
  if (searchState.wifi > 0) {
    activeFiltersCount++;
    activeChips.push({ id: 'wifi', val: '', label: `WiFi > ${searchState.wifi} Mbps` });
  }
  if (searchState.rating > 0) {
    activeFiltersCount++;
    activeChips.push({ id: 'rating', val: '', label: `Rating ${searchState.rating}+` });
  }
  if (searchState.suasana.length > 0) {
    activeFiltersCount += searchState.suasana.length;
    searchState.suasana.forEach(s => activeChips.push({ id: 'suasana', val: s, label: s }));
  }
  if (searchState.facilities.length > 0) {
    activeFiltersCount += searchState.facilities.length;
    searchState.facilities.forEach(f => activeChips.push({ id: 'fac', val: f, label: f }));
  }

  const bar = el('div', 'filter-bar container');
  
  const formatBdgt = searchState.budget < 1500000 ? 'Batas Harga' : 'Harga';
  const formatWifi = searchState.wifi > 0 ? `WiFi: >${searchState.wifi}Mbps` : 'Kecepatan WiFi';
  const formatSuasana = searchState.suasana.length ? `Suasana (${searchState.suasana.length})` : 'Suasana';
  const formatRating = searchState.rating > 0 ? `Rating: ${searchState.rating}+` : 'Rating Minimum';
  const formatFac = searchState.facilities.length ? `Fasilitas (${searchState.facilities.length})` : 'Fasilitas';

  bar.innerHTML = `
    <div class="filter-item">
      <button class="filter-pill ${searchState.openFilter==='budget'?'active':''} ${formatBdgt!=='Harga'?'has-value':''}" onclick="toggleFilter('budget', event)">
        ${formatBdgt} ▼
      </button>
      ${searchState.openFilter === 'budget' ? `
        <div class="filter-dropdown">
          <div class="filter-dropdown-title">Batas Harga Maksimal</div>
          <div id="budget-label" style="font-size:0.875rem;font-weight:600;color:var(--green);margin-bottom:1rem">
            Maks. ${formatRupiah(searchState.budget)}
          </div>
          <input type="range" class="range-slider" min="100000" max="1500000" step="50000" value="${searchState.budget}" oninput="updateBudget(this.value)" onchange="renderApp()" />
        </div>
      ` : ''}
    </div>

    <div class="filter-item">
      <button class="filter-pill ${searchState.openFilter==='wifi'?'active':''} ${searchState.wifi>0?'has-value':''}" onclick="toggleFilter('wifi', event)">
        ${formatWifi} ▼
      </button>
      ${searchState.openFilter === 'wifi' ? `
        <div class="filter-dropdown">
          <div class="filter-dropdown-title">Kecepatan WiFi Minimum</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
          ${[['0','Tidak perlu','<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"></path></svg>'],
             ['10','Dasar (> 10 Mbps)','<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.53 16.11a6 6 0 016.95 0M12 20h.01"></path></svg>'],
             ['50','Kencang (> 50 Mbps)','<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0114.08 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"></path></svg>'],
             ['100','Ultra (> 100 Mbps)','<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"></path></svg>']].map(([v,l,icon])=>`
            <label style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;cursor:pointer;border:2px solid ${searchState.wifi==v?'var(--green)':'var(--gray-100)'};background:${searchState.wifi==v?'#f0fdf4':'#fff'};transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow:${searchState.wifi==v?'0 4px 12px rgba(15,118,110,0.1)':'0 2px 4px rgba(0,0,0,0.02)'}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              <input type="radio" name="wifi" value="${v}" ${searchState.wifi==v?'checked':''} onchange="searchState.wifi=${v};renderApp()" style="display:none;" />
              <div style="color:${searchState.wifi==v?'var(--green)':'var(--gray-400)'}; display:flex; align-items:center; justify-content:center;">${icon}</div>
              <div style="font-size:0.875rem;font-weight:${searchState.wifi==v?'700':'500'};color:${searchState.wifi==v?'var(--green-dark)':'var(--gray-700)'}">${l}</div>
              ${searchState.wifi==v?`<div style="margin-left:auto;color:var(--green);font-weight:bold;">✓</div>`:''}
            </label>
          `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="filter-item">
      <button class="filter-pill ${searchState.openFilter==='suasana'?'active':''} ${searchState.suasana.length?'has-value':''}" onclick="toggleFilter('suasana', event)">
        ${formatSuasana} ▼
      </button>
      ${searchState.openFilter === 'suasana' ? `
        <div class="filter-dropdown">
          <div class="filter-dropdown-title">Suasana</div>
          <div class="flex flex-wrap gap-2">
            ${['Tenang','Outdoor','Pantai','Petualangan','Pemandangan laut','Sunrise','Seafood','Tradisional'].map(s=>`
              <span class="chip ${searchState.suasana.includes(s)?'active':''}" onclick="toggleSuasana('${s}')">${s}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="filter-item">
      <button class="filter-pill ${searchState.openFilter==='rating'?'active':''} ${searchState.rating>0?'has-value':''}" onclick="toggleFilter('rating', event)">
        ${formatRating} ▼
      </button>
      ${searchState.openFilter === 'rating' ? `
        <div class="filter-dropdown">
          <div class="filter-dropdown-title">Rating Minimum</div>
          <div class="star-input" id="rating-filter">
            ${[5,4,3,2,1].map(n=>`<span class="${n<=searchState.rating?'active':''}" onclick="setRatingFilter(${n})">★</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="filter-item">
      <button class="filter-pill ${searchState.openFilter==='fac'?'active':''} ${searchState.facilities.length?'has-value':''}" onclick="toggleFilter('fac', event)">
        ${formatFac} ▼
      </button>
      ${searchState.openFilter === 'fac' ? `
        <div class="filter-dropdown">
          <div class="filter-dropdown-title">Fasilitas</div>
          ${['Colokan','AC','Kolam Renang','Parkir','Spa','Guide'].map(f=>`
            <label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;font-size:0.875rem">
              <input type="checkbox" ${searchState.facilities.includes(f)?'checked':''} onchange="toggleFacility('${f}')" style="accent-color:var(--green)" />
              ${getFacilityIcon(f)} ${f}
            </label>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div style="margin-left:auto; display:flex; align-items:center;">
      <span style="font-size:0.875rem; font-weight:600; color:var(--green); margin-right:0.5rem; display:flex; align-items:center; gap:0.35rem;">
        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        Filter ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
      </span>
    </div>
  `;
  wrapper.appendChild(bar);

  if (activeChips.length > 0) {
    const chipsRow = el('div', 'container');
    chipsRow.style.cssText = 'display:flex; align-items:center; flex-wrap:wrap; gap:0.5rem; padding-bottom:1rem; margin-top:-0.5rem;';
    
    chipsRow.innerHTML = `
      ${activeChips.map(chip => `
        <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:var(--green-light);color:var(--green-dark);border:1px solid var(--green);border-radius:20px;font-size:0.75rem;cursor:pointer" onclick="removeFilter('${chip.id}', '${chip.val}')" onmouseover="this.style.background='#d1f0e4'" onmouseout="this.style.background='var(--green-light)'">
          ${chip.label} <span style="font-weight:900; font-size:1rem; line-height:1;">&times;</span>
        </div>
      `).join('')}
      <button class="btn btn-ghost" style="font-size:0.75rem;padding:4px 8px;color:var(--red);" onclick="resetFilters()">Reset Semua Filter</button>
    `;
    wrapper.appendChild(chipsRow);
  }

  return wrapper;
}

function renderSearchResults() {
  const wrap = el('div', '');
  wrap.id = 'search-results-container';
  const items = getFilteredItems();
  const header = el('div', 'flex items-center justify-between mb-3');
  header.innerHTML = `
    <div>
      <span style="font-weight:700;color:var(--gray-700)">${items.length} tempat ditemukan</span>
      <span style="font-size:0.875rem;color:var(--gray-400);margin-left:8px">• ${searchState.category === 'penginapan' ? 'Penginapan' : searchState.category === 'workspace' ? 'Workspace' : searchState.category === 'wisata' ? 'Wisata' : searchState.category === 'kuliner' ? 'Kuliner' : searchState.category === 'budaya' ? 'Budaya' : 'Semua'}</span>
    </div>
    <select class="form-input" style="width:auto;padding:6px 12px" onchange="sortResults(this.value)">
      <option value="rating"   ${searchState.sortBy==='rating'   ?'selected':''}>Urutkan: Rating Terbaik</option>
      <option value="price_asc" ${searchState.sortBy==='price_asc'?'selected':''}>Harga Terendah</option>
      <option value="price_desc" ${searchState.sortBy==='price_desc'?'selected':''}>Harga Tertinggi</option>
    </select>
  `;
  wrap.appendChild(header);
  const grid = el('div', 'grid-4');
  if (items.length === 0) {
    grid.style.gridColumn = '1 / -1';
    grid.innerHTML = `
      <div style="text-align:center; padding:4rem 1rem; width:100%;">
        <svg style="width:80px;height:80px;color:var(--gray-300);margin:0 auto 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <h3 style="font-size:1.25rem;font-weight:700;color:var(--gray-800);margin-bottom:0.5rem">Tidak ada tempat yang sesuai</h3>
        <p style="color:var(--gray-500);margin-bottom:1.5rem">Maaf, kami tidak dapat menemukan lokasi dengan kriteria filter tersebut. Coba ubah pencarian atau hapus filter Anda.</p>
        <button class="btn btn-outline" onclick="resetFilters()">Bersihkan Filter</button>
      </div>`;
  } else {
    items.forEach(item => grid.appendChild(renderItemCard(item)));
  }
  wrap.appendChild(grid);
  return wrap;
}

function renderInspirationMode() {
  const allItems = [...(API_DATA.penginapan||[]), ...(API_DATA.workspace||[]), ...(API_DATA.wisata||[]), ...(API_DATA.kuliner||[]), ...(API_DATA.budaya||[])];
  const heights = [220, 280, 200, 260, 240, 300];
  const sec = el('div', 'container', '');
  sec.style.cssText = 'padding-top:2rem;padding-bottom:4rem';
  sec.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem">
      <h2 class="section-title">Inspirasi Workation</h2>
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

function renderKategoriPopuler() {
  const sec = el('div', 'container', '');
  sec.style.cssText = 'padding-top:1rem;padding-bottom:4rem';
  sec.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem">
      <h2 style="font-family:'Playfair Display', serif; font-size:2rem; color:var(--gray-800); margin:0;">Kategori Populer</h2>
      <a href="#" style="color:var(--gray-600); text-decoration:none; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; font-weight:500;">
        Lihat Semua <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
      </a>
    </div>
    <div class="grid-4" style="gap:1.5rem">
      <!-- Card 1 -->
      <div style="position:relative; border-radius:12px; overflow:hidden; height:280px; cursor:pointer; background:#000;" onclick="setCategory('penginapan')">
        <div style="position:absolute; inset:0; background:url('assets/images/p7-luxury-cabin.png') center/cover; opacity:0.8; transition:transform 0.5s ease" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);"></div>
        <div style="position:absolute; inset:0; padding:1.5rem; display:flex; flex-direction:column; justify-content:flex-end; color:#fff">
          <h3 style="font-family:'Playfair Display', serif; font-size:1.5rem; margin-bottom:0.5rem">Penginapan</h3>
          <p style="font-size:0.85rem; opacity:0.9; margin-bottom:1.5rem">Temukan akomodasi nyaman untuk workation Anda</p>
          <div><button class="btn" style="background:#fff; color:#173F35; font-weight:600; padding:0.4rem 1.25rem; font-size:0.875rem; border-radius:6px; border:none;">Jelajahi</button></div>
        </div>
      </div>
      <!-- Card 2 -->
      <div style="position:relative; border-radius:12px; overflow:hidden; height:280px; cursor:pointer; background:#000;" onclick="setCategory('workspace')">
        <div style="position:absolute; inset:0; background:url('assets/images/w3-obelix-cafe.png') center/cover; opacity:0.8; transition:transform 0.5s ease" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);"></div>
        <div style="position:absolute; inset:0; padding:1.5rem; display:flex; flex-direction:column; justify-content:flex-end; color:#fff">
          <h3 style="font-family:'Playfair Display', serif; font-size:1.5rem; margin-bottom:0.5rem">Workspace / Cafe</h3>
          <p style="font-size:0.85rem; opacity:0.9; margin-bottom:1.5rem">Tempat kerja produktif dengan suasana inspiratif</p>
          <div><button class="btn" style="background:#fff; color:#173F35; font-weight:600; padding:0.4rem 1.25rem; font-size:0.875rem; border-radius:6px; border:none;">Jelajahi</button></div>
        </div>
      </div>
      <!-- Card 3 -->
      <div style="position:relative; border-radius:12px; overflow:hidden; height:280px; cursor:pointer; background:#000;" onclick="setCategory('wisata')">
        <div style="position:absolute; inset:0; background:url('assets/images/hero-aerial.png') center/cover; opacity:0.8; transition:transform 0.5s ease" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);"></div>
        <div style="position:absolute; inset:0; padding:1.5rem; display:flex; flex-direction:column; justify-content:flex-end; color:#fff">
          <h3 style="font-family:'Playfair Display', serif; font-size:1.5rem; margin-bottom:0.5rem">Wisata</h3>
          <p style="font-size:0.85rem; opacity:0.9; margin-bottom:1.5rem">Jelajahi keindahan alam Gunung Kidul</p>
          <div><button class="btn" style="background:#fff; color:#173F35; font-weight:600; padding:0.4rem 1.25rem; font-size:0.875rem; border-radius:6px; border:none;">Jelajahi</button></div>
        </div>
      </div>
      <!-- Card 4 -->
      <div style="position:relative; border-radius:12px; overflow:hidden; height:280px; cursor:pointer; background:#000;" onclick="setCategory('kuliner')">
        <div style="position:absolute; inset:0; background:url('assets/images/act-gudeg.png') center/cover; opacity:0.8; transition:transform 0.5s ease" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></div>
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);"></div>
        <div style="position:absolute; inset:0; padding:1.5rem; display:flex; flex-direction:column; justify-content:flex-end; color:#fff">
          <h3 style="font-family:'Playfair Display', serif; font-size:1.5rem; margin-bottom:0.5rem">Kuliner</h3>
          <p style="font-size:0.85rem; opacity:0.9; margin-bottom:1.5rem">Nikmati cita rasa khas Gunung Kidul</p>
          <div><button class="btn" style="background:#fff; color:#173F35; font-weight:600; padding:0.4rem 1.25rem; font-size:0.875rem; border-radius:6px; border:none;">Jelajahi</button></div>
        </div>
      </div>
    </div>
  `;
  return sec;
}

function getFilteredItems() {
  let items = [];
  if (searchState.category === 'semua' && API_DATA) {
    items = [...(API_DATA.penginapan||[]), ...(API_DATA.workspace||[]), ...(API_DATA.wisata||[]), ...(API_DATA.kuliner||[]), ...(API_DATA.budaya||[])];
  } else {
    items = (API_DATA && API_DATA[searchState.category]) || [];
  }
  
  // Text search
  if (searchState.query) {
    const q = searchState.query.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.desc||'').toLowerCase().includes(q));
  }

  const filteredItems = items; // Temporary variable to log
  console.log("FILTERED (" + searchState.category + "):", filteredItems);

  // Budget filter (wisata gratis selalu lolos)
  if (searchState.budget && searchState.budget < 1500000) {
    items = items.filter(i => {
      const p = i.price || 0;
      if (p === 0) return true;
      return p <= searchState.budget;
    });
  }

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

window.mapMarkers = {};

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.L || typeof API_DATA === 'undefined') return;
  
  if (!document.getElementById('map-styles')) {
    const s = el('style', '');
    s.id = 'map-styles';
    s.textContent = `.custom-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; } .custom-popup .leaflet-popup-content { margin: 0; width: 220px !important; }`;
    document.head.appendChild(s);
  }

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  
  mapInstance = L.map('map', { attributionControl: false }).setView([-8.15, 110.61], 12);
  L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { attribution: '© Google Maps', maxZoom: 20 }).addTo(mapInstance);
  
  updateMapMarkers();
}

function updateMapMarkers() {
  if (!mapInstance) return;
  
  if (window.mapMarkers) {
    Object.values(window.mapMarkers).forEach(m => mapInstance.removeLayer(m));
  }
  window.mapMarkers = {};
  
  const items = getFilteredItems();
  items.forEach(item => {
    if (!item.lat || !item.lng || isNaN(item.lat) || isNaN(item.lng)) return;
    
    const icon = L.divIcon({
      html: `<div style="background:#173f35;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);transition:all 0.3s ease;" id="marker-icon-${item.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>`,
      iconSize: [32, 32], iconAnchor: [16, 16], className: ''
    });
    
    const marker = L.marker([item.lat, item.lng], { icon }).addTo(mapInstance);
    
    const popupHtml = `
      <div style="width: 220px; padding: 0;">
        <img src="${item.img}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 12px 12px 0 0;" onerror="this.src='https://picsum.photos/seed/${item.id}/800/600'" />
        <div style="padding: 12px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #111;">${item.name}</h4>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;"><span style="color: var(--gold);">★</span> ${item.rating} • ${item.category}</div>
          <div style="font-size: 14px; font-weight: 800; color: var(--green-dark); margin-bottom: 12px;">${item.price === 0 ? 'Gratis' : formatRupiah(item.price)}</div>
          <button class="btn btn-primary" style="width: 100%; padding: 6px; font-size: 12px; border-radius: 6px;" onclick="openDetail('${item.id}', '${item.category}')">Lihat Detail</button>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupHtml, { padding: '0px', className: 'custom-popup' });
    
    marker.on('click', () => {
      setActiveMarker(item.id);
      highlightCard(item.id, false); // false = jangan scroll, supaya popup terlihat
    });
    
    window.mapMarkers[item.id] = marker;
  });
}

function setActiveMarker(itemId) {
  Object.keys(window.mapMarkers).forEach(id => {
    const el = document.getElementById(`marker-icon-${id}`);
    if (el) {
      el.style.background = '#173f35';
      el.style.transform = 'scale(1)';
      el.style.zIndex = '1';
    }
  });
  const activeEl = document.getElementById(`marker-icon-${itemId}`);
  if (activeEl) {
    activeEl.style.background = '#ef4444';
    activeEl.style.transform = 'scale(1.2)';
    activeEl.style.zIndex = '1000';
  }
}

window.setActiveMarker = setActiveMarker;

function highlightCard(itemId, shouldScroll = true) {
  const cards = document.querySelectorAll('.item-card-airbnb');
  cards.forEach(c => c.style.border = '2px solid transparent');
  const card = document.getElementById(`card-${itemId}`);
  if (card) {
    card.style.border = '2px solid var(--green)';
    if (shouldScroll) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

let _searchTimeout = null;
function handleSearch(val) { 
  searchState.query = val; 
  clearTimeout(_searchTimeout);
  _searchTimeout = setTimeout(() => {
    const container = document.getElementById('search-results-container');
    if (container) {
      const newResults = renderSearchResults();
      container.innerHTML = newResults.innerHTML;
      if (typeof updateMapMarkers === 'function') updateMapMarkers();
    } else {
      renderApp();
    }
  }, 400);
}
function applySearch() { 
  clearTimeout(_searchTimeout);
  renderApp(); 
}
function setCategory(cat) { searchState.category = cat; renderApp(); }

function updateBudget(val) {
  searchState.budget = +val;
  const lbl = document.getElementById('budget-label');
  if (lbl) lbl.textContent = `Maks. ${formatRupiah(searchState.budget)}`;
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
function applyFilters() { renderApp(); showToast('Filter diterapkan!'); }
function resetFilters() {
  searchState = { ...searchState, query:'', budget:1500000, wifi:0, suasana:[], rating:0, facilities:[] };
  renderApp();
}
function removeFilter(type, val) {
  if (type === 'budget') searchState.budget = 1500000;
  if (type === 'wifi') searchState.wifi = 0;
  if (type === 'rating') searchState.rating = 0;
  if (type === 'suasana') searchState.suasana = searchState.suasana.filter(s => s !== val);
  if (type === 'fac') searchState.facilities = searchState.facilities.filter(f => f !== val);
  renderApp();
}
function sortResults(by) { searchState.sortBy = by; renderApp(); }
