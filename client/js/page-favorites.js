function renderFavoritesPage() {
  if (!State.user && State.favorites.length > 0) {
    State.set('favorites', []);
    showToast('Sesi favorit dihapus. Silakan login terlebih dahulu.');
  }

  const page = el('div', 'page-favorites');
  page.style.cssText = 'animation: fadeIn 0.3s ease;';

  // Hero Section (Full width, with background image)
  const hero = el('div', 'hero-favorites');
  hero.style.cssText = `
    width: 100%;
    min-height: 380px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)), url('assets/images/w1-segara-cafe.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 3rem 1rem 5rem 1rem;
    color: white;
  `;
  hero.innerHTML = `
    <h1 style="font-size: 3.5rem; font-weight: 900; color: #fff; margin-bottom: 1.25rem; letter-spacing: -0.03em; line-height: 1.1; text-shadow: 0 2px 8px rgba(0,0,0,0.4);">
      Wishlist <span style="color: #34d399;">Favorit</span>
    </h1>
    <p style="color: rgba(255,255,255,0.9); font-size: 1.15rem; max-width: 600px; margin: 0 auto; line-height: 1.7; text-shadow: 0 1px 4px rgba(0,0,0,0.4);">
      Simpan dan kelola lokasi workation impian Anda di Gunung Kidul. Tempat terbaik untuk fokus, bersantai, dan merangkai inspirasi.
    </p>
  `;
  page.appendChild(hero);

  const container = el('div', 'container');
  // Negative margin-top creates the overlap effect over the hero background
  container.style.cssText = 'padding: 0 1rem 2rem 1rem; max-width: 1200px; margin: -3.5rem auto 0 auto; min-height: 50vh; position: relative; z-index: 10;';
  page.appendChild(container);

  // Controls (Search, Filter, Sort)
  const controls = el('div', '');
  controls.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap; align-items: center; justify-content: space-between; background: #fff; padding: 1.25rem; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid var(--gray-100);';
  
  // Create state for internal page
  const pageState = {
    search: '',
    category: 'all',
    sort: 'newest'
  };

  controls.innerHTML = `
    <div style="flex: 1; min-width: 250px; position: relative;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); pointer-events: none;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" id="fav-search" placeholder="Cari lokasi favorit..." style="width: 100%; padding: 0.875rem 2.5rem 0.875rem 2.5rem; border: 1px solid var(--gray-200); border-radius: 12px; outline: none; font-family: inherit; transition: border 0.2s, box-shadow 0.2s; font-size: 0.95rem; background: var(--gray-50);" onfocus="this.style.borderColor='var(--green)'; this.style.boxShadow='0 0 0 3px rgba(15,118,110,0.1)'; this.style.background='#fff';" onblur="this.style.borderColor='var(--gray-200)'; this.style.boxShadow='none'; this.style.background='var(--gray-50)';" />
      <div id="fav-search-clear" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--gray-400); display: none; padding: 4px; border-radius: 50%; transition: background 0.2s, color 0.2s;" onmouseover="this.style.background='var(--gray-200)'; this.style.color='var(--gray-600)';" onmouseout="this.style.background='transparent'; this.style.color='var(--gray-400)';">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>
    </div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      
      <!-- Custom Dropdown: Category -->
      <div class="custom-dropdown" id="dropdown-category" style="position: relative; min-width: 180px; user-select: none;">
        <div class="dropdown-trigger" style="padding: 0.875rem 2.5rem 0.875rem 1.25rem; border: 1px solid var(--gray-200); border-radius: 12px; background: var(--gray-50); cursor: pointer; font-size: 0.95rem; color: var(--gray-800); transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
          <span class="dropdown-value">Semua Kategori</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-icon" style="transition: transform 0.2s; position: absolute; right: 1rem;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="dropdown-menu" style="position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 1px solid var(--gray-200); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); z-index: 100; overflow: hidden; padding: 0.5rem;">
          <div class="dropdown-item" data-value="all" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s; background: var(--green-50, rgba(16,185,129,0.1)); color: var(--green); font-weight: 600;">Semua Kategori</div>
          <div class="dropdown-item" data-value="penginapan" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Akomodasi</div>
          <div class="dropdown-item" data-value="workspace" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Cafe & Coworking</div>
          <div class="dropdown-item" data-value="wisata" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Wisata</div>
          <div class="dropdown-item" data-value="kuliner" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Kuliner</div>
        </div>
      </div>

      <!-- Custom Dropdown: Sort -->
      <div class="custom-dropdown" id="dropdown-sort" style="position: relative; min-width: 180px; user-select: none;">
        <div class="dropdown-trigger" style="padding: 0.875rem 2.5rem 0.875rem 1.25rem; border: 1px solid var(--gray-200); border-radius: 12px; background: var(--gray-50); cursor: pointer; font-size: 0.95rem; color: var(--gray-800); transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
          <span class="dropdown-value">Baru Ditambahkan</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-icon" style="transition: transform 0.2s; position: absolute; right: 1rem;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <div class="dropdown-menu" style="position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 1px solid var(--gray-200); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); z-index: 100; overflow: hidden; padding: 0.5rem;">
          <div class="dropdown-item" data-value="newest" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s; background: var(--green-50, rgba(16,185,129,0.1)); color: var(--green); font-weight: 600;">Baru Ditambahkan</div>
          <div class="dropdown-item" data-value="rating_high" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Rating Tertinggi</div>
          <div class="dropdown-item" data-value="price_low" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Harga Terendah</div>
          <div class="dropdown-item" data-value="price_high" style="padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; font-size: 0.95rem; color: var(--gray-800); transition: background 0.15s;">Harga Tertinggi</div>
        </div>
      </div>

    </div>
  `;
  container.appendChild(controls);

  // Grid Container
  const gridContainer = el('div', '');
  container.appendChild(gridContainer);

  let renderTimeout = null;

  const renderGrid = () => {
    // Loading State
    gridContainer.innerHTML = `
      <div style="display: flex; justify-content: center; padding: 4rem; color: var(--gray-400);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
    `;

    if (renderTimeout) clearTimeout(renderTimeout);

    renderTimeout = setTimeout(async () => {
      let favoritesIds = State.favorites || [];
      
      // Empty State (No favorites at all)
      if (favoritesIds.length === 0) {
        gridContainer.innerHTML = `
          <div style="text-align: center; padding: 6rem 2rem; background: #fff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="width: 80px; height: 80px; background: rgba(15,118,110,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path></svg>
            </div>
            <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--gray-900); margin-bottom: 0.75rem;">Belum Ada Favorit</h3>
            <p style="color: var(--gray-500); margin-bottom: 2rem; max-width: 400px; margin-left: auto; margin-right: auto;">Anda belum menyimpan lokasi apapun. Eksplorasi tempat workation terbaik dan simpan untuk merencanakan perjalanan Anda nanti.</p>
            <button class="btn btn-primary" onclick="navigate('search')" style="padding: 0.875rem 2rem; font-weight: 700;">Eksplorasi Sekarang</button>
          </div>
        `;
        return;
      }

      // Fetch API_DATA if not available
      if (typeof API_DATA !== 'undefined' && !API_DATA) {
        try {
          API_DATA = await LocationService.getLocations();
        } catch (e) {
          console.error("Failed to fetch API_DATA on favorites page:", e);
        }
      }

      // Fetch actual item data from DATA
      let items = [];
      const source = (typeof API_DATA !== 'undefined' && API_DATA) ? API_DATA : DATA;
      Object.keys(source).forEach(cat => {
        source[cat].forEach(item => {
          if (favoritesIds.includes(String(item.id))) items.push(item);
        });
      });

      // Filter by Category
      if (pageState.category !== 'all') {
        items = items.filter(i => i.category === pageState.category);
      }

      // Filter by Search
      if (pageState.search.trim() !== '') {
        const q = pageState.search.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(q) || (i.desc && i.desc.toLowerCase().includes(q)));
      }

      // Sort
      if (pageState.sort === 'rating_high') {
        items.sort((a,b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      } else if (pageState.sort === 'price_low') {
        items.sort((a,b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
      } else if (pageState.sort === 'price_high') {
        items.sort((a,b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
      } else {
        // newest (by order in favoritesIds array, reversed)
        items.sort((a,b) => favoritesIds.indexOf(String(b.id)) - favoritesIds.indexOf(String(a.id)));
      }

      // Render Grid
      if (items.length === 0) {
        gridContainer.innerHTML = `
          <div style="text-align: center; padding: 4rem 2rem;">
            <p style="color: var(--gray-500); font-size: 1.1rem;">Tidak ada lokasi yang cocok dengan filter pencarian Anda.</p>
          </div>
        `;
      } else {
        const grid = el('div', '');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;';
        
        items.forEach(item => {
          grid.appendChild(renderItemCard(item));
        });
        
        gridContainer.innerHTML = '';
        gridContainer.appendChild(grid);
      }
    }, 300); // Simulate subtle loading
  };

  // Event Listeners for controls
  const searchInput = controls.querySelector('#fav-search');
  const clearBtn = controls.querySelector('#fav-search-clear');
  
  searchInput.addEventListener('input', (e) => {
    pageState.search = e.target.value;
    clearBtn.style.display = pageState.search.trim().length > 0 ? 'block' : 'none';
    renderGrid();
  });
  
  clearBtn.addEventListener('click', () => {
    pageState.search = '';
    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
    renderGrid();
  });
  
  // Helper to manage custom dropdowns
  function setupDropdown(dropdownId, stateKey) {
    const dropdown = controls.querySelector(`#${dropdownId}`);
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const valueEl = dropdown.querySelector('.dropdown-value');
    const icon = dropdown.querySelector('.dropdown-icon');

    // Toggle menu
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.style.visibility === 'visible';
      
      // Close all other dropdowns first
      document.querySelectorAll('.custom-dropdown .dropdown-menu').forEach(m => {
        m.style.opacity = '0';
        m.style.visibility = 'hidden';
        m.style.transform = 'translateY(-10px)';
      });
      document.querySelectorAll('.custom-dropdown .dropdown-trigger').forEach(t => {
        t.style.borderColor = 'var(--gray-200)';
        t.style.background = 'var(--gray-50)';
      });
      document.querySelectorAll('.custom-dropdown .dropdown-icon').forEach(i => {
        i.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        menu.style.opacity = '1';
        menu.style.visibility = 'visible';
        menu.style.transform = 'translateY(0)';
        trigger.style.borderColor = 'var(--green)';
        trigger.style.background = '#fff';
        icon.style.transform = 'rotate(180deg)';
      }
    });

    // Handle item selection
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Update styling
        items.forEach(i => {
          i.style.background = 'transparent';
          i.style.color = 'var(--gray-800)';
          i.style.fontWeight = 'normal';
        });
        item.style.background = 'var(--green-50, rgba(16,185,129,0.1))';
        item.style.color = 'var(--green)';
        item.style.fontWeight = '600';

        // Update trigger text
        valueEl.innerText = item.innerText;

        // Close menu
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(-10px)';
        trigger.style.borderColor = 'var(--gray-200)';
        trigger.style.background = 'var(--gray-50)';
        icon.style.transform = 'rotate(0deg)';

        // Update state and render
        pageState[stateKey] = item.getAttribute('data-value');
        renderGrid();
      });

      // Hover effects
      item.addEventListener('mouseover', () => {
        if (item.getAttribute('data-value') !== pageState[stateKey]) {
          item.style.background = 'var(--gray-100)';
        }
      });
      item.addEventListener('mouseout', () => {
        if (item.getAttribute('data-value') !== pageState[stateKey]) {
          item.style.background = 'transparent';
        }
      });
    });
  }

  setupDropdown('dropdown-category', 'category');
  setupDropdown('dropdown-sort', 'sort');

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown .dropdown-menu').forEach(m => {
      m.style.opacity = '0';
      m.style.visibility = 'hidden';
      m.style.transform = 'translateY(-10px)';
    });
    document.querySelectorAll('.custom-dropdown .dropdown-trigger').forEach(t => {
      t.style.borderColor = 'var(--gray-200)';
      t.style.background = 'var(--gray-50)';
    });
    document.querySelectorAll('.custom-dropdown .dropdown-icon').forEach(i => {
      i.style.transform = 'rotate(0deg)';
    });
  });

  // Re-render when favorites change (in case they remove one while on the page)
  State.subscribe('favorites', () => {
    if (State.currentPage === 'favorites') {
      renderGrid();
    }
  });

  // Add CSS animation for loader if not exists
  if (!document.getElementById('fav-spin-style')) {
    const style = document.createElement('style');
    style.id = 'fav-spin-style';
    style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }

  renderGrid();

  return page;
}
