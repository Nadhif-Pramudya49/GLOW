// ===== MAIN APP RENDERER =====

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '';

  // Navbar
  app.appendChild(renderNavbar());

  // Page
  let pageEl;
  switch (State.currentPage) {
    case 'search':      pageEl = renderSearchPage(); break;
    case 'package':     pageEl = renderPackagePage(); break;
    case 'booking':     pageEl = renderBookingPage(); break;
    case 'productivity': pageEl = renderProductivityPage(); break;
    case 'review':      pageEl = renderReviewPage(); break;
    default:            pageEl = renderSearchPage();
  }
  app.appendChild(pageEl);

  // Footer
  app.appendChild(renderFooter());
}

function renderFooter() {
  const footer = el('footer', '');
  footer.style.cssText = 'background:var(--green-dark);color:rgba(255,255,255,0.7);padding:3rem 0;margin-top:4rem';
  footer.innerHTML = `
    <div class="container">
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2rem;flex-wrap:wrap">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:800;color:var(--gold);margin-bottom:0.5rem">GLOW</div>
          <div style="font-size:0.75rem;opacity:0.6;margin-bottom:1rem;letter-spacing:2px">GUNUNG KIDUL LOCATION FOR WORK</div>
          <p style="font-size:0.875rem;line-height:1.7;opacity:0.7">Platform workation #1 di Gunung Kidul. Temukan hotel, cafe, wisata, dan kuliner terbaik untuk pengalaman kerja yang tak terlupakan.</p>
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
          <div style="font-size:0.8rem;opacity:0.7;line-height:2">📧 hello@glowgk.id<br/>📱 +62 812-3456-7890<br/>📍 Gunung Kidul, DIY<br/><br/>
            <span style="font-size:1.25rem;cursor:pointer;opacity:0.8" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">🌐</span>
            <span style="font-size:1.25rem;cursor:pointer;opacity:0.8;margin:0 8px" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">📸</span>
            <span style="font-size:1.25rem;cursor:pointer;opacity:0.8" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">🐦</span>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:2rem;padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <div style="font-size:0.8rem;opacity:0.5">© 2025 GLOW — Gunung Kidul Location for Work. All rights reserved.</div>
        <div style="font-size:0.8rem;opacity:0.5">Made with ❤️ for workation enthusiasts</div>
      </div>
    </div>
  `;
  return footer;
}

// ===== INIT APP =====
document.addEventListener('DOMContentLoaded', () => {
  renderApp();

  // Handle browser back/forward
  window.addEventListener('popstate', () => renderApp());
});
