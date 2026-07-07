// ===== MAIN APP RENDERER =====

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '';

  // Reset mobile menu state on page change
  _mobileMenuOpen = false;
  document.body.style.overflow = '';

  // Bersihkan drawer & backdrop lama dari body (karena tidak masuk #app)
  document.getElementById('mobile-drawer')?.remove();
  document.getElementById('drawer-backdrop')?.remove();
  document.getElementById('bottom-nav')?.remove();

  // Navbar
  app.appendChild(renderNavbar());

  // Page
  const [page, param] = State.currentPage.split('?');
  const pageResult = renderPage(page, param);

  // Handle both sync and async render results
  if (pageResult instanceof Promise) {
    pageResult.then(pageEl => {
      app.appendChild(pageEl);
      if (!page.startsWith('dashboard')) app.appendChild(renderFooter());
      renderBottomNav();
    });
  } else {
    app.appendChild(pageResult);
    if (!page.startsWith('dashboard')) app.appendChild(renderFooter());
    renderBottomNav();
  }
}

function renderFooter() {
  const footer = el('footer', '');
  footer.style.cssText = 'background:var(--gray-900);color:rgba(255,255,255,0.7);padding:4rem 0 2rem;margin-top:4rem';
  footer.innerHTML = `
    <div class="container" style="max-width:1200px;margin:0 auto;padding:0 2rem">
      <div class="footer-grid" style="display:grid;grid-template-columns:2fr 1fr 1fr 1.5fr;gap:3rem">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:900;color:#FFFFFF;margin-bottom:0.5rem;letter-spacing:1px">GLOW</div>
          <div style="font-size:0.75rem;opacity:0.6;margin-bottom:1.5rem;letter-spacing:2px">GUNUNG KIDUL LOCATION FOR WORK</div>
          <p style="font-size:0.9rem;line-height:1.8;opacity:0.8;padding-right:2rem">Platform workation Pertama di Gunung Kidul. Temukan hotel, cafe, wisata, dan kuliner terbaik untuk pengalaman kerja jarak jauh yang tak terlupakan.</p>
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:1.5rem;font-size:0.95rem">Platform</div>
          ${['Pencarian Tempat','Package Builder','Pemesanan','Productivity Mode','Ulasan'].map(l=>`<div style="margin-bottom:1rem;font-size:0.85rem;cursor:pointer;opacity:0.7;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">${l}</div>`).join('')}
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:1.5rem;font-size:0.95rem">Destinasi</div>
          ${['Pantai Indrayanti','Goa Jomblang','Bukit Panguk','Pantai Siung','Goa Pindul'].map(l=>`<div style="margin-bottom:1rem;font-size:0.85rem;opacity:0.7;cursor:pointer;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">${l}</div>`).join('')}
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:1.5rem;font-size:0.95rem">Hubungi Kami</div>
          <div style="font-size:0.85rem;opacity:0.8;line-height:2.2">
            <div style="display:flex;align-items:center;gap:0.5rem"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> hello@glow.id</div>
            <div style="display:flex;align-items:center;gap:0.5rem"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> +62 858-9986-5721</div>
            <div style="display:flex;align-items:center;gap:0.5rem"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Gunung Kidul, DIY</div>
            <br/>
            <div style="display:flex;gap:1rem;margin-top:0.5rem">
              <span style="cursor:pointer;opacity:0.7;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></span>
              <span style="cursor:pointer;opacity:0.7;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></span>
              <span style="cursor:pointer;opacity:0.7;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></span>
            </div>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:3rem;padding-top:2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <div style="font-size:0.85rem;opacity:0.6">© 2026 GLOW — Gunung Kidul Location for Work. All rights reserved.</div>
        <div style="font-size:0.85rem;opacity:0.6;display:flex;gap:1.5rem">
          <span style="cursor:pointer" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">Kebijakan Privasi</span>
          <span style="cursor:pointer" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">Syarat & Ketentuan</span>
        </div>
      </div>
    </div>
  `;
  return footer;
}

// ===== HERO SLIDESHOW =====
let _heroSlideTimer = null;
let _heroCurrentSlide = 0;

