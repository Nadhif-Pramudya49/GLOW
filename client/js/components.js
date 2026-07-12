// ===== SHARED COMPONENTS =====

let _mobileMenuOpen = false;

function renderNavbar() {
  const pages = [
    { id:'search',       label:'Cari Tempat',     icon:'' },
    { id:'package',      label:'Package Builder', icon:'' },
    { id:'booking',      label:'Booking',         icon:'' },
    { id:'productivity', label:'Productivity',    icon:'' },
    { id:'review',       label:'Review',          icon:'' },
  ];

  const nav = el('nav', 'navbar');
  nav.innerHTML = `
    <div class="navbar-container">
      <a class="navbar-brand" onclick="navigate('search')">
        <div class="navbar-brand-logo">GLOW</div>
        <div class="navbar-brand-tagline">Gunung Kidul Location for Work</div>
      </a>
      <ul class="navbar-nav">
        ${pages.map(p => `<li><a class="${State.currentPage===p.id?'active':''}" onclick="navigate('${p.id}')">${p.label}</a></li>`).join('')}
      </ul>
      <div class="navbar-actions">
        <div style="position:relative; cursor:pointer; display:flex; align-items:center; margin-right:1rem; transition:transform 0.2s" onclick="navigate('favorites')" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Wishlist Favorit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>
          <span id="nav-fav-badge" style="position:absolute; top:-6px; right:-10px; background:#ef4444; color:#fff; font-size:0.65rem; font-weight:800; min-width:18px; height:18px; border-radius:9px; display:${State.favorites.length > 0 ? 'flex' : 'none'}; align-items:center; justify-content:center; box-shadow:0 2px 4px rgba(239,68,68,0.3); border:2px solid #fff;">${State.favorites.length}</span>
        </div>
        ${State.user 
          ? `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(State.user.fullName)}&background=10b981&color=fff&rounded=true" alt="Profile" style="width:40px;height:40px;border-radius:50%;cursor:pointer;border:2px solid var(--green);box-shadow:0 2px 4px rgba(15,118,110,0.2)" onclick="navigate(State.user.role === 'ADMIN' ? 'dashboard-admin' : State.user.role === 'OWNER' ? 'dashboard-owner' : 'dashboard-user')" title="Lihat Dashboard" />`
          : `<button onclick="showAuthModal('login')" style="background:var(--green); color:#fff; border:none; border-radius:24px; padding:8px 24px; font-weight:700; font-size:0.9rem; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,0.2)">Login</button>`
        }
        <button class="hamburger" id="hamburger-btn" onclick="toggleMobileMenu()" aria-label="Buka Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
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
      <div>
        <span class="drawer-brand">GLOW</span>
        <span class="drawer-brand-sub">Gunung Kidul</span>
      </div>
    </div>

    <!-- Nav links -->
    <nav class="drawer-nav">
      ${pages.map(p => `
        <button class="drawer-link ${State.currentPage===p.id?'active':''}" onclick="navigate('${p.id}');toggleMobileMenu()" aria-label="${p.label}">
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
        Pesan Sekarang
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
  const svgSearch = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
  const svgPackage = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
  const svgBooking = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
  const svgKerja = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
  const svgReview = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

  const items = [
    { id:'search',       icon: svgSearch, label:'Cari' },
    { id:'package',      icon: svgPackage, label:'Paket' },
    { id:'booking',      icon: svgBooking, label:'Booking', special: true },
    { id:'productivity', icon: svgKerja,  label:'Kerja' },
    { id:'review',       icon: svgReview,  label:'Review' },
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
  const priceStr = item.price === 0 ? 'Gratis' : formatRupiah(item.price);
  
  const badge = getCategoryBadge(item);
  const badgeHtml = `<span style="position:absolute;top:12px;left:12px;background:rgba(255,255,255,0.9);color:var(--gray-800);padding:4px 10px;border-radius:8px;font-size:0.75rem;font-weight:700;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:2">${badge.label.toUpperCase()}</span>`;

  const isFav = State.isFavorite(item.id);
  const heartFill = isFav ? '#ef4444' : 'rgba(0,0,0,0.4)';
  const heartStroke = isFav ? '#ef4444' : '#fff';
  
  const heartIcon = `
    <div class="heart-btn" style="position:absolute;top:12px;right:12px;z-index:2;background:rgba(255,255,255,0.2);backdrop-filter:blur(4px);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s" 
      onclick="event.stopPropagation(); State.toggleFavorite('${item.id}'); const svg = this.querySelector('svg'); const fav = State.isFavorite('${item.id}'); svg.setAttribute('fill', fav ? '#ef4444' : 'rgba(0,0,0,0.4)'); svg.setAttribute('stroke', fav ? '#ef4444' : '#fff'); this.style.transform = 'scale(1.3)'; setTimeout(() => this.style.transform = 'scale(1)', 150);" 
      onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="2" style="transition:all 0.2s ease;"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>
    </div>
  `;

  const card = el('div', 'item-card-airbnb');
  card.id = `card-${item.id}`;
  card.style.cssText = 'height:100%; cursor:pointer; display:flex; flex-direction:column; gap:12px; transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border 0.3s ease; border: 2px solid transparent; border-radius: 18px; padding: 4px;';
  card.onmouseover = () => { 
    card.style.transform = 'translateY(-4px)'; 
    if (typeof setActiveMarker === 'function') setActiveMarker(item.id);
  };
  card.onmouseout = () => { card.style.transform = 'translateY(0)'; };
  card.setAttribute('onclick', `openDetail('${item.id}','${item.category}')`);

  card.innerHTML = `
    <div style="position:relative; width:100%; aspect-ratio:1/1; border-radius:16px; overflow:hidden; background:var(--gray-200);">
      <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${item.id}/800/600'" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"/>
      ${badgeHtml}
      ${heartIcon}
    </div>
    <div style="display:flex; flex-direction:column; flex:1; padding: 0 4px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <h3 style="font-size:1rem; font-weight:700; color:var(--gray-900); margin:0; line-height:1.3; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${item.name}</h3>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span style="font-weight:600; font-size:0.875rem; color:var(--gray-900);">${item.rating}</span>
        </div>
      </div>
      
      <div style="font-size:0.875rem; color:var(--gray-500); margin-top:4px; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">
        ${(item.suasana||[]).slice(0,2).join(' • ') || item.desc}
      </div>
      
      <div style="margin-top:auto; padding-top:8px; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:baseline; gap:4px;">
          <span style="font-size:1rem; font-weight:800; color:var(--gray-900);">${priceStr}</span>
          ${item.price > 0 ? `<span style="font-size:0.875rem; color:var(--gray-500);">/ ${item.unit || 'malam'}</span>` : ''}
        </div>
        <div style="font-size:0.875rem; font-weight:600; color:var(--green); text-decoration:underline; text-underline-offset:2px;">
          Cek
        </div>
      </div>
      
      ${State.currentPage === 'favorites' ? `
      <button onclick="event.stopPropagation(); addToPackageAndGo('${item.id}', '${item.category}')" 
        style="margin-top:12px; width:100%; background:var(--green-50, rgba(16,185,129,0.1)); color:var(--green); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:8px; font-size:0.85rem; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;"
        onmouseover="this.style.background='var(--green)'; this.style.color='#fff';" onmouseout="this.style.background='var(--green-50, rgba(16,185,129,0.1))'; this.style.color='var(--green)';">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>
        Tambahkan ke Package
      </button>
      ` : ''}
    </div>
  `;
  return card;
}

function addToPackageAndGo(id, cat) {
  addToPackage(id, cat);
  navigate('package');
}

function openDetail(id, cat) {
  window.location.hash = `#location-detail?id=${id}`;
}

function addToPackage(id, cat) {
  if (!State.user) {
    showLoginRequiredPopup('Silakan login terlebih dahulu untuk menambahkan lokasi ini ke paket.');
    return;
  }
  let item;
  if (typeof id === 'object') {
    item = id;
    cat = item.category;
  } else {
    const source = (typeof API_DATA !== 'undefined' && API_DATA) ? API_DATA : DATA;
    item = source[cat]?.find(x => x.id === id);
  }
  if (!item) return;
  const pkg = State.package;
  if (cat === 'penginapan') {
    if (!pkg.penginapan) pkg.penginapan = [];
    if (!pkg.penginapan.find(p => p.id === id)) {
      pkg.penginapan.push(item);
      if (!pkg.penginapanSchedule || pkg.penginapanSchedule.length === 0) {
        State.autoSplitPenginapan();
      }
    }
  } else if (cat === 'workspace') {
    if (!pkg.workspaces.find(w => w.id === id)) {
      pkg.workspaces.push({ ...item, days: 1 });
      if (!pkg.workspacesSchedule || pkg.workspacesSchedule.length === 0) {
        State.autoSplitWorkspaces();
      }
    }
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

function showConfirmModal(title, message) {
  return new Promise((resolve) => {
    const content = el('div', '');
    content.style.padding = '1rem';
    content.style.textAlign = 'center';
    
    content.innerHTML = `
      <div style="margin-bottom:1rem;color:var(--green)">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <h3 style="font-size:1.5rem;font-weight:800;margin-bottom:0.75rem;color:var(--gray-900)">${title}</h3>
      <p style="color:var(--gray-600);margin-bottom:2rem;line-height:1.6">${message}</p>
      <div style="display:flex;gap:1rem;justify-content:center">
        <button id="btn-cancel-modal" style="padding:0.75rem 1.5rem;border-radius:12px;border:1px solid var(--gray-200);background:#fff;font-weight:700;color:var(--gray-600);cursor:pointer;flex:1;transition:all 0.2s">Nanti Dulu</button>
        <button id="btn-ok-modal" style="padding:0.75rem 1.5rem;border-radius:12px;border:none;background:var(--green);font-weight:700;color:#fff;cursor:pointer;flex:1;transition:all 0.2s;box-shadow:0 4px 12px rgba(23,63,53,0.2)">Buka Builder</button>
      </div>
    `;
    
    const overlay = showModal(content);
    overlay.querySelector('.modal').style.maxWidth = '400px';
    
    content.querySelector('#btn-cancel-modal').onclick = () => {
      closeModal();
      resolve(false);
    };
    
    content.querySelector('#btn-ok-modal').onclick = () => {
      closeModal();
      resolve(true);
    };
  });
}

function showDangerConfirmPopup(title, message, okText = "Ya, Hapus", cancelText = "Batal") {
  return new Promise((resolve) => {
    const content = el('div', '');
    content.style.padding = '1.5rem';
    content.style.textAlign = 'center';
    
    content.innerHTML = `
      <div style="margin-bottom:1rem;color:#ef4444">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h3 style="font-size:1.5rem;font-weight:800;margin-bottom:0.75rem;color:var(--gray-900)">${title}</h3>
      <p style="color:var(--gray-600);margin-bottom:2rem;line-height:1.6;font-size:1rem;">${message}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-direction:row;">
        <button id="btn-cancel-confirm" style="padding:0.75rem 1.5rem;border-radius:12px;border:1px solid var(--gray-200);background:var(--white);font-weight:600;color:var(--gray-700);cursor:pointer;flex:1;transition:all 0.2s;">${cancelText}</button>
        <button id="btn-ok-confirm" style="padding:0.75rem 1.5rem;border-radius:12px;border:none;background:#ef4444;font-weight:700;color:#fff;cursor:pointer;flex:1;transition:all 0.2s;box-shadow:0 4px 12px rgba(239, 68, 68, 0.2);">${okText}</button>
      </div>
    `;
    
    const overlay = window.showModal(content);
    overlay.querySelector('.modal').style.maxWidth = '400px';
    overlay.querySelector('.modal').style.borderRadius = '24px';
    
    content.querySelector('#btn-cancel-confirm').onclick = () => {
      window.closeModal();
      resolve(false);
    };
    
    content.querySelector('#btn-ok-confirm').onclick = () => {
      window.closeModal();
      resolve(true);
    };
  });
}

function showWarningConfirmPopup(title, message, okText = "Setuju & Lanjutkan", cancelText = "Batal") {
  return new Promise((resolve) => {
    const content = el('div', '');
    content.style.padding = '1.5rem';
    content.style.textAlign = 'center';
    
    content.innerHTML = `
      <div style="margin-bottom:1rem;color:#f59e0b">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h3 style="font-size:1.5rem;font-weight:800;margin-bottom:0.75rem;color:var(--gray-900)">${title}</h3>
      <p style="color:var(--gray-600);margin-bottom:2rem;line-height:1.6;font-size:1rem;">${message}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-direction:row;">
        <button id="btn-cancel-warn" style="padding:0.75rem 1.5rem;border-radius:12px;border:1px solid var(--gray-200);background:var(--white);font-weight:600;color:var(--gray-700);cursor:pointer;flex:1;transition:all 0.2s;">${cancelText}</button>
        <button id="btn-ok-warn" style="padding:0.75rem 1.5rem;border-radius:12px;border:none;background:var(--green);font-weight:700;color:#fff;cursor:pointer;flex:1;transition:all 0.2s;box-shadow:0 4px 12px rgba(16, 185, 129, 0.2);">${okText}</button>
      </div>
    `;
    
    const overlay = window.showModal(content);
    overlay.querySelector('.modal').style.maxWidth = '400px';
    overlay.querySelector('.modal').style.borderRadius = '24px';
    
    content.querySelector('#btn-cancel-warn').onclick = () => {
      window.closeModal();
      resolve(false);
    };
    
    content.querySelector('#btn-ok-warn').onclick = () => {
      window.closeModal();
      resolve(true);
    };
  });
}

function showLoginRequiredPopup(message) {
  const content = el('div', '');
  content.style.padding = '1.5rem';
  content.style.textAlign = 'center';
  
  content.innerHTML = `
    <div style="margin-bottom:1rem;color:var(--orange-500)">
      <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
    </div>
    <h3 style="font-size:1.5rem;font-weight:800;margin-bottom:0.75rem;color:var(--gray-900)">Akses Terbatas</h3>
    <p style="color:var(--gray-600);margin-bottom:2rem;line-height:1.6;font-size:1rem;">${message}</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-direction:column;">
      <button id="btn-login-now" style="padding:0.875rem 1.5rem;border-radius:12px;border:none;background:var(--green);font-weight:700;color:#fff;cursor:pointer;width:100%;transition:all 0.2s;box-shadow:0 4px 12px rgba(16,185,129,0.2);font-size:1rem;">Login Sekarang</button>
      <button id="btn-cancel-login" style="padding:0.75rem 1.5rem;border-radius:12px;border:none;background:transparent;font-weight:600;color:var(--gray-500);cursor:pointer;width:100%;transition:all 0.2s;">Nanti Saja</button>
    </div>
  `;
  
  const overlay = showModal(content);
  overlay.querySelector('.modal').style.maxWidth = '400px';
  overlay.querySelector('.modal').style.borderRadius = '24px';
  
  content.querySelector('#btn-cancel-login').onclick = () => {
    closeModal();
  };
  
  content.querySelector('#btn-login-now').onclick = () => {
    closeModal();
    setTimeout(() => showAuthModal('login'), 100);
  };
}

function showAuthModal(type = 'login') {
  const content = el('div', '');
  content.style.padding = '1.5rem';
  content.style.position = 'relative';
  
  const isLogin = type === 'login';
  
  content.innerHTML = isLogin ? `
    <button onclick="closeModal()" onmouseover="this.style.transform='rotate(90deg) scale(1.1)'; this.style.color='#111827';" onmouseout="this.style.transform='none'; this.style.color='#9CA3AF';" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:1.5rem;color:#9CA3AF;cursor:pointer;line-height:1;transition:all 0.3s ease;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">&times;</button>
    <div style="text-align: center; margin-bottom: 1rem;">
      <img src="assets/images/logo.png" alt="GLOW" style="height: 48px; margin-bottom: 0.25rem; object-fit: contain;" />
      <h2 style="font-weight:800;font-size:1.5rem;margin:0 0 0.25rem 0;color:#111827">Selamat Datang Kembali</h2>
      <p style="color:#6B7280;font-size:0.875rem;max-width:90%;margin:0 auto;line-height:1.4;">Silakan masuk untuk mengakses fitur eksklusif dan mengelola pemesanan Anda.</p>
    </div>
    
    <form id="auth-form" onsubmit="handleAuthSubmit(event, 'login')" autocomplete="off">
      <div style="margin-bottom:0.75rem;text-align:left;">
        <label id="lbl-auth-email" style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.25rem;color:#374151">Email</label>
        <div style="position:relative;display:flex;align-items:center;">
          <div style="position:absolute;left:0.4rem;width:32px;height:32px;background:#F3F4F6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#6B7280">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <input type="email" id="auth-email" required style="width:100%;padding:0.6rem 1rem 0.6rem 3.2rem;border:1px solid #E5E7EB;border-radius:10px;font-family:inherit;font-size:0.9rem;color:#111827;transition:all 0.2s" placeholder="nama@email.com" autocomplete="new-password" onfocus="this.style.borderColor='#10B981';this.style.outline='none'" onblur="this.style.borderColor='#E5E7EB'" oninput="this.style.borderColor='#E5E7EB';this.style.backgroundColor='';document.getElementById('lbl-auth-email').style.color='#374151';document.getElementById('err-auth-email').style.display='none'" />
        </div>
        <div id="err-auth-email" style="color:#ef4444;font-size:0.75rem;margin-top:0.25rem;display:none;"></div>
      </div>
      
      <div style="margin-bottom:1.25rem;text-align:left;">
        <label style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.25rem;color:#374151">Password</label>
        <div style="position:relative;display:flex;align-items:center;">
          <div style="position:absolute;left:0.4rem;width:32px;height:32px;background:#F3F4F6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#6B7280">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <input type="password" id="auth-pass" required minlength="6" style="width:100%;padding:0.6rem 2.5rem 0.6rem 3.2rem;border:1px solid #E5E7EB;border-radius:10px;font-family:inherit;font-size:0.9rem;color:#111827;transition:border-color 0.2s" placeholder="••••••••" autocomplete="new-password" onfocus="this.style.borderColor='#10B981';this.style.outline='none'" onblur="this.style.borderColor='#E5E7EB'" />
          <button type="button" onclick="const p=document.getElementById('auth-pass'); const i=this.querySelector('svg'); if(p.type==='password'){p.type='text';i.innerHTML='<path d=\\'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\\'/><circle cx=\\'12\\' cy=\\'12\\' r=\\'3\\'/>'}else{p.type='password';i.innerHTML='<path d=\\'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22\\'/>'}" style="position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; justify-content: center; padding: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
            </svg>
          </button>
        </div>
      </div>
      
      <button type="submit" style="width:100%;background:#183E34;color:white;padding:0.75rem;border-radius:12px;border:none;font-weight:700;font-size:1rem;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;box-shadow:0 4px 12px rgba(24,62,52,0.2);transition:all 0.2s;" id="auth-btn-submit" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 16px rgba(24,62,52,0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(24,62,52,0.2)';">
        Masuk
      </button>
    </form>
    
    <div style="display:flex;align-items:center;margin:1rem 0;">
      <div style="flex:1;height:1px;background:#E5E7EB"></div>
      <div style="padding:0 1rem;font-size:0.85rem;color:#9CA3AF">atau</div>
      <div style="flex:1;height:1px;background:#E5E7EB"></div>
    </div>
    
    <div style="text-align:center;font-size:0.875rem;color:#6B7280;margin-bottom:0.25rem;">
      Belum punya akun? <a href="javascript:void(0)" onclick="closeModal(); setTimeout(() => showAuthModal('register'), 100)" style="color:#047857;font-weight:700;text-decoration:none">Daftar di sini &rsaquo;</a>
    </div>
  ` : `
    <button onclick="closeModal()" onmouseover="this.style.transform='rotate(90deg) scale(1.1)'; this.style.color='#111827';" onmouseout="this.style.transform='none'; this.style.color='var(--gray-400)';" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:2rem;color:var(--gray-400);cursor:pointer;line-height:1;transition:all 0.3s ease;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">&times;</button>
    <h2 style="margin-bottom:0.25rem;font-weight:800;font-size:1.5rem;margin-top:0">Daftar Akun GLOW</h2>
    <p style="color:var(--gray-500);margin-bottom:1rem">Buat akun untuk mulai merencanakan workation Anda.</p>
    
    <form id="auth-form" onsubmit="handleAuthSubmit(event, 'register')" autocomplete="off" oninput="checkAuthFormValidity('register')">
      <div style="margin-bottom:0.6rem">
        <label id="lbl-auth-name" style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.25rem">Nama Lengkap</label>
        <input type="text" id="auth-name" required minlength="3" style="width:100%;padding:0.6rem 1rem;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit;transition:all 0.2s;" placeholder="Budi Nomad" autocomplete="off" oninput="handleAuthInput('name', this)" onblur="validateAuthField('name', this.value.trim(), this)" />
        <div id="err-auth-name" style="color:#ef4444;font-size:0.75rem;margin-top:0.25rem;display:none;"></div>
      </div>
      <div style="margin-bottom:0.6rem">
        <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.4rem">Daftar Sebagai</label>
        <div style="display:flex;background:#F3F4F6;border-radius:12px;padding:0.25rem;position:relative;z-index:1;">
          <div id="role-bg" style="position:absolute;top:0.25rem;bottom:0.25rem;left:0.25rem;width:calc(50% - 0.25rem);background:white;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1);transition:transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);z-index:-1;"></div>
          
          <label style="flex:1;cursor:pointer;text-align:center;padding:0.5rem;font-size:0.85rem;font-weight:600;color:#111827;transition:color 0.3s;" id="role-user-text">
            <input type="radio" name="auth-role" id="auth-role-user" value="USER" checked style="display:none;" onchange="document.getElementById('role-bg').style.transform='translateX(0)'; document.getElementById('role-user-text').style.color='#111827'; document.getElementById('role-owner-text').style.color='#6B7280';" />
            Pelanggan
          </label>
          
          <label style="flex:1;cursor:pointer;text-align:center;padding:0.5rem;font-size:0.85rem;font-weight:600;color:#6B7280;transition:color 0.3s;" id="role-owner-text">
            <input type="radio" name="auth-role" id="auth-role-owner" value="OWNER" style="display:none;" onchange="document.getElementById('role-bg').style.transform='translateX(100%)'; document.getElementById('role-owner-text').style.color='#111827'; document.getElementById('role-user-text').style.color='#6B7280';" />
            Mitra Tempat
          </label>
        </div>
      </div>
      <div style="margin-bottom:0.6rem">
        <label id="lbl-auth-email" style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.25rem">Email</label>
        <input type="email" id="auth-email" required style="width:100%;padding:0.6rem 1rem;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit;transition:all 0.2s;" placeholder="nama@email.com" autocomplete="new-password" oninput="handleAuthInput('email', this)" onblur="validateAuthField('email', this.value.trim(), this)" />
        <div id="err-auth-email" style="color:#ef4444;font-size:0.75rem;margin-top:0.25rem;display:none;"></div>
      </div>
      <div style="margin-bottom:1.25rem">
        <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.25rem">Password</label>
        <div style="position: relative;">
          <input type="password" id="auth-pass" required minlength="6" style="width:100%;padding:0.6rem 2.8rem 0.6rem 1rem;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit" placeholder="••••••••" autocomplete="new-password" />
          <button type="button" onclick="const p=document.getElementById('auth-pass'); const i=this.querySelector('svg'); if(p.type==='password'){p.type='text';i.innerHTML='<path d=\\'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\\'/><circle cx=\\'12\\' cy=\\'12\\' r=\\'3\\'/>'}else{p.type='password';i.innerHTML='<path d=\\'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22\\'/>'}" style="position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray-500); display: flex; align-items: center; justify-content: center; padding: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
            </svg>
          </button>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; border-radius: 9999px; text-align: center; display: flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; font-weight: 700; font-size: 1rem; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(16,185,129,0.25); transition: all 0.2s; border: none; cursor: pointer;" id="auth-btn-submit" onmouseover="if(!this.disabled){this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16,185,129,0.3)';}" onmouseout="if(!this.disabled){this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16,185,129,0.25)';}">
        Daftar Sekarang
      </button>
      <div id="err-form-global" style="color:#6B7280;font-size:0.75rem;margin-top:0.75rem;display:none;text-align:center;font-weight:600;"></div>
    </form>
    
    <div style="text-align:center;margin-top:1rem;font-size:0.875rem;color:var(--gray-500);padding-bottom:0.25rem;">
      Sudah punya akun?
      <a href="javascript:void(0)" onclick="closeModal(); setTimeout(() => showAuthModal('login'), 100)" style="color:var(--green);font-weight:700">
        Masuk di sini
      </a>
    </div>
  `;
  const overlay = showModal(content, { closeOnBackdrop: false });
  overlay.style.overflowY = 'auto';
  overlay.style.alignItems = 'flex-start';
  
  const modal = overlay.querySelector('.modal');
  modal.style.maxWidth = isLogin ? '500px' : '550px';
  modal.style.padding = isLogin ? '1.5rem 2.5rem 1.5rem 2.5rem' : '1.5rem 2.5rem 1.5rem 2.5rem';
  modal.style.borderRadius = '24px';
  modal.style.maxHeight = 'none';
  modal.style.overflowY = 'visible';
  modal.style.margin = 'auto';
  
  if (!isLogin) {
    checkAuthFormValidity('register');
  }
}

let authDebounceTimer;

window.handleAuthInput = function(type, el) {
  el.style.borderColor = 'var(--gray-200)';
  el.style.backgroundColor = '';
  document.getElementById('lbl-auth-' + type).style.color = '';
  document.getElementById('err-auth-' + type).style.display = 'none';
  
  // Langsung validasi saat itu juga jika form yang sedang diketik adalah 'name'
  if (type === 'name') {
    validateAuthField(type, el.value.trim(), el);
  }
};

window.validateAuthField = function(type, val, el) {
  if (!val) return;
  let errorMsg = '';
  if (type === 'name') {
    const nameRegex = /^[A-Za-z\s.\-']+$/;
    if (!nameRegex.test(val)) {
      errorMsg = '⚠️ Nama hanya boleh berisi huruf (tanpa angka/simbol).';
    }
  } else if (type === 'email') {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(val)) {
      errorMsg = '⚠️ Format alamat email tidak valid.';
    }
  }
  
  if (errorMsg) {
    el.style.borderColor = '#ef4444';
    el.style.backgroundColor = '#fef2f2';
    document.getElementById('lbl-auth-' + type).style.color = '#ef4444';
    const errDiv = document.getElementById('err-auth-' + type);
    errDiv.innerHTML = errorMsg;
    errDiv.style.display = 'block';
  }
};

window.checkAuthFormValidity = function(type) {
  if (type !== 'register') return;
  
  const errName = document.getElementById('err-auth-name');
  const errEmail = document.getElementById('err-auth-email');
  const btn = document.getElementById('auth-btn-submit');
  const globalErr = document.getElementById('err-form-global');
  
  if (!btn) return;
  
  const hasActiveAlert = (errName && errName.style.display === 'block') || 
                         (errEmail && errEmail.style.display === 'block');
  
  if (!hasActiveAlert) {
    btn.disabled = false;
    btn.style.background = ''; // Reverts to .btn-primary css
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 12px rgba(16,185,129,0.25)';
    if (globalErr) globalErr.style.display = 'none';
  } else {
    btn.disabled = true;
    btn.style.background = '#9CA3AF';
    btn.style.cursor = 'not-allowed';
    btn.style.boxShadow = 'none';
    if (globalErr) {
       globalErr.innerHTML = '⚠️ Perbaiki data yang merah di atas untuk mendaftar.';
       globalErr.style.display = 'block';
    }
  }
};

async function handleAuthSubmit(e, type) {
  e.preventDefault();
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[A-Za-z\s.\-']+$/;
  
  const emailEl = document.getElementById('auth-email');
  const emailVal = emailEl.value.trim();
  let hasError = false;
  
  if (!emailRegex.test(emailVal)) {
    emailEl.style.borderColor = '#ef4444';
    emailEl.style.backgroundColor = '#fef2f2';
    document.getElementById('lbl-auth-email').style.color = '#ef4444';
    const errDiv = document.getElementById('err-auth-email');
    errDiv.innerHTML = '⚠️ Format alamat email tidak valid.';
    errDiv.style.display = 'block';
    hasError = true;
  }
  
  if (type === 'register') {
    const nameEl = document.getElementById('auth-name');
    const nameVal = nameEl.value.trim();
    if (!nameRegex.test(nameVal)) {
      nameEl.style.borderColor = '#ef4444';
      nameEl.style.backgroundColor = '#fef2f2';
      document.getElementById('lbl-auth-name').style.color = '#ef4444';
      const errDiv = document.getElementById('err-auth-name');
      errDiv.innerHTML = '⚠️ Nama hanya boleh berisi huruf (tanpa angka/simbol).';
      errDiv.style.display = 'block';
      hasError = true;
    }
  }
  
  if (hasError) return;

  const btn = document.getElementById('auth-btn-submit');
  const oldText = btn.textContent;
  btn.textContent = 'Memproses...';
  btn.disabled = true;

  try {
    const email = emailVal;
    const pass = document.getElementById('auth-pass').value;
    let user;

    if (type === 'login') {
      user = await AuthService.login(email, pass);
    } else {
      const name = document.getElementById('auth-name').value;
      const role = document.querySelector('input[name="auth-role"]:checked').value;
      
      if (pass.length < 6) {
        showToast("Pendaftaran gagal: Password minimal harus 6 karakter untuk keamanan.");
        btn.textContent = oldText; btn.disabled = false;
        return;
      }
      
      user = await AuthService.register(name, email, pass, role);
    }

    State.user = user;
    try {
      const pkgs = await PackageService.getSavedPackages();
      State.savedPackages = pkgs || [];
    } catch(e) { console.warn("Failed fetching saved packages", e); }
    
    try {
      const favs = await FavoriteService.getFavorites();
      State.favorites = favs.map(f => f.locationId);
    } catch(e) { console.warn("Failed fetching favorites", e); }

    closeModal();
    showToast('Berhasil masuk! Selamat datang, ' + user.fullName.split(' ')[0]);
    renderApp();
  } catch (err) {
    alert(err.message);
    btn.textContent = oldText;
    btn.disabled = false;
  }
}
