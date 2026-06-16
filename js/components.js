// ===== SHARED COMPONENTS =====

let _mobileMenuOpen = false;

function renderNavbar() {
  const pages = [
    { id:'search',       label:'Cari Tempat',     icon:'🔍' },
    { id:'package',      label:'Package Builder',  icon:'📦' },
    { id:'booking',      label:'Booking',          icon:'📅' },
    { id:'productivity', label:'Productivity',     icon:'⚡' },
    { id:'review',       label:'Review',           icon:'⭐' },
  ];

  const nav = el('nav', 'navbar');
  nav.innerHTML = `
    <a class="navbar-brand" onclick="navigate('search')">
      GLOW<span>Gunung Kidul Location for Work</span>
    </a>
    <ul class="navbar-nav">
      ${pages.map(p => `<li><a class="${State.currentPage===p.id?'active':''}" onclick="navigate('${p.id}')">${p.icon} ${p.label}</a></li>`).join('')}
    </ul>
    <div class="navbar-actions">
      <button class="btn btn-primary btn-sm" onclick="navigate('booking')">Booking →</button>
      <button class="hamburger" id="hamburger-btn" onclick="toggleMobileMenu()" aria-label="Buka Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  // === Backdrop — langsung ke body, bukan ke nav ===
  // (nav punya height:64px fixed yang akan meng-clip elemen child)
  document.getElementById('drawer-backdrop')?.remove();
  const backdrop = el('div', 'drawer-backdrop');
  backdrop.id = 'drawer-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.onclick = () => toggleMobileMenu();
  document.body.appendChild(backdrop);

  // === Side Drawer — langsung ke body ===
  document.getElementById('mobile-drawer')?.remove();
  const drawer = el('div', 'mobile-drawer');
  drawer.id = 'mobile-drawer';
  drawer.setAttribute('aria-label', 'Navigasi');
  drawer.innerHTML = `
    <!-- Header / Brand -->
    <div class="drawer-header">
      <span style="font-size:1.5rem">🏔️</span>
      <div>
        <span class="drawer-brand">GLOW</span>
        <span class="drawer-brand-sub">Gunung Kidul Location for Work</span>
      </div>
    </div>

    <!-- Nav links -->
    <nav class="drawer-nav">
      ${pages.map(p => `
        <button class="drawer-link ${State.currentPage===p.id?'active':''}" onclick="navigate('${p.id}');toggleMobileMenu()" aria-label="${p.label}">
          <span class="dl-icon">${p.icon}</span>
          <span>${p.label}</span>
        </button>
      `).join('')}
      <div class="drawer-divider"></div>
      <button class="drawer-link" onclick="toggleMobileMenu()" style="opacity:0.55;font-size:0.85rem">
        <span class="dl-icon" style="font-size:0.9rem">✕</span>
        <span>Tutup Menu</span>
      </button>
    </nav>

    <!-- Footer CTA -->
    <div class="drawer-footer">
      <button class="drawer-cta" onclick="navigate('booking');toggleMobileMenu()">
        📅 Pesan Sekarang
      </button>
    </div>
  `;
  document.body.appendChild(drawer);

  return nav;
}

function toggleMobileMenu() {
  _mobileMenuOpen = !_mobileMenuOpen;
  const btn      = document.getElementById('hamburger-btn');
  const drawer   = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  if (btn) {
    btn.classList.toggle('open', _mobileMenuOpen);
    btn.setAttribute('aria-expanded', _mobileMenuOpen);
  }
  if (drawer)   drawer.classList.toggle('open', _mobileMenuOpen);
  if (backdrop) backdrop.classList.toggle('open', _mobileMenuOpen);

  document.body.style.overflow = _mobileMenuOpen ? 'hidden' : '';
}

function renderBottomNav() {
  const items = [
    { id:'search',       icon:'🔍', label:'Cari' },
    { id:'package',      icon:'📦', label:'Paket' },
    { id:'booking',      icon:'📅', label:'Booking', special: true },
    { id:'productivity', icon:'⚡',  label:'Kerja' },
    { id:'review',       icon:'⭐',  label:'Review' },
  ];

  const nav = el('div', 'bottom-nav');
  nav.id = 'bottom-nav';
  nav.innerHTML = `
    <div class="bottom-nav-inner">
      ${items.map(item => item.special ? `
        <button class="bottom-nav-item bn-booking" onclick="navigate('${item.id}')" aria-label="${item.label}">
          <div class="bn-icon-wrap">${item.icon}</div>
          <span class="bn-label">${item.label}</span>
        </button>
      ` : `
        <button class="bottom-nav-item ${State.currentPage===item.id?'active':''}" onclick="navigate('${item.id}')" aria-label="${item.label}">
          <span class="bn-icon">${item.icon}</span>
          <span class="bn-label">${item.label}</span>
        </button>
      `).join('')}
    </div>
  `;
  document.body.appendChild(nav);
}

function renderItemCard(item, compact=false) {
  const badge = getCategoryBadge(item.category);
  const priceStr = item.price === 0 ? 'Gratis' : formatRupiah(item.price) + (item.unit ? `/${item.unit}` : '');
  const facIcons = (item.facilities||[]).slice(0,3).map(f => `<span class="facility-icon">${getFacilityIcon(f)}${f}</span>`).join('');
  const suasanaTags = (item.suasana||[]).map(s => `<span class="chip" style="font-size:0.7rem;padding:2px 8px">${s}</span>`).join('');
  const wifiStr = item.wifi > 0 ? `📶 ${item.wifi} Mbps` : '';
  const inPackage = (State.package.penginapan?.id === item.id) || State.package.workspaces.some(w=>w.id===item.id) || State.package.activities.some(a=>a.id===item.id);

  const card = el('div', 'card slide-in');
  card.innerHTML = `
    <div style="position:relative">
      <img class="card-img" src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${item.id}/800/600'"/>
      <span class="badge ${badge.cls}" style="position:absolute;top:12px;left:12px">${badge.label}</span>
      ${wifiStr ? `<span class="badge" style="position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.6);color:#fff">${wifiStr}</span>` : ''}
    </div>
    <div class="card-body">
      <h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;color:var(--gray-800)">${item.name}</h3>
      <div class="rating mb-2">
        <span class="stars">${renderStars(item.rating)}</span>
        <span class="rating-score">${item.rating}</span>
        <span class="rating-count">(${item.reviews} ulasan)</span>
      </div>
      <div class="flex gap-2 flex-wrap mb-2">${facIcons}</div>
      <div class="flex gap-1 flex-wrap mb-3">${suasanaTags}</div>
      <div class="flex items-center justify-between">
        <span style="font-size:1.1rem;font-weight:800;color:var(--green)">${priceStr}</span>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="btn btn-outline btn-sm" onclick="openDetail('${item.id}','${item.category}')">Lihat Detail</button>
        <button class="btn ${inPackage?'btn-ghost':'btn-primary'} btn-sm" onclick="addToPackage('${item.id}','${item.category}')">
          ${inPackage ? '✓ Di Paket' : '+ Tambah ke Paket'}
        </button>
      </div>
    </div>
  `;
  return card;
}

function openDetail(id, cat) {
  const items = DATA[cat];
  const item = items.find(x => x.id === id);
  if (!item) return;
  const badge = getCategoryBadge(item.category);
  const priceStr = item.price === 0 ? 'Gratis' : formatRupiah(item.price) + `/${item.unit}`;
  const facItems = (item.facilities||[]).map(f => `<span style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:var(--gray-100);border-radius:8px;font-size:0.8rem">${getFacilityIcon(f)} ${f}</span>`).join('');
  const reviewsHtml = DUMMY_REVIEWS.map(r => `
    <div class="review-card mb-3">
      <div class="flex gap-3 items-center mb-2">
        <div class="review-avatar" style="background:${r.color}">${r.avatar}</div>
        <div>
          <div style="font-weight:600;font-size:0.875rem">${r.name}</div>
          <div style="font-size:0.75rem;color:var(--gray-400)">${r.date}</div>
        </div>
        <div class="stars ml-auto">${'⭐'.repeat(r.rating)}</div>
      </div>
      <p style="font-size:0.875rem;color:var(--gray-600)">${r.text}</p>
      <span style="font-size:0.7rem;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:100px">✓ Verified Stay</span>
    </div>
  `).join('');

  const content = `
    <div class="modal-header">
      <div>
        <span class="badge ${badge.cls}">${badge.label}</span>
        <h2 style="font-size:1.3rem;font-weight:800;margin-top:0.5rem">${item.name}</h2>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1.5rem">
        ${[0,1,2].map(i=>`<img src="https://picsum.photos/seed/${item.id}${i}/400/300" style="width:100%;height:140px;object-fit:cover;border-radius:8px" />`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
        <div style="background:var(--gray-50);border-radius:12px;padding:1rem">
          <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem">RATING PER KATEGORI</div>
          ${['WiFi & Koneksi','Kebersihan','Kenyamanan','Lokasi'].map(cat=>`
            <div style="margin-bottom:0.5rem">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:2px"><span>${cat}</span><span style="font-weight:700">${(3.8+Math.random()*1.2).toFixed(1)}</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:${75+Math.random()*20}%"></div></div>
            </div>
          `).join('')}
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem">FASILITAS</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">${facItems}</div>
          <div style="margin-top:1rem;font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.5rem">HARGA</div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--green)">${priceStr}</div>
          <div class="rating mt-1">
            <span class="stars">${renderStars(item.rating)}</span>
            <span class="rating-score">${item.rating}</span>
            <span class="rating-count">(${item.reviews})</span>
          </div>
        </div>
      </div>
      <p style="color:var(--gray-600);margin-bottom:1.5rem;line-height:1.7">${item.desc}</p>
      <div style="background:var(--gray-100);border-radius:12px;height:200px;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;color:var(--gray-400)">
        📍 Peta Mini — Lat: ${item.lat}, Lng: ${item.lng}
      </div>
      <div style="font-size:0.875rem;font-weight:700;color:var(--gray-700);margin-bottom:1rem">Ulasan Pengguna</div>
      ${reviewsHtml}
      <div class="flex gap-3 mt-4">
        <button class="btn btn-secondary btn-lg" style="flex:1" onclick="navigate('booking')">🗓 Pesan Sekarang</button>
        <button class="btn btn-primary btn-lg" style="flex:1" onclick="addToPackage('${item.id}','${item.category}');closeModal()">+ Tambah ke Paket</button>
      </div>
    </div>
  `;
  showModal(content);
}

function addToPackage(id, cat) {
  const source = (typeof API_DATA !== 'undefined' && API_DATA) ? API_DATA : DATA;
  const item = source[cat].find(x => x.id === id);
  if (!item) return;
  const pkg = State.package;
  if (cat === 'penginapan') {
    pkg.penginapan = item;
  } else if (cat === 'workspace') {
    if (!pkg.workspaces.find(w => w.id === id)) pkg.workspaces.push({ ...item, days: 1 });
  } else if (cat === 'wisata' || cat === 'kuliner') {
    if (!pkg.activities.find(a => a.id === id)) pkg.activities.push(item);
  }
  State.set('package', pkg);
  showToast(`✓ ${item.name} ditambahkan ke paket!`);
  renderApp();
}

function showToast(msg) {
  const t = el('div', '', '');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;background:var(--green);color:#fff;padding:12px 20px;border-radius:12px;font-weight:600;z-index:9999;animation:slideUp 0.3s ease;box-shadow:0 8px 24px rgba(0,0,0,0.2);font-size:0.875rem`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
