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
  let pageResult = null;
  switch (State.currentPage) {
    case 'search':      pageResult = renderSearchPage(); break;
    case 'package':     pageResult = renderPackagePage(); break;
    case 'booking':     pageResult = renderBookingPage(); break;
    case 'productivity': pageResult = renderProductivityPage(); break;
    case 'review':      pageResult = renderReviewPage(); break;
    default:            pageResult = renderSearchPage();
  }

  // Handle both sync and async render results
  if (pageResult instanceof Promise) {
    pageResult.then(pageEl => {
      app.appendChild(pageEl);
      app.appendChild(renderFooter());
      renderBottomNav();
    });
  } else {
    app.appendChild(pageResult);
    app.appendChild(renderFooter());
    renderBottomNav();
  }
}

function renderFooter() {
  const footer = el('footer', '');
  footer.style.cssText = 'background:var(--green-dark);color:rgba(255,255,255,0.7);padding:3rem 0;margin-top:4rem';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2rem">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:800;color:var(--gold);margin-bottom:0.5rem">GLOW</div>
          <div style="font-size:0.75rem;opacity:0.6;margin-bottom:1rem;letter-spacing:2px">GUNUNG KIDUL LOCATION FOR WORK</div>
          <p style="font-size:0.875rem;line-height:1.7;opacity:0.7">Platform workation Pertama di Gunung Kidul. Temukan hotel, cafe, wisata, dan kuliner terbaik untuk pengalaman kerja yang tak terlupakan.</p>
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:1rem;font-size:0.875rem">Platform</div>
          ${['Cari Tempat','Package Builder','Booking','Productivity Mode','Review'].map(l=>`<div style="margin-bottom:0.5rem;font-size:0.8rem;cursor:pointer;opacity:0.7" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">${l}</div>`).join('')}
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:1rem;font-size:0.875rem">Destinasi</div>
          ${['Pantai Indrayanti','Goa Jomblang','Bukit Panguk','Pantai Siung','Goa Pindul'].map(l=>`<div style="margin-bottom:0.5rem;font-size:0.8rem;opacity:0.7">${l}</div>`).join('')}
        </div>
        <div>
          <div style="font-weight:700;color:#fff;margin-bottom:1rem;font-size:0.875rem">Hubungi Kami</div>
          <div style="font-size:0.8rem;opacity:0.7;line-height:2">📧 glow@gmail.com<br/>📱 +62 858-9986-5721<br/>📍 Gunung Kidul, DIY<br/><br/>
            <span style="font-size:1.25rem;cursor:pointer;opacity:0.8" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">🌐</span>
            <span style="font-size:1.25rem;cursor:pointer;opacity:0.8;margin:0 8px" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">📸</span>
            <span style="font-size:1.25rem;cursor:pointer;opacity:0.8" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">🐦</span>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:2rem;padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <div style="font-size:0.8rem;opacity:0.5">© 2026 GLOW — Gunung Kidul Location for Work. All rights reserved.</div>
        <div style="font-size:0.8rem;opacity:0.5">Made for Freelancers</div>
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

  // Auto-advance every 5 seconds
  _heroSlideTimer = setInterval(() => {
    _heroCurrentSlide = (_heroCurrentSlide + 1) % slides.length;
    _updateSlide(slides, dots, label, _heroCurrentSlide);
  }, 5000);
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
document.addEventListener('DOMContentLoaded', () => {
  renderApp();

  // Handle browser back/forward
  window.addEventListener('popstate', () => renderApp());
});