function initHeroSlideshow() {
  // Clear any existing interval
  if (_heroSlideTimer) clearInterval(_heroSlideTimer);

  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  const label  = document.getElementById('hero-slide-label');
  if (!slides.length) return;

  // Auto-advance every 8 seconds
  _heroSlideTimer = setInterval(() => {
    _heroCurrentSlide = (_heroCurrentSlide + 1) % slides.length;
    _updateSlide(slides, dots, label, _heroCurrentSlide);
  }, 8000);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  const label  = document.getElementById('hero-slide-label');
  _heroCurrentSlide = index;
  _updateSlide(slides, dots, label, index);

  // Reset timer on manual nav
  if (_heroSlideTimer) clearInterval(_heroSlideTimer);
  _heroSlideTimer = setInterval(() => {
    _heroCurrentSlide = (_heroCurrentSlide + 1) % slides.length;
    _updateSlide(slides, dots, label, _heroCurrentSlide);
  }, 5000);
}

function _updateSlide(slides, dots, label, index) {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i)  => d.classList.toggle('active',  i === index));
  if (label) {
    const activeSlide = slides[index];
    label.classList.remove('visible');
    setTimeout(() => {
      label.textContent = activeSlide?.dataset?.label || '';
      label.classList.add('visible');
    }, 300);
  }
}

// ===== INIT APP =====
document.addEventListener('DOMContentLoaded', async () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    State.currentPage = hash;
  }

  // Cek sesi login
  try {
    const user = await AuthService.getMe();
    if (user) {
      State.user = user;
      try {
        const pkgs = await PackageService.getSavedPackages();
        State.savedPackages = pkgs || [];
      } catch(e) { console.warn("Failed fetching saved packages", e); }
      
      try {
        const favs = await FavoriteService.getFavorites();
        State.favorites = favs.map(f => f.locationId);
      } catch(e) { console.warn("Failed fetching favorites", e); }
    }
  } catch(e) {}

  // Global listener for Favorites real-time badge update
  State.subscribe('favorites', (favs) => {
    const badge = document.getElementById('nav-fav-badge');
    if (badge) {
      badge.innerText = favs.length;
      badge.style.display = favs.length > 0 ? 'flex' : 'none';
      badge.style.transform = 'scale(1.4)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    }
  });

  renderApp();

  // Handle browser back/forward (hash routing)
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '');
    if (newHash && newHash !== State.currentPage) {
      State.currentPage = newHash || 'search';
      renderApp();
    }
  });
});

// ===== PAGE ROUTING & GUARDS =====
function renderPage(page, param) {
  let pageResult;
  
  // Route Guards
  const protectedRoutes = ['dashboard-user', 'dashboard-owner', 'dashboard-admin', 'profile'];
  if (protectedRoutes.includes(page) && !State.user) {
    showToast('Anda harus login untuk mengakses halaman ini.');
    navigate('search');
    return el('div', '');
  }
  
  // Role-based Route Guards
  if (page === 'dashboard-owner' && State.user?.role !== 'OWNER' && State.user?.role !== 'ADMIN') {
    showToast('Akses ditolak. Halaman khusus Owner.');
    navigate('search');
    return el('div', '');
  }
  if (page === 'dashboard-admin' && State.user?.role !== 'ADMIN') {
    showToast('Akses ditolak. Halaman khusus Administrator.');
    navigate('search');
    return el('div', '');
  }
  
  switch (page) {
    case 'search': pageResult = renderSearchPage(); break;
    case 'favorites': pageResult = renderFavoritesPage(); break;
    case 'location-detail':
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const id = urlParams.get('id') || State._navData?.id;
      pageResult = renderLocationDetail(id);
      break;
    case 'package': pageResult = renderPackagePage(); break;
    case 'booking': pageResult = renderBookingPage(); break;
    case 'productivity': pageResult = renderProductivityPage(); break;
    case 'review': pageResult = renderReviewPage(); break;
    case 'profile': pageResult = renderProfilePage(); break;
    case 'dashboard-user': pageResult = renderDashboardUser(); break;
    case 'dashboard-owner': pageResult = renderDashboardOwner(); break;
    case 'dashboard-admin': pageResult = renderDashboardAdmin(); break;
    default: pageResult = renderSearchPage(); break;
  }
  
  return pageResult;
}
