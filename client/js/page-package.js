// ===== PAGE: PACKAGE BUILDER =====

let pkgState = {
  expandedSections: { penginapan: true, workspace: true, transport: true, activities: true },
  autoRec: false,
  budgetLimit: 5000000,
  limits: { penginapan: 4, workspace: 4, transport: 4, activities: 4 },
  filterArea: { penginapan: 'all', workspace: 'all', transport: 'all', activities: 'all' },
  filterAreaLabel: { penginapan: 'Semua Area', workspace: 'Semua Area', transport: 'Semua Area', activities: 'Semua Area' },
  sortBy: { penginapan: 'default', workspace: 'default', transport: 'default', activities: 'default' },
  sortByLabel: { penginapan: 'Urutkan', workspace: 'Urutkan', transport: 'Urutkan', activities: 'Urutkan' }
};

window.togglePkgDropdown = (id) => {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  const menu = dropdown.querySelector('.dropdown-menu');
  const trigger = dropdown.querySelector('.dropdown-trigger');
  const icon = dropdown.querySelector('.dropdown-icon');
  const isOpen = menu.style.visibility === 'visible';
  
  window.closeAllPkgDropdowns();
  
  if (!isOpen) {
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateY(0)';
    trigger.style.borderColor = 'var(--green)';
    icon.style.transform = 'rotate(180deg)';
  }
};

window.closeAllPkgDropdowns = () => {
  document.querySelectorAll('.pkg-section .custom-dropdown .dropdown-menu').forEach(m => {
    m.style.opacity = '0';
    m.style.visibility = 'hidden';
    m.style.transform = 'translateY(-5px)';
  });
  document.querySelectorAll('.pkg-section .custom-dropdown .dropdown-trigger').forEach(t => {
    t.style.borderColor = 'var(--gray-200)';
  });
  document.querySelectorAll('.pkg-section .custom-dropdown .dropdown-icon').forEach(i => {
    i.style.transform = 'rotate(0deg)';
  });
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-dropdown') && window.closeAllPkgDropdowns) {
    window.closeAllPkgDropdowns();
  }
});

window.selectPkgDropdown = (cat, type, val, label) => {
  if (type === 'area') {
    pkgState.filterArea[cat] = val;
    pkgState.filterAreaLabel[cat] = label;
  } else {
    pkgState.sortBy[cat] = val;
    pkgState.sortByLabel[cat] = label;
  }
  renderApp(); 
};

window.setActivityFilter = (filter) => {
  pkgState.activityFilter = filter;
  renderApp();
};

window.applyFilterAndSort = (items, cat) => {
  let res = [...items];
  
  // Filter Area
  const area = pkgState.filterArea[cat];
  if (area === 'selatan') {
    res = res.filter(i => (i.name + (i.desc||'') + (i.suasana||[]).join('')).toLowerCase().match(/pantai|laut|selatan|sea/));
  } else if (area === 'utara') {
    res = res.filter(i => (i.name + (i.desc||'') + (i.suasana||[]).join('')).toLowerCase().match(/bukit|gunung|pinus|hutan|goa/));
  }
  
  // Sort
  const sort = pkgState.sortBy[cat];
  if (sort === 'price_asc') {
    res.sort((a, b) => (a.price||0) - (b.price||0));
  } else if (sort === 'price_desc') {
    res.sort((a, b) => (b.price||0) - (a.price||0));
  } else if (sort === 'rating_desc') {
    res.sort((a, b) => parseFloat(b.rating||0) - parseFloat(a.rating||0));
  }
  
  return res;
};

function renderPackagePage() {


  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  if (!API_DATA) {
    page.innerHTML = `
      <div style="max-width:1280px; margin:0 auto; padding:5rem 1.5rem; text-align:center; color:var(--gray-500);">
        <div style="height:40px; width:200px; background:var(--gray-200); border-radius:8px; margin:0 auto 1rem; animation:pulse 1.5s infinite;"></div>
        <p>Menyiapkan Package Builder...</p>
        <style>@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }</style>
      </div>
    `;
    (async () => {
      try {
        API_DATA = await LocationService.getLocations();
        renderApp();
      } catch (error) {
        if (typeof DATA !== 'undefined') {
          API_DATA = DATA;
        } else {
          API_DATA = [];
        }
        renderApp();
      }
    })();
    return page;
  }

  const pkg_state_check = State.package;
  const isStep1Done = pkg_state_check.penginapan && pkg_state_check.penginapan.length > 0;
  const isStep2Done = pkg_state_check.workspaces && pkg_state_check.workspaces.length > 0;
  const isStep3Done = !!pkg_state_check.transport;
  const isStep4Done = pkg_state_check.activities && pkg_state_check.activities.length > 0;
  const isStep5Done = isStep1Done && isStep2Done && isStep3Done && isStep4Done;

  let activeStep = 1;
  if (isStep1Done) activeStep = 2;
  if (isStep1Done && isStep2Done) activeStep = 3;
  if (isStep1Done && isStep2Done && isStep3Done) activeStep = 4;
  if (isStep1Done && isStep2Done && isStep3Done && isStep4Done) activeStep = 5;

  const getStepCircle = (stepNum, isDone, isActive) => {
    if (isDone && !isActive && stepNum !== 5) {
      return `<div style="width:24px;height:24px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;flex-shrink:0;border:2px solid rgba(255,255,255,0.8); transition:all 0.3s ease;">✓</div>`;
    } else if (isActive || (isDone && stepNum === 5)) {
      return `<div style="width:24px;height:24px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;border:2px solid rgba(255,255,255,0.8); animation:pulse-step 1.5s infinite; transition:all 0.3s ease;">${stepNum}</div>`;
    } else {
      return `<div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.5);color:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0; transition:all 0.3s ease;">${stepNum}</div>`;
    }
  };

  const getStepText = (isDone, isActive, title, subtitle) => {
    const opacity = (isDone || isActive) ? '1' : '0.5';
    return `
      <div style="opacity:${opacity}; transition:all 0.3s ease; cursor:pointer;" onclick="document.getElementById('pkg-${title.toLowerCase().includes('penginapan')?'penginapan':title.toLowerCase().includes('workspace')?'workspace':title.toLowerCase().includes('transport')?'transport':'activities'}')?.scrollIntoView({behavior:'smooth', block:'center'})">
        <div style="font-weight:600;font-size:0.875rem;">${title}</div>
        <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">${subtitle}</div>
      </div>
    `;
  };

  const header = el('div', '', '');
  header.style.cssText = 'position:relative; background:url("assets/images/hero-culture.png") center/cover; padding:6rem 0 5rem; color:var(--white); margin-bottom: 2rem;';
  header.innerHTML = `
    <style>
      @keyframes pulse-step {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
        70% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      @keyframes section-pulse {
        0% { box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.2); border-color: var(--green); }
        50% { box-shadow: 0 0 0 8px rgba(15, 118, 110, 0); border-color: var(--green); }
        100% { box-shadow: 0 0 0 0 rgba(15, 118, 110, 0); border-color: rgba(15, 118, 110, 0.2); }
      }
    </style>
    <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);z-index:1;"></div>
    <div class="container" style="position:relative;z-index:2;display:grid;grid-template-columns:1fr 360px;gap:3rem;align-items:center;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:100px;padding:6px 16px;margin-bottom:1rem;font-size:0.875rem;color:var(--white);font-weight:600;">Package Builder</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:800;margin-bottom:0.5rem;color:var(--white);letter-spacing:-0.02em;">Susun Paket Workation<br/>Sesuai Keinginanmu</h1>
        <p style="opacity:0.9;max-width:500px;color:var(--white);font-size:1.1rem;margin-bottom:2rem;">Pilih penginapan, workspace, transportasi, dan aktivitas — atur sendiri sesuai budget.</p>
      </div>
      
      <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:16px;padding:1.5rem;color:var(--white);">
        <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:1.5rem;">Langkah Membuat Paket</h3>
        <div style="display:flex;flex-direction:column;gap:1.25rem;position:relative;">
          <div style="position:absolute;left:11px;top:20px;bottom:20px;width:2px;background:rgba(255,255,255,0.2);"></div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            ${getStepCircle(1, isStep1Done, activeStep === 1)}
            ${getStepText(isStep1Done, activeStep === 1, 'Pilih Penginapan', 'Tentukan tempat menginapmu')}
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            ${getStepCircle(2, isStep2Done, activeStep === 2)}
            ${getStepText(isStep2Done, activeStep === 2, 'Pilih Workspace', 'Pilih tempat kerja yang nyaman')}
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            ${getStepCircle(3, isStep3Done, activeStep === 3)}
            ${getStepText(isStep3Done, activeStep === 3, 'Pilih Transportasi', 'Pilih transportasi selama di Gunung Kidul')}
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            ${getStepCircle(4, isStep4Done, activeStep === 4)}
            ${getStepText(isStep4Done, activeStep === 4, 'Pilih Aktivitas', 'Tambahkan aktivitas pendukung')}
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            ${getStepCircle(5, isStep5Done, activeStep === 5)}
            <div style="opacity:${isStep5Done||activeStep===5?'1':'0.5'}; transition:all 0.3s ease; cursor:pointer;" onclick="document.querySelector('.package-summary')?.scrollIntoView({behavior:'smooth', block:'center'})">
              <div style="font-weight:600;font-size:0.875rem;">Review & Simpan Paket</div>
              <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">Cek kembali dan simpan paketmu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  page.appendChild(header);

  // Initialize default dates if not set
  if (!State.package.startDate) {
    const today = new Date();
    State.package.startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (State.package.nights || 4));
    State.package.endDate = endDate.toISOString().split('T')[0];
  }

  const datePickerBar = el('div', 'container', '');
  datePickerBar.style.marginTop = '-3.5rem';
  datePickerBar.style.position = 'relative';
  datePickerBar.style.zIndex = '10';
  datePickerBar.style.marginBottom = '3rem';
  
  datePickerBar.innerHTML = `
    <div style="background:var(--white); border-radius:100px; padding:0.5rem; display:flex; align-items:center; box-shadow:0 10px 25px rgba(0,0,0,0.1); border:1px solid var(--gray-200);">
      
      <!-- Lokasi -->
      <div style="flex:1; padding:0.5rem 1.5rem; display:flex; align-items:center; gap:1rem; border-right:1px solid var(--gray-200);">
        <div style="color:var(--gray-400);">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <div>
          <div style="font-size:0.75rem; font-weight:700; color:var(--gray-500); margin-bottom:2px;">LOKASI WORKATION</div>
          <div style="font-size:1rem; font-weight:600; color:var(--gray-800);">Gunung Kidul, Yogyakarta</div>
        </div>
      </div>
      
      <!-- Check-in & Check-out -->
      <div style="flex:1.5; padding:0.5rem 1.5rem; display:flex; align-items:center; gap:1rem;">
        <div style="color:var(--gray-400);">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; flex:1">
          <div style="flex:1">
            <div style="font-size:0.75rem; font-weight:700; color:var(--gray-500); margin-bottom:2px;">TANGGAL KEDATANGAN</div>
            <input type="date" id="pkg-start-date" value="${State.package.startDate}" onchange="updatePackageDates()" style="border:none; outline:none; font-family:inherit; font-size:1rem; font-weight:600; color:var(--gray-800); width:100%; cursor:pointer; background:transparent" />
          </div>
          <div style="color:var(--gray-300);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
          <div style="flex:1">
            <div style="font-size:0.75rem; font-weight:700; color:var(--gray-500); margin-bottom:2px;">TANGGAL KEPULANGAN</div>
            <input type="date" id="pkg-end-date" value="${State.package.endDate}" onchange="updatePackageDates()" style="border:none; outline:none; font-family:inherit; font-size:1rem; font-weight:600; color:var(--gray-800); width:100%; cursor:pointer; background:transparent" />
          </div>
        </div>
      </div>
      
      <!-- Durasi (Read Only) -->
      <div style="padding:0.5rem 1.5rem; display:flex; align-items:center; gap:1rem; border-left:1px solid var(--gray-200);">
         <div style="color:var(--green);">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
         </div>
         <div>
          <div style="font-size:0.75rem; font-weight:700; color:var(--gray-500); margin-bottom:2px;">DURASI</div>
          <div style="font-size:1rem; font-weight:600; color:var(--green);">${State.package.nights || 4} Malam</div>
        </div>
      </div>
      
    </div>
    </div>

    <style>
      .ai-btn-wrapper {
        position: relative;
        display: inline-flex;
        border-radius: 100px;
        padding: 4px;
        background: conic-gradient(from 0deg, #0cbaba, #38ef7d, #f9d423, #0cbaba);
        overflow: hidden;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
      }
      .ai-btn-wrapper:hover {
        transform: scale(1.1);
        box-shadow: 0 10px 25px rgba(56, 239, 125, 0.4);
      }
      .ai-btn-wrapper::before {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        width: 200%; height: 200%;
        background: conic-gradient(from 0deg, #0cbaba, #38ef7d, #f9d423, #0cbaba);
        transform: translate(-50%, -50%);
        z-index: 1;
        animation: spin-border 2s linear infinite;
        animation-play-state: paused;
      }
      .ai-btn-wrapper:hover::before {
        animation-play-state: running;
      }
      @keyframes spin-border {
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      .ai-btn-inner {
        position: relative;
        z-index: 2;
        background: #fff;
        border-radius: 100px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 2rem;
        font-weight: 800;
        font-size: 1.05rem;
        color: #111;
      }
      @keyframes expandIn {
        0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      .expand-in {
        animation: expandIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        transform-origin: top left;
      }
      @keyframes collapseOut {
        0% { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(0.95) translateY(-10px); }
      }
      .collapse-out {
        animation: collapseOut 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        transform-origin: top left;
      }
    </style>
    
    <div style="display:flex; justify-content:flex-start; align-items:center; margin-top:1.5rem;">
      <button onclick="toggleAiWizardInline()" style="border:none; background:none; padding:0; cursor:pointer; outline:none;">
        <div class="ai-btn-wrapper">
           <div class="ai-btn-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              Rekomendasi AI
           </div>
        </div>
      </button>
    </div>
    
    <div id="ai-wizard-inline-container" style="display:none; margin-top:1.5rem; width:100%; max-width:850px; background:#fff; border-radius:24px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border:1px solid var(--gray-200); overflow:hidden; z-index:11; position:relative;"></div>
  `;
  page.appendChild(datePickerBar);

  const main = el('div', 'container', '');
  main.style.paddingTop = '1rem';

  const sections = el('div', 'pkg-section');
  sections.appendChild(renderPkgPenginapan());
  sections.appendChild(renderPkgWorkspace());
  sections.appendChild(renderPkgTransport());
  sections.appendChild(renderPkgActivities());
  main.appendChild(sections);

  const summaryWrap = el('div', '');
  summaryWrap.id = 'simpan-paket-section';
  summaryWrap.style.marginTop = '4rem';
  summaryWrap.style.marginBottom = '4rem';
  summaryWrap.innerHTML = `<h2 style="font-family:'Playfair Display', serif; font-size:2rem; color:var(--gray-800); margin-bottom:1.5rem; text-align:center;">Review & Simpan Paket</h2>`;
  const summaryInner = el('div', '');
  summaryInner.style.maxWidth = '600px';
  summaryInner.style.margin = '0 auto';
  summaryInner.appendChild(renderPackageSummary());
  summaryWrap.appendChild(summaryInner);
  main.appendChild(summaryWrap);

  page.appendChild(main);
  return page;
}

function pkgSection(step, title, subtitle, id, content, iconSvg) {
  const wrap = el('div', 'mb-5');
  
  // Exclude area filter for transport as it's not location-based
  const filterAreaHTML = id !== 'transport' ? `
    <div class="custom-dropdown" id="dropdown-area-${id}" style="position: relative; min-width: 160px; user-select: none;">
      <div class="dropdown-trigger" onclick="event.stopPropagation(); togglePkgDropdown('dropdown-area-${id}')" style="padding: 0.5rem 2rem 0.5rem 1rem; border: 1px solid var(--gray-200); border-radius: 8px; background: var(--white); cursor: pointer; font-size: 0.875rem; color: var(--gray-700); transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
        <span class="dropdown-value">${pkgState.filterAreaLabel[id]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" style="transition: transform 0.2s; position: absolute; right: 0.75rem;"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div class="dropdown-menu" style="position: absolute; top: calc(100% + 4px); right: 0; min-width: 100%; background: #fff; border: 1px solid var(--gray-200); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); opacity: 0; visibility: hidden; transform: translateY(-5px); transition: all 0.2s; z-index: 100; padding: 0.25rem;">
        <div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'area', 'all', 'Semua Area')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.filterArea[id] === 'all' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.filterArea[id] === 'all' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Semua Area</div>
        <div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'area', 'selatan', 'Pantai Selatan')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.filterArea[id] === 'selatan' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.filterArea[id] === 'selatan' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Pantai Selatan</div>
        <div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'area', 'utara', 'Utara (Pegunungan)')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.filterArea[id] === 'utara' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.filterArea[id] === 'utara' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Utara (Pegunungan)</div>
      </div>
    </div>
  ` : '';

  const sortHTML = `
    <div class="custom-dropdown" id="dropdown-sort-${id}" style="position: relative; min-width: 160px; user-select: none;">
      <div class="dropdown-trigger" onclick="event.stopPropagation(); togglePkgDropdown('dropdown-sort-${id}')" style="padding: 0.5rem 2rem 0.5rem 1rem; border: 1px solid var(--gray-200); border-radius: 8px; background: var(--white); cursor: pointer; font-size: 0.875rem; color: var(--gray-700); transition: all 0.2s; display: flex; align-items: center; justify-content: space-between;">
        <span class="dropdown-value">${pkgState.sortByLabel[id]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon" style="transition: transform 0.2s; position: absolute; right: 0.75rem;"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div class="dropdown-menu" style="position: absolute; top: calc(100% + 4px); right: 0; min-width: 100%; background: #fff; border: 1px solid var(--gray-200); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); opacity: 0; visibility: hidden; transform: translateY(-5px); transition: all 0.2s; z-index: 100; padding: 0.25rem;">
        <div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'sort', 'default', 'Urutkan (Default)')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.sortBy[id] === 'default' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.sortBy[id] === 'default' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Urutkan (Default)</div>
        <div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'sort', 'price_asc', 'Harga Termurah')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.sortBy[id] === 'price_asc' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.sortBy[id] === 'price_asc' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Harga Termurah</div>
        <div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'sort', 'price_desc', 'Harga Termahal')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.sortBy[id] === 'price_desc' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.sortBy[id] === 'price_desc' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Harga Termahal</div>
        ${id !== 'transport' ? `<div class="dropdown-item" onclick="selectPkgDropdown('${id}', 'sort', 'rating_desc', 'Rating Tertinggi')" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 6px; font-size: 0.875rem; color: ${pkgState.sortBy[id] === 'rating_desc' ? 'var(--green)' : 'var(--gray-800)'}; background: ${pkgState.sortBy[id] === 'rating_desc' ? 'var(--green-50, rgba(16,185,129,0.1))' : 'transparent'};">Rating Tertinggi</div>` : ''}
      </div>
    </div>
  `;

  const pkg_state_check = State.package;
  const isStep1Done = pkg_state_check.penginapan && pkg_state_check.penginapan.length > 0;
  const isStep2Done = pkg_state_check.workspaces && pkg_state_check.workspaces.length > 0;
  const isStep3Done = !!pkg_state_check.transport;
  const isStep4Done = pkg_state_check.activities && pkg_state_check.activities.length > 0;
  
  let currentActiveStep = 1;
  if (isStep1Done) currentActiveStep = 2;
  if (isStep1Done && isStep2Done) currentActiveStep = 3;
  if (isStep1Done && isStep2Done && isStep3Done) currentActiveStep = 4;
  if (isStep1Done && isStep2Done && isStep3Done && isStep4Done) currentActiveStep = 5;

  const isActive = step === currentActiveStep;
  const activeStyle = isActive 
    ? 'border:1px solid var(--green); box-shadow:0 0 0 4px rgba(15,118,110,0.1); animation:section-pulse 2s infinite;' 
    : 'border:1px solid var(--gray-200); box-shadow:var(--shadow-sm);';

  wrap.innerHTML = `
    <div style="background:#FAF9F6;border-radius:16px;padding:1.5rem;margin-bottom:2rem;transition:all 0.3s ease;${activeStyle}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="color:var(--green-dark);">${iconSvg}</div>
          <div>
            <h3 style="font-weight:700;font-size:1.25rem;color:var(--gray-900);margin:0;">${step}. ${title}</h3>
            <div style="font-size:0.875rem;color:var(--gray-500);margin-top:4px;">${subtitle}</div>
          </div>
        </div>
        <div style="display:flex;gap:0.75rem;">
          ${filterAreaHTML}
          ${sortHTML}
        </div>
      </div>
      <div id="pkg-${id}">
        ${content}
      </div>
    </div>
  `;
  return wrap;
}

function renderPkgPenginapan() {
  const pkg = State.package;
  const items = applyFilterAndSort(API_DATA?.penginapan || [], 'penginapan');
  const displayedItems = items.slice(0, pkgState.limits.penginapan);
  
  const content = `
    <div class="pkg-grid">
      ${displayedItems.map(item => {
        const sel = pkg.penginapan && pkg.penginapan.find(p => p.id == item.id);
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="selectPenginapan('${item.id}')">
            <div class="pkg-card-img">
              <img src="${item.img}" onerror="this.src='https://picsum.photos/seed/${item.id}s/400/300'" />
              <div class="pkg-badge">${item.type || 'Akomodasi'}</div>
              <button class="btn-detail" onclick="event.stopPropagation();navigate('location-detail', {id: ${item.id}})" style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);z-index:2;color:var(--gray-700)" title="Lihat Detail">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </button>
              <button class="btn-fav ${State.isFavorite(item.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(State.toggleFavorite('${item.id}')){this.classList.add('active')}else{this.classList.remove('active')}">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            <div class="pkg-card-body">
              <div class="pkg-card-title">${item.name}</div>
              <div class="pkg-card-loc">Gunung Kidul</div>
              <div class="pkg-card-price">${formatRupiah(item.price)} <span>/ malam</span></div>
              <button class="btn ${sel?'btn-secondary':'btn-card'} btn-full" style="padding:0.6rem;font-size:0.875rem;margin-top:auto;">${sel?'✓ Dipilih':'Pilih'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="text-align:center; margin-top: 1.5rem;">
      ${pkgState.limits.penginapan < items.length 
        ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="loadMorePkg('penginapan')">Lihat lebih banyak penginapan ▾</button>`
        : (items.length > 4 ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="collapsePkg('penginapan')">Tutup ▴</button>` : '')}
    </div>
  `;
  const iconBed = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 11v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 11h18M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4M8 7h8"></path></svg>`;
  return pkgSection('1', 'Pilih Penginapan', 'Pilih akomodasi yang sesuai kebutuhanmu', 'penginapan', content, iconBed);
}

function renderPkgWorkspace() {
  const pkg = State.package;
  let items = applyFilterAndSort(API_DATA?.workspace || [], 'workspace');
  const displayedItems = items.slice(0, pkgState.limits.workspace);
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  
  const content = `
    <div class="pkg-grid">
      ${displayedItems.map(item => {
        const sel = pkg.workspaces.find(w=>w.id==item.id);
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="toggleWorkspace('${item.id}')">
            <div class="pkg-card-img">
              <img src="${item.img}" onerror="this.src='https://picsum.photos/seed/${item.id}w/400/300'" />
              <div class="pkg-badge">Cafe & Coworking</div>
              <button class="btn-detail" onclick="event.stopPropagation();navigate('location-detail', {id: ${item.id}})" style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);z-index:2;color:var(--gray-700)" title="Lihat Detail">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </button>
              <button class="btn-fav ${State.isFavorite(item.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(State.toggleFavorite('${item.id}')){this.classList.add('active')}else{this.classList.remove('active')}">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            <div class="pkg-card-body">
              <div class="pkg-card-title">${item.name}</div>
              <div class="pkg-card-loc">WiFi: ${item.wifi} Mbps</div>
              <div class="pkg-card-price">${formatRupiah(item.price)} <span>/ hari</span></div>
              
              <div style="margin-top:0.5rem;margin-bottom:1rem;border-top:1px solid var(--gray-100);padding-top:0.5rem;">
                <div style="font-size:0.7rem;font-weight:700;color:var(--gray-500);margin-bottom:4px;display:flex;align-items:center;gap:4px"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> JAM BUKA:</div>
                <div style="font-size:0.8rem;color:var(--gray-700);font-weight:600">${item.openingHours || 'Setiap Hari, 08:00 - 22:00'}</div>
              </div>
              <button class="btn ${sel?'btn-secondary':'btn-card'} btn-full" style="padding:0.6rem;font-size:0.875rem;margin-top:auto;" onclick="event.stopPropagation();toggleWorkspace('${item.id}')">${sel?'✓ Dipilih':'Pilih'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="text-align:center; margin-top: 1.5rem;">
      ${pkgState.limits.workspace < items.length 
        ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="loadMorePkg('workspace')">Lihat lebih banyak workspace ▾</button>`
        : (items.length > 4 ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="collapsePkg('workspace')">Tutup ▴</button>` : '')}
    </div>
  `;
  const icon = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
  return pkgSection('2', 'Pilih Workspace / Cafe', 'Pilih tempat kerja yang nyaman', 'workspace', content, icon);
}

function renderPkgTransport() {
  const pkg = State.package;
  const items = applyFilterAndSort(TRANSPORT_OPTIONS, 'transport');
  const displayedItems = items.slice(0, pkgState.limits.transport);
  
  const content = `
    <div class="pkg-grid">
      ${displayedItems.map(t => {
        const sel = pkg.transport?.id === t.id;
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="selectTransport('${t.id}')">
            <div class="pkg-card-img">
               <img src="${t.img}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://picsum.photos/seed/${t.id}/400/300'" />
               <div class="pkg-badge">${t.name}</div>
               <button class="btn-detail" onclick="event.stopPropagation();showTransportDetailModal('${t.id}')" style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);z-index:2;color:var(--gray-700)" title="Lihat Detail">
                 <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
               </button>
               <button class="btn-fav ${State.isFavorite(t.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(State.toggleFavorite('${t.id}')){this.classList.add('active')}else{this.classList.remove('active')}">
                 <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
               </button>
            </div>
            <div class="pkg-card-body">
              <div class="pkg-card-title">${t.name}</div>
              <div class="pkg-card-price" style="margin-bottom:0.5rem;">${t.price>0?formatRupiah(t.price)+' <span>/ hari</span>':'Bayar per trip'}</div>
              <button class="btn ${sel?'btn-secondary':'btn-card'} btn-full" style="padding:0.6rem;font-size:0.875rem;margin-top:auto;">${sel?'✓ Dipilih':'Pilih'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="text-align:center; margin-top: 1.5rem;">
      ${pkgState.limits.transport < items.length 
        ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="loadMorePkg('transport')">Lihat lebih banyak transportasi ▾</button>`
        : (items.length > 4 ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="collapsePkg('transport')">Tutup ▴</button>` : '')}
    </div>
  `;
  const icon = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM8 12h8"></path></svg>`;
  return pkgSection('3', 'Pilih Transportasi', 'Pilih transportasi selama di Gunung Kidul', 'transport', content, icon);
}

function renderPkgActivities() {
  const pkg = State.package;
  const currentFilter = pkgState.activityFilter || 'Semua';
  let items = [];
  if (currentFilter === 'Wisata') items = [...(API_DATA?.wisata || [])];
  else if (currentFilter === 'Kuliner') items = [...(API_DATA?.kuliner || [])];
  else if (currentFilter === 'Budaya') items = [...(API_DATA?.budaya || [])];
  else items = [...(API_DATA?.wisata || []), ...(API_DATA?.kuliner || []), ...(API_DATA?.budaya || [])];
  
  items = applyFilterAndSort(items, 'activities');
  const displayedItems = items.slice(0, pkgState.limits.activities);
  
  const content = `
    <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; overflow-x:auto; padding-bottom:0.5rem;">
      ${['Semua', 'Wisata', 'Kuliner', 'Budaya'].map(f => `
        <button class="btn ${currentFilter === f ? 'btn-primary' : 'btn-outline'}" style="border-radius:100px; padding:0.4rem 1rem; font-size:0.875rem; white-space:nowrap; box-shadow:none;" onclick="setActivityFilter('${f}')">${f}</button>
      `).join('')}
    </div>
    <div class="pkg-grid">
      ${displayedItems.map(item => {
        const sel = pkg.activities.find(a=>a.id===item.id);
        const badge = getCategoryBadge(item.category);
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="toggleActivity('${item.id}','${item.category}')">
            <div class="pkg-card-img">
              <img src="${item.img}" onerror="this.src='https://picsum.photos/seed/${item.id}a/400/300'" />
              <div class="pkg-badge">${badge.label}</div>
              <button class="btn-detail" onclick="event.stopPropagation();navigate('location-detail', {id: ${item.id}})" style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);z-index:2;color:var(--gray-700)" title="Lihat Detail">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </button>
              <button class="btn-fav ${State.isFavorite(item.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(State.toggleFavorite('${item.id}')){this.classList.add('active')}else{this.classList.remove('active')}">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            <div class="pkg-card-body">
              <div class="pkg-card-title">${item.name}</div>
              <div class="pkg-card-loc">Gunung Kidul</div>
              <div class="pkg-card-price">${item.price===0?'Gratis':formatRupiah(item.price)}</div>
              <button class="btn ${sel?'btn-secondary':'btn-card'} btn-full" style="padding:0.6rem;font-size:0.875rem;margin-top:auto;" onclick="event.stopPropagation();toggleActivity('${item.id}','${item.category}')">${sel?'✓ Dipilih':'Pilih'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="text-align:center; margin-top: 1.5rem;">
      ${pkgState.limits.activities < items.length 
        ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="loadMorePkg('activities')">Lihat lebih banyak aktivitas ▾</button>`
        : (items.length > 4 ? `<button class="btn btn-outline" style="border-radius:100px; font-size:0.875rem; padding:0.5rem 1.5rem" onclick="collapsePkg('activities')">Tutup ▴</button>` : '')}
    </div>
  `;
  const icon = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
  return pkgSection('4', 'Pilih Aktivitas', 'Tambahkan aktivitas pendukung ke paket Anda', 'activities', content, icon);
}

function generateItineraryHTML(pkg) {
  if ((!pkg.penginapan || pkg.penginapan.length === 0) && pkg.workspaces.length === 0 && pkg.activities.length === 0) {
    return `<div style="text-align:center; padding: 2rem 1rem; color: var(--gray-400); font-size: 0.875rem; border: 1px dashed var(--gray-200); border-radius: 8px;">Belum ada agenda, silakan pilih penginapan atau aktivitas terlebih dahulu.</div>`;
  }

  const daysCount = pkg.nights || 4;
  const days = Array.from({length: daysCount}, (_,i) => i+1);
  const unassignedActivities = [...pkg.activities];
  
  let html = '';
  days.forEach(d => {
    const dayIdx = d - 1; 
    let agendas = [];
    
    // 1. Penginapan (Basecamp)
    if (pkg.penginapanSchedule && pkg.penginapanSchedule.length > 0) {
      const hotelId = pkg.penginapanSchedule[dayIdx];
      const hotel = pkg.penginapan.find(h => h.id === hotelId);
      
      if (hotel) {
        agendas.push(`<div style="display:flex;align-items:start;gap:6px;"><svg width="14" height="14" fill="none" stroke="var(--green)" stroke-width="2" viewBox="0 0 24 24" style="margin-top:1px;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span style="color:var(--gray-600);line-height:1.2;">Menginap di ${hotel.name}</span></div>`);
      }
    }
    
    // 2. Workspace
    // 2. Workspace
    let hasWorkspace = false;
    if (pkg.workspacesSchedule && pkg.workspacesSchedule.length > 0) {
      const wsId = pkg.workspacesSchedule[dayIdx];
      if (wsId !== 'libur') {
        const ws = pkg.workspaces.find(w => w.id === wsId);
        if (ws) {
          hasWorkspace = true;
          agendas.push(`<div style="display:flex;align-items:start;gap:6px;"><svg width="14" height="14" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24" style="margin-top:1px;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg><span style="color:var(--gray-800);font-weight:700;line-height:1.2;">Kerja di ${ws.name}</span></div>`);
        }
      }
    }
    
    // 2.5 Meeting
    if (pkg.meetingDay === String(dayIdx)) {
      const timeStr = pkg.meetingTime || "10:00";
      const paxStr = pkg.meetingPax ? `(${pkg.meetingPax} Orang)` : "";
      agendas.push(`<div style="display:flex;align-items:start;gap:6px;margin-top:4px"><svg width="14" height="14" fill="none" stroke="#8b5cf6" stroke-width="2" viewBox="0 0 24 24" style="margin-top:1px;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg><span style="color:#8b5cf6;font-size:0.875rem;font-weight:800;text-transform:uppercase;">${timeStr} - Meeting & Sinkronisasi ${paxStr}</span></div>`);
    }
    
    // 3. Aktivitas (Distribusi)
    if (unassignedActivities.length > 0 && (!hasWorkspace || unassignedActivities.length >= daysCount)) {
      const act = unassignedActivities.shift();
      agendas.push(`<div style="display:flex;align-items:start;gap:6px;"><svg width="14" height="14" fill="none" stroke="#f97316" stroke-width="2" viewBox="0 0 24 24" style="margin-top:1px;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span style="color:var(--gray-800);line-height:1.2;">${act.name}</span></div>`);
    }

    // 4. Check-out on the last day
    if (d === daysCount && pkg.penginapanSchedule && pkg.penginapanSchedule.length > 0) {
      const lastHotelId = pkg.penginapanSchedule[dayIdx];
      const lastHotel = pkg.penginapan.find(h => h.id === lastHotelId);
      if (lastHotel) {
        agendas.push(`<div style="display:flex;align-items:start;gap:6px;margin-top:4px"><svg width="14" height="14" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24" style="margin-top:1px;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span style="color:#ef4444;font-size:0.75rem;font-weight:700">Check-out & Selesai</span></div>`);
      }
    }
    
    html += `
      <div style="display:flex; gap:0.75rem; padding:0.75rem; background:var(--gray-50); border:1px solid var(--gray-200); border-radius:8px; margin-bottom:0.5rem; box-shadow:0 1px 2px rgba(0,0,0,0.02)">
        <div style="width:30px;height:30px;border-radius:6px;background:var(--green-50, rgba(16,185,129,0.1));color:var(--green-dark);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800;flex-shrink:0">H${d}</div>
        <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.8rem; flex:1">
          ${agendas.length > 0 ? agendas.join('') : '<span style="color:var(--gray-400);font-style:italic;">Waktu bebas / Santai</span>'}
        </div>
      </div>
    `;
  });
  
  if (unassignedActivities.length > 0) {
    html += `<div style="font-size:0.75rem; color:var(--gray-500); text-align:center; margin-top:0.5rem;">+ ${unassignedActivities.length} aktivitas lain (waktu fleksibel)</div>`;
  }
  
  return html;
}

function renderPackageSummary() {
  const pkg = State.package;
  const total = State.calcTotal();
  const progress = State.getProgress();

  let progressColor = 'var(--green)';
  if (progress < 50) progressColor = '#ef4444'; // red
  else if (progress < 100) progressColor = '#f59e0b'; // amber

  let missingItems = [];
  if (!pkg.penginapan || pkg.penginapan.length === 0) missingItems.push('Penginapan');
  if (!pkg.workspaces || pkg.workspaces.length === 0) missingItems.push('Workspace');
  if (!pkg.transport) missingItems.push('Transportasi');
  if (!pkg.activities || pkg.activities.length === 0) missingItems.push('Aktivitas');
  
  let missingAlertHtml = '';
  if (missingItems.length > 0) {
    missingAlertHtml = `<div style="font-size:0.75rem; color:${progressColor}; margin-top:8px; font-weight:600; display:flex; align-items:flex-start; gap:4px;"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> Belum memilih: ${missingItems.join(', ')}</div>`;
  }

  const summaryEl = el('div', 'package-summary');
  summaryEl.innerHTML = `
    <div class="package-summary-header">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Nama Paket</div>
      <input type="text" value="${pkg.name}" onchange="State.package.name=this.value"
        style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:10px 12px;color:var(--gray-800);font-weight:700;font-size:1rem;width:100%;outline:none;transition:border-color 0.2s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--gray-200)'" />
      <div style="margin-top:1.5rem">
        <div style="font-size:0.75rem;font-weight:700;color:${progressColor};margin-bottom:8px;display:flex;justify-content:space-between">
          <span>Kelengkapan Paket</span>
          <span>${Math.round(progress)}%</span>
        </div>
        <div class="progress-bar" style="background:var(--gray-200);height:6px;border-radius:4px;overflow:hidden;"><div class="progress-fill" style="width:${progress}%;background:${progressColor};height:100%;border-radius:4px;transition:all 0.3s"></div></div>
        ${missingAlertHtml}
      </div>
    </div>


    <div style="padding:0 1.25rem 1rem">
      ${pkg.penginapanSchedule && pkg.penginapanSchedule.length > 0 ? `
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.75rem">Pengaturan Penginapan</div>
      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.5rem">
        ${pkg.penginapanSchedule.map((hotelId, idx) => {
          const hotelName = pkg.penginapan.find(h => h.id === hotelId)?.name || '';
          const isOpen = window._openDropdownIdx === idx;
          return `
          <div style="display:flex;justify-content:space-between;align-items:center;background:#fff;padding:0.6rem 0.8rem;border-radius:12px;border:1px solid var(--gray-200);box-shadow:0 1px 3px rgba(0,0,0,0.02);position:relative;">
            <span style="font-weight:700;color:var(--gray-500);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em">Malam ${idx+1}</span>
            <div style="position:relative; max-width:65%;">
              <div onclick="toggleCustomDropdown(${idx}, event)" style="border:1px solid ${isOpen?'var(--green)':'#e2e8f0'}; border-radius:100px; padding:0.4rem 2.2rem 0.4rem 1.2rem; font-size:0.85rem; font-weight:700; color:var(--green-dark); background-color:#f8fafc; cursor:pointer; width:100%; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:all 0.2s;">
                ${hotelName}
              </div>
              <svg style="position:absolute; right:12px; top:50%; transform:translateY(-50%) ${isOpen?'rotate(180deg)':'rotate(0)'}; pointer-events:none; color:var(--green-dark); transition:transform 0.2s" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
              
              ${isOpen ? `
              <div style="position:absolute; top:calc(100% + 4px); right:0; width:max-content; min-width:100%; background:#fff; border:1px solid var(--gray-200); border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:50; overflow:hidden;">
                ${pkg.penginapan.map(h => `
                  <div onclick="selectCustomDropdownItem(${idx}, '${h.id}', event)" style="padding:0.6rem 1rem; font-size:0.85rem; font-weight:${h.id===hotelId?'700':'600'}; color:${h.id===hotelId?'var(--green-dark)':'var(--gray-700)'}; background:${h.id===hotelId?'#f0fdf4':'#fff'}; cursor:pointer; border-bottom:1px solid var(--gray-50); transition:background 0.2s" onmouseover="if('${h.id}'!=='${hotelId}')this.style.background='#f8fafc'" onmouseout="if('${h.id}'!=='${hotelId}')this.style.background='#fff'">
                    ${h.name}
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
          </div>
        `}).join('')}
      </div>
      ` : ''}

      ${pkg.workspacesSchedule && pkg.workspacesSchedule.length > 0 ? `
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.75rem">Pengaturan Workspace</div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:1.5rem;">
        ${pkg.workspacesSchedule.map((wsId, idx) => {
          let wsName = wsId === 'libur' ? 'Libur' : (pkg.workspaces.find(w => w.id === wsId)?.name || '');
          const isOpen = window._openWsDropdownIdx === idx;
          return `
          <div style="min-width:140px; background:#fff; border:1px solid var(--gray-200); border-radius:12px; padding:0.75rem; display:flex; flex-direction:column; gap:0.5rem; box-shadow:0 1px 3px rgba(0,0,0,0.02)">
             <span style="font-size:0.7rem; font-weight:700; color:var(--gray-500); text-transform:uppercase">Hari ${idx+1}</span>
             <div style="position:relative;">
               <div onclick="toggleWsDropdown(${idx}, event)" style="border:1px solid ${isOpen?'var(--green)':'#e2e8f0'}; border-radius:6px; padding:0.4rem 1.6rem 0.4rem 0.6rem; font-size:0.8rem; font-weight:700; color:${wsId==='libur'?'var(--gray-500)':'var(--green-dark)'}; background-color:#f8fafc; cursor:pointer; width:100%; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:all 0.2s;">
                 ${wsName}
               </div>
               <svg style="position:absolute; right:6px; top:50%; transform:translateY(-50%) ${isOpen?'rotate(180deg)':'rotate(0)'}; pointer-events:none; color:var(--green-dark); transition:transform 0.2s" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
               
               ${isOpen ? `
               <div style="position:absolute; top:calc(100% + 4px); left:0; width:max-content; min-width:100%; background:#fff; border:1px solid var(--gray-200); border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:50; overflow:hidden;">
                 ${pkg.workspaces.map(w => `
                   <div onclick="selectWsDropdownItem(${idx}, '${w.id}', event)" style="padding:0.6rem 0.8rem; font-size:0.8rem; font-weight:${w.id===wsId?'700':'600'}; color:${w.id===wsId?'var(--green-dark)':'var(--gray-700)'}; background:${w.id===wsId?'#f0fdf4':'#fff'}; cursor:pointer; border-bottom:1px solid var(--gray-50); transition:background 0.2s" onmouseover="if('${w.id}'!=='${wsId}')this.style.background='#f8fafc'" onmouseout="if('${w.id}'!=='${wsId}')this.style.background='#fff'">
                     ${w.name}
                   </div>
                 `).join('')}
                 <div onclick="selectWsDropdownItem(${idx}, 'libur', event)" style="padding:0.6rem 0.8rem; font-size:0.8rem; font-weight:${'libur'===wsId?'700':'600'}; color:${'libur'===wsId?'#ef4444':'var(--gray-500)'}; background:${'libur'===wsId?'#fef2f2':'#fff'}; cursor:pointer; transition:background 0.2s; border-top:1px solid var(--gray-50)" onmouseover="if('libur'!=='${wsId}')this.style.background='#f8fafc'" onmouseout="if('libur'!=='${wsId}')this.style.background='#fff'">
                   Libur
                 </div>
               </div>
               ` : ''}
             </div>
          </div>
        `}).join('')}
      </div>
      ` : ''}
      
      ${(() => {
        const availableMeetingDays = Array.from({length: pkg.nights || 4}).map((_, i) => i).filter(i => {
          return pkg.workspacesSchedule && pkg.workspacesSchedule[i] && pkg.workspacesSchedule[i] !== 'libur';
        });
        const isOpen = window._openMeetingDropdown;
        const currentMeetingDayStr = pkg.meetingDay !== null ? `Meeting di Hari ke-${parseInt(pkg.meetingDay) + 1}` : 'Tidak ada meeting';

        let html = `<div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.75rem">Jadwal Meeting Khusus</div>
        <div style="margin-bottom:1.5rem; position:relative;">
          <div onclick="toggleMeetingDropdown(event)" style="border:1px solid ${isOpen?'var(--green)':'var(--gray-200)'}; border-radius:12px; padding:0.75rem 1rem; font-size:0.875rem; font-weight:700; color:${pkg.meetingDay===null?'var(--gray-600)':'var(--green-dark)'}; background-color:#fff; cursor:pointer; width:100%; text-align:left; box-shadow:0 1px 3px rgba(0,0,0,0.02); transition:all 0.2s; position:relative;">
            ${currentMeetingDayStr}
            <svg style="position:absolute; right:14px; top:50%; transform:translateY(-50%) ${isOpen?'rotate(180deg)':'rotate(0)'}; pointer-events:none; color:var(--green-dark); transition:transform 0.2s" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          
          ${isOpen ? `
          <div style="position:absolute; top:calc(100% + 6px); left:0; width:100%; background:#fff; border:1px solid var(--gray-200); border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); z-index:50; overflow:hidden;">
            <div onclick="selectMeetingDay('', event)" style="padding:0.75rem 1rem; font-size:0.875rem; font-weight:${pkg.meetingDay===null?'700':'600'}; color:${pkg.meetingDay===null?'var(--green-dark)':'var(--gray-700)'}; background:${pkg.meetingDay===null?'#f0fdf4':'#fff'}; cursor:pointer; border-bottom:1px solid var(--gray-50); transition:background 0.2s" onmouseover="if('${pkg.meetingDay}'!=='null')this.style.background='#f8fafc'" onmouseout="if('${pkg.meetingDay}'!=='null')this.style.background='#fff'">
              Tidak ada meeting
            </div>
            ${availableMeetingDays.map(d => `
              <div onclick="selectMeetingDay('${d}', event)" style="padding:0.75rem 1rem; font-size:0.875rem; font-weight:${pkg.meetingDay===String(d)?'700':'600'}; color:${pkg.meetingDay===String(d)?'var(--green-dark)':'var(--gray-700)'}; background:${pkg.meetingDay===String(d)?'#f0fdf4':'#fff'}; cursor:pointer; border-bottom:1px solid var(--gray-50); transition:background 0.2s" onmouseover="if('${pkg.meetingDay}'!=='${d}')this.style.background='#f8fafc'" onmouseout="if('${pkg.meetingDay}'!=='${d}')this.style.background='#fff'">
                Meeting di Hari ke-${d+1}
              </div>
            `).join('')}
            ${availableMeetingDays.length === 0 ? `<div style="padding:0.75rem 1rem; font-size:0.8rem; color:var(--gray-400); font-style:italic">Tidak ada hari kerja tersedia (Semua hari libur)</div>` : ''}
          </div>
          ` : ''}
        </div>`;
        
        if (pkg.meetingDay !== null) {
          html += `<div style="display:flex; gap:0.75rem; margin-bottom:1.5rem; margin-top:-0.5rem; padding-top:0.75rem; border-top:1px dashed var(--gray-200)">
            <div style="flex:1">
              <label style="display:block; font-size:0.7rem; font-weight:700; color:var(--gray-500); text-transform:uppercase; margin-bottom:0.4rem">Jam Meeting</label>
              <input type="time" value="${pkg.meetingTime || '10:00'}" onchange="updateMeetingTime(this.value)" style="width:100%; border:1px solid var(--gray-200); border-radius:8px; padding:0.6rem; font-size:0.85rem; font-weight:600; color:var(--gray-700); background:#f8fafc; outline:none">
            </div>
            <div style="flex:1">
              <label style="display:block; font-size:0.7rem; font-weight:700; color:var(--gray-500); text-transform:uppercase; margin-bottom:0.4rem">Jumlah Orang</label>
              <input type="number" min="1" max="20" value="${pkg.meetingPax || 2}" onchange="updateMeetingPax(this.value)" style="width:100%; border:1px solid var(--gray-200); border-radius:8px; padding:0.6rem; font-size:0.85rem; font-weight:600; color:var(--gray-700); background:#f8fafc; outline:none">
            </div>
          </div>`;
        }
        return html;
      })()}

      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.75rem">Preview Itinerary</div>
      <div style="display:flex;flex-direction:column;">
        ${generateItineraryHTML(pkg)}
      </div>
    </div>

    <div class="package-breakdown" style="margin-bottom: 1.5rem;">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem;text-transform:uppercase">Rincian Biaya</div>
      ${pkg.penginapan && pkg.penginapan.length > 0 ? `<div class="breakdown-row"><span>Penginapan (${pkg.penginapan.length} tempat)<br/><span style="font-size:0.75rem;color:var(--gray-400)">Sesuai alokasi ${pkg.nights} malam</span></span><span style="font-weight:700">${formatRupiah(pkg.penginapanSchedule.reduce((sum, hId) => sum + (pkg.penginapan.find(h=>h.id===hId)?.price||0), 0))}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih penginapan</span><span>-</span></div>`}
      ${pkg.workspaces.length > 0 ? `<div class="breakdown-row"><span>Workspace (${pkg.workspaces.length} tempat)<br/><span style="font-size:0.75rem;color:var(--gray-400)">Sistem Distribusi Otomatis (${pkg.nights} hari kerja)</span></span><span style="font-weight:700">${formatRupiah(pkg.workspaces.reduce((s,w)=>s+w.price,0) * pkg.nights / pkg.workspaces.length)}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih workspace</span><span>-</span></div>`}
      ${pkg.transport ? `<div class="breakdown-row"><span>${pkg.transport.name}<br/><span style="font-size:0.75rem;color:var(--gray-400)">${pkg.nights} hari × ${formatRupiah(pkg.transport.price||0)}</span></span><span style="font-weight:700">${formatRupiah((pkg.transport.price||0)*pkg.nights)}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih transport</span><span>-</span></div>`}
      ${pkg.activities.length > 0 ? `<div class="breakdown-row"><span>Aktivitas (${pkg.activities.length} item)</span><span style="font-weight:700">${formatRupiah(pkg.activities.reduce((s,a)=>s+a.price,0))}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih aktivitas</span><span>-</span></div>`}
      <div class="breakdown-row breakdown-total"><span>TOTAL ESTIMASI</span><span style="color:var(--green)">${formatRupiah(total)}</span></div>
    </div>

    <div style="padding:0 1.25rem 1.25rem;display:flex;flex-direction:column;gap:0.75rem">
      <div style="display:flex;gap:0.625rem;">
        <button class="btn btn-primary" style="flex:1;text-align:center;" onclick="savePackage()">Simpan Paket</button>
        <button class="btn btn-outline" style="flex:0 0 auto;padding:0.75rem 1rem;font-size:0.875rem;" onclick="showSavedPackages()">Lihat Tersimpan</button>
      </div>
      
      <div style="display:flex;gap:0.625rem">
        <button class="btn btn-outline" style="flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.75rem 1.25rem;" onclick="sharePackage()">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368l5.662 3.397m-5.662-8.765l5.662-3.397m0 0a3 3 0 115.663-3.397 3 3 0 01-5.663 3.397zm0 12.13a3 3 0 115.663-3.397 3 3 0 01-5.663 3.397z"></path></svg>
          Bagikan
        </button>
        <button class="btn btn-primary" style="flex:1;background:var(--green);color:white;border:none;border-radius:12px;padding:0.75rem;font-weight:700;font-size:1rem;cursor:pointer;text-align:center;box-shadow:0 4px 12px rgba(16,185,129,0.3);transition:transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="proceedToBooking()">Booking</button>
      </div>
      <button class="btn btn-outline btn-full" style="border:1px solid #ef4444;color:#ef4444;margin-top:0.25rem;background:#fff;transition:background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff'" onclick="clearPackageConfirm()">Bersihkan Paket</button>
    </div>
  `;
  return summaryEl;
}

window.showSavedPackages = () => {
  if (!State.user) {
    showToast('Silakan login terlebih dahulu untuk melihat paket tersimpan.');
    showAuthModal('login');
    return;
  }
  
  const saved = State.savedPackages || [];
  
  const content = document.createElement('div');
  content.style.padding = '1.5rem';
  content.style.maxHeight = '80vh';
  content.style.overflowY = 'auto';
  
  if (saved.length === 0) {
    content.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem;">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--gray-100);color:var(--gray-400);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <h3 style="font-size:1.25rem;font-weight:700;color:var(--gray-900);margin-bottom:0.5rem;">Belum Ada Paket</h3>
        <p style="color:var(--gray-500);font-size:0.9rem;line-height:1.5;">Anda belum pernah menyimpan paket. Rakit paket impian Anda dan simpan ke sini!</p>
        <button class="btn btn-outline" style="margin-top:1.5rem;" onclick="closeModal()">Kembali</button>
      </div>
    `;
  } else {
    const calcSavedTotal = (p) => {
      let total = 0;
      if (p.penginapanSchedule && p.penginapanSchedule.length > 0) {
        p.penginapanSchedule.forEach(hotelId => {
          const hotel = p.penginapan?.find(h => h.id === hotelId);
          if (hotel) total += hotel.price;
        });
      }
      if (p.workspacesSchedule && p.workspacesSchedule.length > 0) {
        p.workspacesSchedule.forEach(wsId => {
          if (wsId !== 'libur') {
            const ws = p.workspaces?.find(w => w.id === wsId);
            if (ws) total += ws.price;
          }
        });
      }
      if (p.transport) total += (p.transport.price || 0) * (p.nights || 4);
      if (p.activities) p.activities.forEach(a => total += a.price);
      return total;
    };

    let listHtml = saved.map((p, idx) => {
      const coverImg = p.penginapan?.[0]?.img || p.workspaces?.[0]?.img || p.activities?.[0]?.img || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400';
      const total = calcSavedTotal(p);
      return `
      <div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:12px;padding:1rem;margin-bottom:1rem;display:flex;gap:1.25rem;align-items:center;">
        <img src="${coverImg}" alt="Cover" style="width:100px;height:100px;object-fit:cover;border-radius:8px;flex-shrink:0;">
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
            <div>
              <div style="font-weight:700;color:var(--gray-900);font-size:1.1rem;">${p.name || 'Paket Tanpa Nama'}</div>
              <div style="font-size:0.75rem;color:var(--gray-500);margin-top:0.25rem;">Disimpan: ${p.saved || 'Baru Saja'}</div>
            </div>
            <div style="background:var(--green);color:white;padding:0.25rem 0.5rem;border-radius:6px;font-size:0.75rem;font-weight:700;">
              ${p.nights} Malam
            </div>
          </div>
          <div style="font-size:0.875rem;color:var(--gray-600);margin-bottom:0.75rem;display:flex;gap:1.5rem;">
            <div style="display:flex;align-items:center;">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right:0.35rem"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              ${p.penginapan?.length || 0} Penginapan
            </div>
            <div style="display:flex;align-items:center;">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right:0.35rem"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              ${p.workspaces?.length || 0} Workspace
            </div>
            <div style="display:flex;align-items:center;">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right:0.35rem"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ${p.activities?.length || 0} Aktivitas
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-size:1.1rem;font-weight:800;color:var(--green)">
              ${formatRupiah(total)}
            </div>
            <div style="display:flex;gap:0.5rem;">
              <button class="btn btn-outline btn-sm" style="padding:0.5rem 1rem;" onclick="showSavedPackageDetail(${idx})">Detail</button>
              <button class="btn btn-outline btn-sm" style="color:#ef4444;border-color:#ef4444;padding:0.5rem 1rem;" onclick="deleteSavedPackage(${idx})">Hapus</button>
              <button class="btn btn-primary btn-sm" style="padding:0.5rem 1.5rem;" onclick="loadSavedPackage(${idx})">Muat Paket Ini</button>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');
    
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <div>
          <h3 style="font-size:1.5rem;font-weight:800;color:var(--gray-900);">Daftar Paket Tersimpan</h3>
          <p style="font-size:0.875rem;color:var(--gray-500);margin-top:0.25rem;">Pilih paket yang ingin Anda muat kembali.</p>
        </div>
        <button onclick="closeModal()" style="background:none;border:none;font-size:1.75rem;color:var(--gray-400);cursor:pointer;line-height:1;">&times;</button>
      </div>
      <div>${listHtml}</div>
    `;
  }
  
  const overlay = showModal(content);
  if (overlay && overlay.querySelector('.modal')) {
    overlay.querySelector('.modal').style.maxWidth = '700px';
  }
};

window.loadSavedPackage = (idx) => {
  const saved = State.savedPackages[idx];
  if (saved) {
    State.package = JSON.parse(JSON.stringify(saved));
    State.saveAppState();
    closeModal();
    showToast('Paket berhasil dimuat!');
    
    // Redirect to package builder if user is not already there
    if (State.currentPage !== 'package') {
      navigate('package');
    } else {
      renderApp();
    }
  }
};

window.deleteSavedPackage = async (idx) => {
  const pkg = State.savedPackages[idx];
  if (pkg && pkg._dbId) {
    try {
      await PackageService.deleteSavedPackage(pkg._dbId);
    } catch(e) {
      alert("Gagal menghapus paket di server: " + e.message);
    }
  }
  State.savedPackages.splice(idx, 1);
  State.notify('savedPackages');
  closeModal();
  showToast('Paket dihapus.');
  window.showSavedPackages();
};

window.showSavedPackageDetail = (idx) => {
  const p = State.savedPackages[idx];
  if (!p) return;
  
  closeModal();
  
  const calcSavedTotal = (pkg) => {
      let total = 0;
      if (pkg.penginapanSchedule && pkg.penginapanSchedule.length > 0) {
        pkg.penginapanSchedule.forEach(hotelId => {
          const hotel = pkg.penginapan?.find(h => h.id === hotelId);
          if (hotel) total += hotel.price;
        });
      }
      if (pkg.workspacesSchedule && pkg.workspacesSchedule.length > 0) {
        pkg.workspacesSchedule.forEach(wsId => {
          if (wsId !== 'libur') {
            const ws = pkg.workspaces?.find(w => w.id === wsId);
            if (ws) total += ws.price;
          }
        });
      }
      if (pkg.transport) total += (pkg.transport.price || 0) * (pkg.nights || 4);
      if (pkg.activities) pkg.activities.forEach(a => total += a.price);
      return total;
  };
    
  const total = calcSavedTotal(p);
  const coverImg = p.penginapan?.[0]?.img || p.workspaces?.[0]?.img || p.activities?.[0]?.img || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
    
  const content = document.createElement('div');
  content.style.padding = '0';
  content.style.maxHeight = '90vh';
  content.style.overflowY = 'auto';
  
  content.innerHTML = `
      <div style="position:relative;height:350px;">
        <img src="${coverImg}" style="width:100%;height:100%;object-fit:cover;" alt="Cover">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8));"></div>
        <button onclick="closeModal(); if (State.currentPage === 'package') { window.showSavedPackages(); }" style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);border:none;width:40px;height:40px;border-radius:50%;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.7)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div style="position:absolute;bottom:2rem;left:2.5rem;right:2.5rem;color:white;">
          <div style="background:var(--green);color:white;display:inline-block;padding:0.35rem 1rem;border-radius:20px;font-size:0.875rem;font-weight:700;margin-bottom:0.75rem;">${p.nights} Malam</div>
          <h2 style="font-size:2.5rem;font-weight:800;font-family:'Playfair Display', serif;margin-bottom:0.5rem;line-height:1.2;">${p.name || 'Paket Tanpa Nama'}</h2>
          <div style="font-size:1rem;opacity:0.9;">Disimpan pada ${p.saved || 'Baru Saja'}</div>
        </div>
      </div>
      <div style="padding:2.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:1.5rem;border-bottom:1px solid var(--gray-200);margin-bottom:2rem;">
          <div>
            <div style="font-size:1rem;color:var(--gray-500);font-weight:600;text-transform:uppercase;margin-bottom:0.5rem;">Total Estimasi Harga</div>
            <div style="font-size:2.5rem;font-weight:800;color:var(--green);line-height:1;">${formatRupiah(total)}</div>
          </div>
          <button class="btn btn-primary" style="padding:1rem 2.5rem;font-size:1.1rem;font-weight:700;border-radius:12px;box-shadow:0 4px 12px rgba(16,185,129,0.3);" onclick="loadSavedPackage(${idx})">Gunakan Paket Ini</button>
        </div>
        
        <h4 style="font-weight:800;font-size:1.25rem;color:var(--gray-900);margin-bottom:1.5rem;">Rincian Lokasi & Layanan</h4>
        <div style="display:grid;grid-template-columns:1fr;gap:1.5rem;">
          
          <div style="background:var(--gray-50);padding:1.5rem;border-radius:12px;border:1px solid var(--gray-200);">
            <div style="font-weight:800;font-size:1.1rem;color:var(--gray-800);margin-bottom:1rem;display:flex;align-items:center;gap:0.75rem;">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Penginapan
            </div>
            ${p.penginapan && p.penginapan.length > 0 ? p.penginapan.map(h => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px dashed var(--gray-200);">
                <div>
                  <div style="font-weight:700;color:var(--gray-700);font-size:1rem;">${h.name}</div>
                  <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.25rem;">${h.category || 'Hotel'} &bull; ${h.rating ? `★ ${h.rating}` : ''}</div>
                </div>
                <div style="font-weight:700;color:var(--gray-800);">${formatRupiah(h.price)} <span style="font-size:0.75rem;font-weight:400;color:var(--gray-500)">/mlm</span></div>
              </div>
            `).join('') : '<div style="font-size:0.95rem;color:var(--gray-500);font-style:italic;">Tidak ada penginapan di paket ini.</div>'}
          </div>
          
          <div style="background:var(--gray-50);padding:1.5rem;border-radius:12px;border:1px solid var(--gray-200);">
            <div style="font-weight:800;font-size:1.1rem;color:var(--gray-800);margin-bottom:1rem;display:flex;align-items:center;gap:0.75rem;">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Workspace
            </div>
            ${p.workspaces && p.workspaces.length > 0 ? p.workspaces.map(w => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px dashed var(--gray-200);">
                <div>
                  <div style="font-weight:700;color:var(--gray-700);font-size:1rem;">${w.name}</div>
                  <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.25rem;">${w.category || 'Workspace'} &bull; ${w.rating ? `★ ${w.rating}` : ''}</div>
                </div>
                <div style="font-weight:700;color:var(--gray-800);">${formatRupiah(w.price)} <span style="font-size:0.75rem;font-weight:400;color:var(--gray-500)">/hari</span></div>
              </div>
            `).join('') : '<div style="font-size:0.95rem;color:var(--gray-500);font-style:italic;">Tidak ada workspace di paket ini.</div>'}
          </div>
          
          <div style="background:var(--gray-50);padding:1.5rem;border-radius:12px;border:1px solid var(--gray-200);">
            <div style="font-weight:800;font-size:1.1rem;color:var(--gray-800);margin-bottom:1rem;display:flex;align-items:center;gap:0.75rem;">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Aktivitas & Transportasi
            </div>
            ${p.transport ? `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px dashed var(--gray-200);">
                <div>
                  <div style="font-weight:700;color:var(--gray-700);font-size:1rem;">${p.transport.name}</div>
                  <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.25rem;">Transportasi</div>
                </div>
                <div style="font-weight:700;color:var(--gray-800);">${formatRupiah(p.transport.price)} <span style="font-size:0.75rem;font-weight:400;color:var(--gray-500)">/hari</span></div>
              </div>
            ` : ''}
            ${p.activities && p.activities.length > 0 ? p.activities.map(a => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px dashed var(--gray-200);">
                <div>
                  <div style="font-weight:700;color:var(--gray-700);font-size:1rem;">${a.name}</div>
                  <div style="font-size:0.85rem;color:var(--gray-500);margin-top:0.25rem;">${a.category || 'Aktivitas'}</div>
                </div>
                <div style="font-weight:700;color:var(--gray-800);">${formatRupiah(a.price)}</div>
              </div>
            `).join('') : ''}
            ${!p.transport && (!p.activities || p.activities.length === 0) ? '<div style="font-size:0.95rem;color:var(--gray-500);font-style:italic;">Tidak ada aktivitas atau transportasi.</div>' : ''}
          </div>
          
        </div>
      </div>
    `;
    
    const overlay = showModal(content);
    if (overlay && overlay.querySelector('.modal')) {
      overlay.querySelector('.modal').style.maxWidth = '850px';
      overlay.querySelector('.modal').style.width = '95vw';
      overlay.querySelector('.modal').style.padding = '0';
      overlay.querySelector('.modal').style.overflow = 'hidden';
    }
};

window.clearPackageConfirm = () => {
  const content = document.createElement('div');
  content.style.padding = '1.5rem';
  content.style.textAlign = 'center';
  content.innerHTML = `
    <div style="width:64px;height:64px;border-radius:50%;background:#fee2e2;color:#ef4444;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
      <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
    </div>
    <h3 style="font-size:1.5rem;font-weight:800;color:var(--gray-900);margin-bottom:0.75rem;">Bersihkan Paket</h3>
    <p style="font-size:0.95rem;color:var(--gray-600);margin-bottom:2rem;line-height:1.6;">Apakah Anda yakin ingin membersihkan semua pilihan paket wisata Anda?<br/>Tindakan ini tidak dapat dibatalkan.</p>
    <div style="display:flex;gap:1rem;">
      <button class="btn btn-outline" style="flex:1;padding:0.75rem;font-weight:700;" onclick="closeModal()">Batal</button>
      <button class="btn" style="flex:1;background:#ef4444;color:#fff;border:none;border-radius:12px;padding:0.75rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(239,68,68,0.2);" onmouseover="this.style.background='#dc2626';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#ef4444';this.style.transform='none'" id="btn-confirm-clear">Ya, Bersihkan</button>
    </div>
  `;
  
  const overlay = showModal(content);
  if (overlay && overlay.querySelector('.modal')) {
    overlay.querySelector('.modal').style.maxWidth = '400px';
    overlay.querySelector('.modal').style.borderRadius = '24px';
  }
  
  document.getElementById('btn-confirm-clear').onclick = () => {
    State.package = {
      name: 'Paket Workation Saya',
      penginapan: [],
      penginapanSchedule: [],
      nights: State.package.nights || 4,
      workspaces: [],
      workspacesSchedule: [],
      meetingDay: null,
      meetingTime: "10:00",
      meetingPax: 2,
      transport: null,
      activities: [],
    };
    renderApp();
    closeModal();
    showToast("Paket berhasil dibersihkan.");
  };
};

// Package handlers
function selectPenginapan(id) {
  if (!State.user) return showLoginRequiredPopup('Silakan login terlebih dahulu untuk menyusun paket.');
  const pkg = State.package;
  const idx = pkg.penginapan.findIndex(p=>p.id==id);
  if (idx >= 0) {
    pkg.penginapan.splice(idx,1);
  } else {
    if (pkg.penginapan.length >= 3) {
      if (typeof showToast === 'function') showToast('Maksimal 3 penginapan untuk satu trip.');
      return;
    }
    pkg.penginapan.push( (API_DATA?.penginapan || []).find(x=>x.id==id) );
  }
  State.autoSplitPenginapan();
  renderApp();
}

window.updatePenginapanSchedule = (idx, newHotelId) => {
  const schedule = State.package.penginapanSchedule;
  const oldHotelId = schedule[idx];
  
  if (oldHotelId === newHotelId) return;

  // Swap logic: ensures all selected hotels are utilized
  const swapIdx = schedule.findIndex(id => id === newHotelId);
  if (swapIdx !== -1) {
    schedule[swapIdx] = oldHotelId;
  }
  schedule[idx] = newHotelId;
  
  renderApp();
};

window._openDropdownIdx = null;
window.toggleCustomDropdown = (idx, event) => {
  event.stopPropagation();
  window._openDropdownIdx = window._openDropdownIdx === idx ? null : idx;
  renderApp();
};
window.selectCustomDropdownItem = (idx, hotelId, event) => {
  event.stopPropagation();
  window._openDropdownIdx = null;
  updatePenginapanSchedule(idx, hotelId);
};
if (!window._dropdownListenerAdded) {
  window.addEventListener('click', () => {
    if (window._openDropdownIdx !== null) {
      window._openDropdownIdx = null;
      renderApp();
    }
  });
  window._dropdownListenerAdded = true;
}

window.updateWorkspaceSchedule = (idx, newWsId) => {
  const oldWsId = State.package.workspacesSchedule[idx];
  const oldMeetingDay = State.package.meetingDay;

  State.package.workspacesSchedule[idx] = newWsId;
  if (newWsId === 'libur' && State.package.meetingDay === String(idx)) {
    State.package.meetingDay = null; // Auto-reset if the day becomes a holiday
  }
  
  // Auto cancel workspace if all days are 'Libur'
  if (State.package.workspacesSchedule.length > 0 && State.package.workspacesSchedule.every(w => w === 'libur')) {
    // Wait for render to finish before alerting, so UI is snappy
    setTimeout(async () => {
      const confirmed = await showDangerConfirmPopup(
        "Hapus Workspace?",
        "Anda mengatur semua hari kerja menjadi 'Libur'. Apakah Anda ingin membatalkan/menghapus pilihan Workspace dari paket ini secara keseluruhan?",
        "Ya, Hapus Semua",
        "Batal"
      );
      if (confirmed) {
        State.package.workspaces = [];
        State.package.workspacesSchedule = [];
        renderApp();
      } else {
        State.package.workspacesSchedule[idx] = oldWsId;
        State.package.meetingDay = oldMeetingDay;
        renderApp();
      }
    }, 100);
  } else if (State.package.workspacesSchedule.length > 0) {
    // Check for partially unused workspaces
    const usedWsIds = new Set(State.package.workspacesSchedule.filter(w => w !== 'libur'));
    const unusedWorkspaces = State.package.workspaces.filter(w => !usedWsIds.has(w.id));
    
    if (unusedWorkspaces.length > 0) {
      setTimeout(async () => {
        const names = unusedWorkspaces.map(w => `<b>${w.name}</b>`).join(' dan ');
        const confirmed = await showDangerConfirmPopup(
          "Hapus Cafe?",
          `Anda tidak menjadwalkan kunjungan ke ${names} di hari manapun. Apakah Anda ingin menghapusnya dari paket ini?`,
          "Ya, Hapus",
          "Batal"
        );
        if (confirmed) {
          State.package.workspaces = State.package.workspaces.filter(w => usedWsIds.has(w.id));
          renderApp();
        } else {
          State.package.workspacesSchedule[idx] = oldWsId;
          State.package.meetingDay = oldMeetingDay;
          renderApp();
        }
      }, 100);
    }
  }
  
  renderApp();
};
window.updateMeetingDay = (val) => {
  State.package.meetingDay = val === "" ? null : val;
  renderApp();
};
window.updateMeetingTime = (val) => {
  State.package.meetingTime = val;
  renderApp();
};
window.updateMeetingPax = (val) => {
  State.package.meetingPax = val;
  renderApp();
};

window._openWsDropdownIdx = null;
window.toggleWsDropdown = (idx, event) => {
  event.stopPropagation();
  window._openWsDropdownIdx = window._openWsDropdownIdx === idx ? null : idx;
  window._openMeetingDropdown = false; // close others
  renderApp();
};
window.selectWsDropdownItem = (idx, wsId, event) => {
  event.stopPropagation();
  window._openWsDropdownIdx = null;
  updateWorkspaceSchedule(idx, wsId);
};

window._openMeetingDropdown = false;
window.toggleMeetingDropdown = (event) => {
  event.stopPropagation();
  window._openMeetingDropdown = !window._openMeetingDropdown;
  window._openWsDropdownIdx = null; // close others
  renderApp();
};
window.selectMeetingDay = (val, event) => {
  event.stopPropagation();
  window._openMeetingDropdown = false;
  updateMeetingDay(val);
};

if (!window._wsDropdownListenerAdded) {
  window.addEventListener('click', () => {
    let shouldRender = false;
    if (window._openWsDropdownIdx !== null) {
      window._openWsDropdownIdx = null;
      shouldRender = true;
    }
    if (window._openMeetingDropdown) {
      window._openMeetingDropdown = false;
      shouldRender = true;
    }
    if (shouldRender) renderApp();
  });
  window._wsDropdownListenerAdded = true;
}

function toggleWorkspace(id) {
  if (!State.user) return showLoginRequiredPopup('Silakan login terlebih dahulu untuk menyusun paket.');
  const pkg = State.package;
  const idx = pkg.workspaces.findIndex(w=>w.id==id);
  if (idx >= 0) {
    pkg.workspaces.splice(idx,1);
  } else if (pkg.workspaces.length < 3) {
    const ws = (API_DATA?.workspace || []).find(x=>x.id==id);
    if (ws) pkg.workspaces.push({ ...ws });
  }
  State.autoSplitWorkspaces();
  renderApp();
}

function selectTransport(id) {
  if (!State.user) return showLoginRequiredPopup('Silakan login terlebih dahulu untuk menyusun paket.');
  const pkg = State.package;
  if (pkg.transport && pkg.transport.id === id) {
    pkg.transport = null;
  } else {
    pkg.transport = TRANSPORT_OPTIONS.find(t=>t.id===id);
  }
  renderApp();
}

function toggleActivity(id, cat) {
  if (!State.user) return showLoginRequiredPopup('Silakan login terlebih dahulu untuk menyusun paket.');
  const pkg = State.package;
  const idx = pkg.activities.findIndex(a=>a.id==id);
  if (idx >= 0) {
    pkg.activities.splice(idx,1);
  } else {
    const act = (API_DATA?.[cat] || []).find(x=>x.id==id);
    if (act) pkg.activities.push(act);
  }
  renderApp();
}

function autoRecommend() {
  if (!State.user) return showLoginRequiredPopup('Silakan login terlebih dahulu untuk menggunakan rekomendasi otomatis.');
  const budget = pkgState.budgetLimit;
  const pkg = State.package;
  pkg.penginapan = (API_DATA?.penginapan || []).find(p=>p.price*pkg.nights<=budget*0.6) || (API_DATA?.penginapan || [])[0];
  if (!pkg.workspaces.length && API_DATA?.workspace?.length) pkg.workspaces = [{ ...API_DATA.workspace[0], days:2, workDays:[1,2] }];
  pkg.transport = TRANSPORT_OPTIONS[0];
  if (!pkg.activities.length) pkg.activities = [API_DATA?.wisata?.[0], API_DATA?.kuliner?.[0]].filter(Boolean);
  renderApp();
  showToast('Rekomendasi otomatis diterapkan!');
}
window.generatePdf = () => {
  showToast('Fitur Download PDF akan segera hadir!');
};

// ==================================
// AI WIZARD LOGIC
// ==================================
window.toggleAiWizardInline = () => {
  const container = document.getElementById('ai-wizard-inline-container');
  if (!container) return;

  if (container.style.display === 'block' && !container.classList.contains('collapse-out')) {
    container.classList.remove('expand-in');
    container.classList.add('collapse-out');
    setTimeout(() => {
      container.style.display = 'none';
      container.classList.remove('collapse-out');
    }, 300);
    return;
  }
  
  container.style.display = 'block';
  container.classList.add('expand-in');
  
  // Custom modern AI wizard HTML
  container.innerHTML = `
    <!-- Top Illustration Header -->
    <div style="background: linear-gradient(135deg, rgba(209,250,229,0.3) 0%, rgba(255,255,255,0) 100%); padding: 2.5rem 2.5rem 1rem 2.5rem; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; border-bottom: 1px solid rgba(16,185,129,0.1);">
      
      <!-- Background Circles -->
      <div style="position:absolute; top:-50px; left:-50px; width:200px; height:200px; background:radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%); border-radius:50%;"></div>
      <div style="position:absolute; bottom:-100px; right:10%; width:300px; height:300px; background:radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 70%); border-radius:50%;"></div>

      <div style="position: relative; z-index: 2; max-width: 400px;">
        <div style="display:inline-flex; align-items:center; gap:6px; background:var(--green); color:white; padding:4px 12px; border-radius:100px; font-size:0.75rem; font-weight:700; margin-bottom:1rem; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          AI Magic Builder
        </div>
        <h2 style="font-family:'Playfair Display',serif; font-size:2.2rem; font-weight:800; color:#111827; margin-bottom:0.75rem; line-height:1.2;">
          Siap meracik liburan<br/>impianmu? ✨
        </h2>
        <p style="color:#4B5563; font-size:0.95rem; line-height:1.5; margin:0;">
          Cukup jawab 3 pertanyaan singkat,<br/>
          AI akan buatkan rekomendasi terbaik untukmu.
        </p>
      </div>

      <!-- 3D Illustration Area (Placeholder) -->
      <div style="position: relative; z-index: 2; width: 250px; height: 180px; display: flex; justify-content: center; align-items: center;">
        <div style="position:absolute; right: -20px; top: -30px; font-size:6rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); animation: float-up-down 3s ease-in-out infinite;">🤖</div>
        <div style="position:absolute; left: -10px; top: 10px; font-size:2.5rem; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); animation: float-up-down 4s ease-in-out infinite reverse;">🧳</div>
        <div style="position:absolute; right: -40px; bottom: 20px; font-size:2.5rem; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); animation: float-up-down 3.5s ease-in-out infinite 1s;">🏝️</div>
        <div style="position:absolute; right: 50px; bottom: 10px; font-size:2rem; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); animation: float-up-down 2.5s ease-in-out infinite 0.5s;">📸</div>
        
        <svg width="200" height="100" viewBox="0 0 200 100" style="position:absolute; top:20px; left:0; z-index:-1; opacity:0.3">
          <path d="M 10 90 Q 100 -20 190 90" fill="none" stroke="var(--green)" stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round"></path>
        </svg>
      </div>
    </div>
    
    <!-- Wizard Forms -->
    <div style="background:var(--white); padding:2rem 2.5rem 3rem 2.5rem; border-radius: 0 0 24px 24px;" id="ai-wizard-content">
      
      <!-- STEP 1 -->
      <div class="ai-step-modern" id="ai-step-1">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:28px; height:28px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">1</div>
            <h4 style="font-size:1.15rem; font-weight:700; color:var(--gray-800); margin:0;">Berlibur dengan <span style="color:var(--green)">siapa?</span></h4>
          </div>
          <!-- Stepper Indicators -->
          <div style="display:flex; align-items:center; gap:0.5rem;">
             <div style="width:24px; height:24px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">1</div>
             <div style="width:20px; height:2px; background:var(--gray-200);"></div>
             <div style="width:24px; height:24px; background:var(--gray-200); color:var(--gray-500); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">2</div>
             <div style="width:20px; height:2px; background:var(--gray-200);"></div>
             <div style="width:24px; height:24px; background:var(--gray-200); color:var(--gray-500); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">3</div>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem;">
          <button class="ai-card-btn" onclick="selectAiOptionModern(1, 'Solo Traveler')">
            <div class="ai-card-icon" style="background:#D1FAE5; color:#059669;">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div class="ai-card-title">Solo Traveler</div>
            <div class="ai-card-desc">Perjalanan sendiri lebih bebas</div>
            <div class="ai-radio-btn"></div>
          </button>

          <button class="ai-card-btn" onclick="selectAiOptionModern(1, 'Pasangan')">
            <div class="ai-card-icon" style="background:#EDE9FE; color:#7C3AED;">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div class="ai-card-title">Pasangan</div>
            <div class="ai-card-desc">Quality time berdua</div>
            <div class="ai-radio-btn"></div>
          </button>

          <button class="ai-card-btn" onclick="selectAiOptionModern(1, 'Keluarga')">
            <div class="ai-card-icon" style="background:#FFEDD5; color:#EA580C;">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div class="ai-card-title">Keluarga</div>
            <div class="ai-card-desc">Liburan seru bersama keluarga</div>
            <div class="ai-radio-btn"></div>
          </button>

          <button class="ai-card-btn" onclick="selectAiOptionModern(1, 'Tim Kerja')">
            <div class="ai-card-icon" style="background:#DBEAFE; color:#2563EB;">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
            </div>
            <div class="ai-card-title">Tim Kerja</div>
            <div class="ai-card-desc">Workation atau company trip</div>
            <div class="ai-radio-btn"></div>
          </button>
        </div>
      </div>
      
      <!-- STEP 2 -->
      <div class="ai-step-modern" id="ai-step-2" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:28px; height:28px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">2</div>
            <h4 style="font-size:1.15rem; font-weight:700; color:var(--gray-800); margin:0;">Suasana apa yang <span style="color:var(--green)">dicari?</span></h4>
          </div>
          <!-- Stepper Indicators -->
          <div style="display:flex; align-items:center; gap:0.5rem;">
             <div style="width:24px; height:24px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">✓</div>
             <div style="width:20px; height:2px; background:var(--green);"></div>
             <div style="width:24px; height:24px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">2</div>
             <div style="width:20px; height:2px; background:var(--gray-200);"></div>
             <div style="width:24px; height:24px; background:var(--gray-200); color:var(--gray-500); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">3</div>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem;">
          <button class="ai-card-btn" onclick="selectAiOptionModern(2, 'Tenang & Alam')">
            <div class="ai-card-icon" style="background:#DCFCE7; color:#16A34A;">🍃</div>
            <div class="ai-card-title">Tenang & Alam</div>
            <div class="ai-card-desc">Jauh dari hiruk pikuk kota</div>
            <div class="ai-radio-btn"></div>
          </button>

          <button class="ai-card-btn" onclick="selectAiOptionModern(2, 'Pantai & Laut')">
            <div class="ai-card-icon" style="background:#E0F2FE; color:#0284C7;">🌊</div>
            <div class="ai-card-title">Pantai & Laut</div>
            <div class="ai-card-desc">Suara ombak menenangkan</div>
            <div class="ai-radio-btn"></div>
          </button>

          <button class="ai-card-btn" onclick="selectAiOptionModern(2, 'Modern & Cafe')">
            <div class="ai-card-icon" style="background:#FEF3C7; color:#D97706;">☕</div>
            <div class="ai-card-title">Modern & Cafe</div>
            <div class="ai-card-desc">Cepat & Estetik</div>
            <div class="ai-radio-btn"></div>
          </button>

          <button class="ai-card-btn" onclick="selectAiOptionModern(2, 'Seni & Budaya')">
            <div class="ai-card-icon" style="background:#FCE7F3; color:#DB2777;">🎭</div>
            <div class="ai-card-title">Seni & Budaya</div>
            <div class="ai-card-desc">Lokal & Tradisional</div>
            <div class="ai-radio-btn"></div>
          </button>
        </div>
      </div>
      
      <!-- STEP 3 -->
      <div class="ai-step-modern" id="ai-step-3" style="display:none;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:28px; height:28px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">3</div>
            <h4 style="font-size:1.15rem; font-weight:700; color:var(--gray-800); margin:0;">Berapa perkiraan <span style="color:var(--green)">budget Anda?</span></h4>
          </div>
          <!-- Stepper Indicators -->
          <div style="display:flex; align-items:center; gap:0.5rem;">
             <div style="width:24px; height:24px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">✓</div>
             <div style="width:20px; height:2px; background:var(--green);"></div>
             <div style="width:24px; height:24px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">✓</div>
             <div style="width:20px; height:2px; background:var(--green);"></div>
             <div style="width:24px; height:24px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">3</div>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;">
          <button class="ai-card-btn" onclick="selectAiOptionModern(3, 'Hemat', 1500000)">
            <div class="ai-card-icon" style="background:#F1F5F9; color:#475569;">🥉</div>
            <div class="ai-card-title">Hemat / Backpacker</div>
            <div class="ai-card-desc">Max Rp 1.500.000</div>
            <div class="ai-radio-btn"></div>
          </button>
          
          <button class="ai-card-btn" onclick="selectAiOptionModern(3, 'Menengah', 3500000)">
            <div class="ai-card-icon" style="background:#FEF9C3; color:#CA8A04;">🥈</div>
            <div class="ai-card-title">Menengah / Comfort</div>
            <div class="ai-card-desc">Max Rp 3.500.000</div>
            <div class="ai-radio-btn"></div>
          </button>
          
          <button class="ai-card-btn" onclick="selectAiOptionModern(3, 'Sultan', 10000000)">
            <div class="ai-card-icon" style="background:#FEF08A; color:#EAB308;">🥇</div>
            <div class="ai-card-title">Sultan / Premium</div>
            <div class="ai-card-desc">Max Rp 10.000.000</div>
            <div class="ai-radio-btn"></div>
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div class="ai-step-modern" id="ai-step-loading" style="display:none;text-align:center;padding:3rem 0;">
        <div class="magic-spinner"></div>
        <h4 style="font-size:1.25rem;font-weight:800;margin-bottom:0.25rem;color:var(--gray-900);margin-top:1.5rem">AI Sedang Meracik Magis... ✨</h4>
        <p style="font-size:0.95rem;color:var(--gray-500);">Menganalisis jutaan kemungkinan terbaik untuk Anda.</p>
      </div>

      <!-- Preview State -->
      <div class="ai-step-modern" id="ai-step-preview" style="display:none;">
        <h4 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900); display:flex; align-items:center; gap:10px">
          <span style="background:var(--green-100); color:var(--green-dark); padding:6px 12px; border-radius:8px;">✨</span> Rekomendasi Terpilih
        </h4>
        <div id="ai-preview-content" style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem; background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0;"></div>
        
        <div style="display:flex;gap:1rem;align-items:center;">
          <button style="flex:1;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;border:none;border-radius:12px;padding:1rem;font-size:1.05rem;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(16,185,129,0.3);text-align:center;transition:transform 0.2s, box-shadow 0.2s;display:flex;justify-content:center;align-items:center;gap:8px" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 20px rgba(16,185,129,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 16px rgba(16,185,129,0.3)'" onclick="applyAiRecommendation()">
            ✨ Terapkan ke Paket
          </button>
          <button style="background:transparent;border:2px solid var(--gray-200);color:var(--gray-600);border-radius:12px;padding:0.875rem 2rem;font-weight:700;font-size:1rem;cursor:pointer;text-align:center;transition:all 0.2s;" onmouseover="this.style.background='var(--gray-100)';this.style.color='var(--gray-800)'" onmouseout="this.style.background='transparent';this.style.color='var(--gray-600)'" onclick="cancelAiRecommendation()">
            Batal
          </button>
        </div>
      </div>
    </div>
  `;
  
  if(!document.getElementById('ai-wizard-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-wizard-styles';
    style.innerHTML = `
      .ai-step-modern {
        animation: fadeSlideUp 0.4s ease-out forwards;
      }
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOutDown {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(15px); }
      }
      .ai-card-btn {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
      }
      .ai-card-btn:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08);
        border-color: #cbd5e1;
      }
      .ai-card-btn.selected {
        border-color: var(--green);
        background: #f0fdf4;
        box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.15);
      }
      .ai-card-icon {
        width: 64px; height: 64px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 1rem;
      }
      .ai-card-title {
        font-weight: 700;
        font-size: 1rem;
        color: #1e293b;
        margin-bottom: 0.25rem;
      }
      .ai-card-desc {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 1.25rem;
        line-height: 1.4;
      }
      .ai-radio-btn {
        width: 20px; height: 20px;
        border-radius: 50%;
        border: 2px solid #cbd5e1;
        position: relative;
        transition: all 0.2s;
      }
      .ai-card-btn.selected .ai-radio-btn {
        border-color: var(--green);
      }
      .ai-card-btn.selected .ai-radio-btn::after {
        content: ''; position: absolute;
        width: 10px; height: 10px;
        background: var(--green);
        border-radius: 50%;
        top: 50%; left: 50%; transform: translate(-50%, -50%);
      }
      
      @keyframes float-up-down {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      .magic-spinner {
        width: 60px; height: 60px;
        border: 4px solid #e2e8f0;
        border-top-color: var(--green);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }
  
  window.aiAnswers = {};
};

window.selectAiOptionModern = (step, answer, budgetLimit = null) => {
  const currentStepEl = document.getElementById(`ai-step-${step}`);
  const buttons = currentStepEl.querySelectorAll('.ai-card-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  
  if(step === 1) window.aiAnswers.companions = answer;
  if(step === 2) window.aiAnswers.vibe = answer;
  if(step === 3) {
    window.aiAnswers.budgetLabel = answer;
    window.aiAnswers.budgetLimit = budgetLimit;
  }
  
  setTimeout(() => {
    if(step === 3) {
      submitAiWizard();
      return;
    }
    
    currentStepEl.style.animation = 'fadeOutDown 0.3s ease-in forwards';
    setTimeout(() => {
      currentStepEl.style.display = 'none';
      currentStepEl.style.animation = '';
      
      const nextStepEl = document.getElementById(`ai-step-${step+1}`);
      nextStepEl.style.display = 'block';
    }, 300);
  }, 400);
};

window.selectAiOption = (step, answer, budgetLimit = null) => {
  if(step === 1) window.aiAnswers.companions = answer;
  if(step === 2) window.aiAnswers.vibe = answer;
  if(step === 3) {
    window.aiAnswers.budgetLabel = answer;
    window.aiAnswers.budgetLimit = budgetLimit;
    submitAiWizard();
    return;
  }
  
  // Move to next step
  document.getElementById(`ai-step-${step}`).style.display = 'none';
  document.getElementById(`ai-step-${step+1}`).style.display = 'block';
};

window.submitAiWizard = async () => {
  document.getElementById('ai-step-3').style.display = 'none';
  document.getElementById('ai-step-loading').style.display = 'block';
  
  try {
    const res = await fetch(`${window.API_BASE_URL || 'http://localhost:3001/api'}/ai/package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(window.aiAnswers)
    });
    
    if(!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    // Store result data and render preview instead of auto-applying
    window.aiResultData = data;
    
    let penginapan = null;
    let workspace = null;
    let wisata = null;
    let kuliner = null;
    
    if(data.penginapanId) penginapan = (API_DATA?.penginapan || []).find(p => p.id == data.penginapanId);
    if(data.workspaceId) workspace = (API_DATA?.workspace || []).find(w => w.id == data.workspaceId);
    let transport = null;
    if(data.transportId) transport = TRANSPORT_OPTIONS.find(t => t.id == data.transportId);
    if(data.wisataId) wisata = (API_DATA?.wisata || []).find(w => w.id == data.wisataId);
    if(data.kulinerId) kuliner = (API_DATA?.kuliner || []).find(k => k.id == data.kulinerId) || (API_DATA?.budaya || []).find(b => b.id == data.kulinerId);

    let previewHtml = '';
    if(penginapan) previewHtml += `<div style="background:var(--gray-50);padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.75rem;color:var(--gray-500);font-weight:700;">PENGINAPAN</div><div style="font-weight:600;color:var(--gray-800);">${penginapan.name}</div></div><div style="color:var(--green);font-weight:700;">${formatRupiah(penginapan.price)}</div></div>`;
    if(workspace) previewHtml += `<div style="background:var(--gray-50);padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.75rem;color:var(--gray-500);font-weight:700;">WORKSPACE</div><div style="font-weight:600;color:var(--gray-800);">${workspace.name}</div></div><div style="color:var(--green);font-weight:700;">${formatRupiah(workspace.price)}</div></div>`;
    if(transport) previewHtml += `<div style="background:var(--gray-50);padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.75rem;color:var(--gray-500);font-weight:700;">TRANSPORTASI</div><div style="font-weight:600;color:var(--gray-800);">${transport.name}</div></div><div style="color:var(--green);font-weight:700;">${formatRupiah(transport.price)}</div></div>`;
    if(wisata) previewHtml += `<div style="background:var(--gray-50);padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.75rem;color:var(--gray-500);font-weight:700;">WISATA</div><div style="font-weight:600;color:var(--gray-800);">${wisata.name}</div></div><div style="color:var(--green);font-weight:700;">${formatRupiah(wisata.price)}</div></div>`;
    if(kuliner) previewHtml += `<div style="background:var(--gray-50);padding:0.75rem 1rem;border-radius:8px;border:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.75rem;color:var(--gray-500);font-weight:700;">KULINER/BUDAYA</div><div style="font-weight:600;color:var(--gray-800);">${kuliner.name}</div></div><div style="color:var(--green);font-weight:700;">${formatRupiah(kuliner.price)}</div></div>`;
    
    document.getElementById('ai-preview-content').innerHTML = previewHtml;
    
    document.getElementById('ai-step-loading').style.display = 'none';
    document.getElementById('ai-step-preview').style.display = 'block';
    
  } catch(e) {
    console.error(e);
    alert('Terjadi kesalahan saat memanggil AI. Pastikan server backend berjalan dan API Key valid.');
    
    const container = document.getElementById('ai-wizard-inline-container');
    container.classList.remove('expand-in');
    container.classList.add('collapse-out');
    setTimeout(() => {
      container.style.display = 'none';
      container.classList.remove('collapse-out');
    }, 300);
  }
};

window.applyAiRecommendation = () => {
  const data = window.aiResultData;
  if(!data) return;
  
  if(data.penginapanId) selectPenginapan(data.penginapanId);
  if(data.workspaceId && !State.package.workspaces.find(w => w.id == data.workspaceId)) toggleWorkspace(data.workspaceId);
  if(data.transportId) selectTransport(data.transportId);
  if(data.wisataId && !State.package.activities.find(a => a.id == data.wisataId)) toggleActivity(data.wisataId, 'wisata');
  if(data.kulinerId && !State.package.activities.find(a => a.id == data.kulinerId)) toggleActivity(data.kulinerId, (API_DATA?.budaya || []).some(b => b.id == data.kulinerId) ? 'budaya' : 'kuliner');
  
  pkgState.budgetLimit = window.aiAnswers.budgetLimit;
  
  const container = document.getElementById('ai-wizard-inline-container');
  container.classList.remove('expand-in');
  container.classList.add('collapse-out');
  
  setTimeout(() => {
    container.style.display = 'none';
    container.classList.remove('collapse-out');
    
    showToast('✨ Paket berhasil diterapkan ke Simpan Paket! Alasan: ' + data.reason);
    renderApp();
    
    const summaryWrap = document.querySelector('.package-summary');
    if (summaryWrap) {
      window.scrollTo({ top: summaryWrap.offsetTop - 150, behavior: 'smooth' });
    }
  }, 300);
};

window.cancelAiRecommendation = () => {
  const container = document.getElementById('ai-wizard-inline-container');
  container.classList.remove('expand-in');
  container.classList.add('collapse-out');
  setTimeout(() => {
    container.style.display = 'none';
    container.classList.remove('collapse-out');
  }, 300);
};
function isPackageEmpty() {
  const pkg = State.package;
  return !pkg.penginapan && pkg.workspaces.length === 0 && !pkg.transport && pkg.activities.length === 0;
}

async function savePackage() {
  if (isPackageEmpty()) return showToast('Paket masih kosong. Silakan pilih minimal satu lokasi terlebih dahulu.');
  if (!State.user) {
    showToast('Silakan login terlebih dahulu untuk menyimpan paket.');
    showAuthModal('login');
    return;
  }
  const oldText = document.getElementById('btn-save-package')?.innerText;
  if(document.getElementById('btn-save-package')) {
    document.getElementById('btn-save-package').innerText = 'Menyimpan...';
    document.getElementById('btn-save-package').disabled = true;
  }
  try {
    await State.savePackage();
    showToast('Paket berhasil disimpan!');
  } finally {
    if(document.getElementById('btn-save-package')) {
      document.getElementById('btn-save-package').innerText = oldText || 'Simpan Paket';
      document.getElementById('btn-save-package').disabled = false;
    }
  }
}

function proceedToBooking() {
  if (isPackageEmpty()) return showToast('Paket masih kosong. Silakan pilih minimal satu lokasi terlebih dahulu.');
  if (!State.user) {
    showToast('Silakan login terlebih dahulu untuk melanjutkan pemesanan.');
    showAuthModal('login');
    return;
  }
  navigate('booking');
}

function sharePackage() {
  if (isPackageEmpty()) return showToast('Paket masih kosong. Tidak ada yang bisa dibagikan.');
  const text = `Paket Workation Gunung Kidul\n${State.package.name}\nTotal: ${formatRupiah(State.calcTotal())}\n\nDibuat di GLOW - Gunung Kidul Location for Work`;
  navigator.clipboard.writeText(text);
  showToast('Link paket disalin ke clipboard!');
}

window.loadMorePkg = (cat) => {
  pkgState.limits[cat] += 4;
  renderApp();
};

window.collapsePkg = (cat) => {
  pkgState.limits[cat] = 4;
  renderApp();
  setTimeout(() => {
    // Scroll slightly up so user doesn't lose context after collapsing
    window.scrollBy({ top: -200, behavior: 'smooth' });
  }, 100);
};

window.showTransportDetailModal = (id) => {
  const t = TRANSPORT_OPTIONS.find(x => x.id === id);
  if (!t) return;
  
  const content = el('div', '');
  content.style.padding = '1.5rem';
  content.style.position = 'relative';
  
  content.innerHTML = `
    <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;background:var(--gray-100);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--gray-600);transition:background 0.2s">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    
    <div style="margin-bottom:1.25rem;">
      <h2 style="font-size:1.5rem;font-weight:800;color:var(--gray-900);margin-bottom:0.25rem">${t.name}</h2>
      <div style="font-size:1.125rem;color:var(--green);font-weight:700">${t.price > 0 ? formatRupiah(t.price) + ' <span style="font-size:0.875rem;font-weight:500;color:var(--gray-500)">/ hari</span>' : 'Sesuai Jarak/Pribadi'}</div>
    </div>
    
    <div style="width:100%;height:200px;border-radius:12px;overflow:hidden;margin-bottom:1.5rem;background:var(--gray-100)">
      <img src="${t.img}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://picsum.photos/seed/${t.id}/800/400'" />
    </div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
      <div style="background:var(--gray-50);padding:1rem;border-radius:12px;border:1px solid var(--gray-200)">
        <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:4px">Kapasitas</div>
        <div style="font-size:0.875rem;font-weight:600;color:var(--gray-800)">${t.seats}</div>
      </div>
      <div style="background:var(--gray-50);padding:1rem;border-radius:12px;border:1px solid var(--gray-200)">
        <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:4px">Bahan Bakar</div>
        <div style="font-size:0.875rem;font-weight:600;color:var(--gray-800)">${t.fuel}</div>
      </div>
    </div>
    
    <div style="margin-bottom:1.5rem">
      <div style="font-size:1rem;font-weight:700;color:var(--gray-900);margin-bottom:0.75rem;display:flex;align-items:center;gap:6px">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Jam Operasional
      </div>
      <div style="font-size:0.875rem;color:var(--gray-600);background:var(--green-50, rgba(16,185,129,0.1));padding:0.75rem 1rem;border-radius:8px;border:1px solid rgba(16,185,129,0.2);font-weight:500">
        ${t.openingHours}
      </div>
    </div>
    
    ${t.agents && t.agents.length > 0 ? `
    <div style="margin-bottom:1.5rem">
      <div style="font-size:1rem;font-weight:700;color:var(--gray-900);margin-bottom:0.75rem;display:flex;align-items:center;gap:6px">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        Mitra / Vendor
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        ${t.agents.map(a => `<span style="background:var(--gray-100);color:var(--gray-700);padding:4px 10px;border-radius:100px;font-size:0.8rem;font-weight:600">${a}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    <div style="margin-bottom:1.5rem">
      <div style="font-size:1rem;font-weight:700;color:var(--gray-900);margin-bottom:0.75rem;display:flex;align-items:center;gap:6px">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Syarat & Ketentuan
      </div>
      <ul style="margin:0;padding-left:1.25rem;font-size:0.875rem;color:var(--gray-600);line-height:1.6">
        ${t.terms.map(term => `<li style="margin-bottom:4px">${term}</li>`).join('')}
      </ul>
    </div>
    
    <button onclick="closeModal()" class="btn btn-primary btn-full" style="padding:0.875rem">Tutup</button>
  `;
  
  const overlay = showModal(content);
  if (overlay && overlay.querySelector('.modal')) {
      overlay.querySelector('.modal').style.maxWidth = '450px';
      overlay.querySelector('.modal').style.borderRadius = '24px';
  }
};

window.updatePackageDates = async () => {
  const startInput = document.getElementById('pkg-start-date');
  const endInput = document.getElementById('pkg-end-date');
  
  if (!startInput || !endInput) return;
  
  const start = new Date(startInput.value);
  const end = new Date(endInput.value);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (start < today) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal('Tanggal Tidak Valid', 'Tanggal kedatangan tidak boleh di masa lalu.');
    } else {
        alert('Tanggal kedatangan tidak boleh di masa lalu.');
    }
    startInput.value = State.package.startDate; // revert
    return;
  }
  
  if (end <= start) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal('Tanggal Tidak Valid', 'Tanggal kepulangan harus setelah tanggal kedatangan.');
    } else {
        alert('Tanggal kepulangan harus setelah tanggal kedatangan.');
    }
    endInput.value = State.package.endDate; // revert
    return;
  }
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 7) {
    if (typeof showWarningConfirmPopup === 'function') {
      const confirmed = await showWarningConfirmPopup(
        'Peringatan Durasi',
        `Anda merencanakan Workation selama <b>${diffDays} malam</b>. Durasi yang terlalu lama dapat mengakibatkan biaya yang sangat mahal untuk penginapan dan reservasi Workspace. Apakah Anda yakin ingin melanjutkan?`,
        'Setuju & Lanjutkan',
        'Batal'
      );
      if (!confirmed) {
        startInput.value = State.package.startDate; // revert
        endInput.value = State.package.endDate; // revert
        return;
      }
    }
  }
  
  const oldNights = State.package.nights || 0;
  State.package.startDate = startInput.value;
  State.package.endDate = endInput.value;
  State.package.nights = diffDays;
  
  if (oldNights !== diffDays) {
    State.syncSchedules(diffDays);
  }
  
  if (typeof showToast === 'function') showToast(`Durasi workation diperbarui menjadi ${diffDays} malam.`);
  renderApp();
};
