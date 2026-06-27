// ===== PAGE: PACKAGE BUILDER =====

let pkgState = {
  expandedSections: { penginapan: true, workspace: true, transport: true, activities: true },
  autoRec: false,
  budgetLimit: 5000000,
};

function renderPackagePage() {
  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '', '');
  header.style.cssText = 'position:relative; background:url("assets/images/hero-culture.png") center/cover; padding:6rem 0 5rem; color:var(--white); margin-bottom: 2rem;';
  header.innerHTML = `
    <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);z-index:1;"></div>
    <div class="container" style="position:relative;z-index:2;display:grid;grid-template-columns:1fr 360px;gap:3rem;align-items:center;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:100px;padding:6px 16px;margin-bottom:1rem;font-size:0.875rem;color:var(--white);font-weight:600;">Package Builder</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:800;margin-bottom:0.5rem;color:var(--white);letter-spacing:-0.02em;">Susun Paket Workation<br/>Sesuai Keinginanmu</h1>
        <p style="opacity:0.9;max-width:500px;color:var(--white);font-size:1.1rem;margin-bottom:2rem;">Pilih penginapan, workspace, transportasi, dan aktivitas — atur sendiri sesuai budget.</p>
        <div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap">
          <span style="font-size:0.875rem;color:var(--white);opacity:0.9;">Budget Maksimal:</span>
          <input type="range" class="range-slider" min="500000" max="10000000" step="100000" value="${pkgState.budgetLimit}"
            oninput="pkgState.budgetLimit=+this.value;document.getElementById('budget-val').textContent=formatRupiah(+this.value);renderApp()" style="width:220px" />
          <span id="budget-val" style="font-weight:700;color:var(--white);font-size:1.1rem;">${formatRupiah(pkgState.budgetLimit)}</span>
          <button class="btn" style="border-radius:6px;background:var(--white);color:var(--green-dark);font-weight:700;padding:0.6rem 1.25rem;border:none;" onclick="autoRecommend()">Rekomendasi Otomatis</button>
        </div>
      </div>
      
      <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:16px;padding:1.5rem;color:var(--white);">
        <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:1.5rem;">Langkah Membuat Paket</h3>
        <div style="display:flex;flex-direction:column;gap:1.25rem;position:relative;">
          <div style="position:absolute;left:11px;top:20px;bottom:20px;width:2px;background:rgba(255,255,255,0.2);"></div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            <div style="width:24px;height:24px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;border:2px solid rgba(255,255,255,0.8);">1</div>
            <div>
              <div style="font-weight:600;font-size:0.875rem;">Pilih Penginapan</div>
              <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">Tentukan tempat menginapmu</div>
            </div>
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            <div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">2</div>
            <div>
              <div style="font-weight:600;font-size:0.875rem;">Pilih Workspace / Cafe</div>
              <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">Pilih tempat kerja yang nyaman</div>
            </div>
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            <div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">3</div>
            <div>
              <div style="font-weight:600;font-size:0.875rem;">Pilih Transportasi</div>
              <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">Pilih transportasi selama di Gunung Kidul</div>
            </div>
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            <div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">4</div>
            <div>
              <div style="font-weight:600;font-size:0.875rem;">Pilih Aktivitas</div>
              <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">Tambahkan aktivitas pendukung</div>
            </div>
          </div>
          
          <div style="display:flex;gap:1.25rem;position:relative;z-index:2;align-items:center;">
            <div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;">5</div>
            <div>
              <div style="font-weight:600;font-size:0.875rem;">Review & Simpan Paket</div>
              <div style="font-size:0.75rem;opacity:0.7;margin-top:2px;">Cek kembali dan simpan paketmu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  page.appendChild(header);

  const main = el('div', 'container', '');
  main.style.paddingTop = '2rem';

  const sections = el('div', '');
  sections.appendChild(renderPkgPenginapan());
  sections.appendChild(renderPkgWorkspace());
  sections.appendChild(renderPkgTransport());
  sections.appendChild(renderPkgActivities());
  main.appendChild(sections);

  const summaryWrap = el('div', '');
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
  wrap.innerHTML = `
    <div style="background:#FAF9F6;border:1px solid var(--gray-200);border-radius:16px;padding:1.5rem;box-shadow:var(--shadow-sm);margin-bottom:2rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="color:var(--green-dark);">${iconSvg}</div>
          <div>
            <h3 style="font-weight:700;font-size:1.25rem;color:var(--gray-900);margin:0;">${step}. ${title}</h3>
            <div style="font-size:0.875rem;color:var(--gray-500);margin-top:4px;">${subtitle}</div>
          </div>
        </div>
        <div style="display:flex;gap:0.75rem;">
          <select style="padding:8px 12px;border-radius:8px;border:1px solid var(--gray-200);background:var(--white);color:var(--gray-700);font-size:0.875rem;outline:none;cursor:pointer;">
            <option>Semua Area</option>
            <option>Gunung Kidul</option>
          </select>
          <select style="padding:8px 12px;border-radius:8px;border:1px solid var(--gray-200);background:var(--white);color:var(--gray-700);font-size:0.875rem;outline:none;cursor:pointer;">
            <option>Urutkan</option>
            <option>Harga Termurah</option>
            <option>Rating Tertinggi</option>
          </select>
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
  const items = API_DATA?.penginapan || [];
  const content = `
    <div class="pkg-carousel">
      ${items.map(item => {
        const sel = pkg.penginapan?.id == item.id;
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="selectPenginapan('${item.id}')">
            <div class="pkg-card-img">
              <img src="${item.img}" onerror="this.src='https://picsum.photos/seed/${item.id}s/400/300'" />
              <div class="pkg-badge">${item.type || 'Akomodasi'}</div>
              <button class="btn-fav" onclick="event.stopPropagation(); this.classList.toggle('active')">
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
  `;
  const iconBed = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 11v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 11h18M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4M8 7h8"></path></svg>`;
  return pkgSection('1', 'Pilih Penginapan', 'Pilih akomodasi yang sesuai kebutuhanmu', 'penginapan', content, iconBed);
}

function renderPkgWorkspace() {
  const pkg = State.package;
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const content = `
    <div class="pkg-carousel">
      ${(API_DATA?.workspace || []).map(item => {
        const sel = pkg.workspaces.find(w=>w.id==item.id);
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="toggleWorkspace('${item.id}')">
            <div class="pkg-card-img">
              <img src="${item.img}" onerror="this.src='https://picsum.photos/seed/${item.id}w/400/300'" />
              <div class="pkg-badge">Cafe & Coworking</div>
              <button class="btn-fav" onclick="event.stopPropagation(); this.classList.toggle('active')">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              </button>
            </div>
            <div class="pkg-card-body">
              <div class="pkg-card-title">${item.name}</div>
              <div class="pkg-card-loc">WiFi: ${item.wifi} Mbps</div>
              <div class="pkg-card-price">${formatRupiah(item.price)} <span>/ hari</span></div>
              
              ${sel ? `
                <div style="margin-top:0.5rem;margin-bottom:1rem;border-top:1px solid var(--gray-100);padding-top:0.5rem;" onclick="event.stopPropagation()">
                  <div style="font-size:0.7rem;font-weight:600;color:var(--gray-500);margin-bottom:6px;">HARI KERJA:</div>
                  <div style="display:flex;gap:4px;flex-wrap:wrap">
                    ${days.map((d,i)=>`
                      <label style="cursor:pointer">
                        <input type="checkbox" style="display:none" onchange="toggleWorkspaceDay('${item.id}',${i})" ${(sel.workDays||[]).includes(i)?'checked':''} />
                        <span style="display:inline-block;padding:2px 6px;border-radius:6px;font-size:0.65rem;font-weight:600;border:1px solid ${(sel.workDays||[]).includes(i)?'var(--green)':'var(--gray-200)'};background:${(sel.workDays||[]).includes(i)?'var(--green)':'#fff'};color:${(sel.workDays||[]).includes(i)?'#fff':'var(--gray-500)'};cursor:pointer" onclick="toggleWorkspaceDay('${item.id}',${i})">${d}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              <button class="btn ${sel?'btn-secondary':'btn-card'} btn-full" style="padding:0.6rem;font-size:0.875rem;margin-top:auto;" onclick="event.stopPropagation();toggleWorkspace('${item.id}')">${sel?'✓ Dipilih':'Pilih'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  const icon = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
  return pkgSection('2', 'Pilih Workspace / Cafe', 'Pilih tempat kerja yang nyaman', 'workspace', content, icon);
}

function renderPkgTransport() {
  const pkg = State.package;
  const content = `
    <div class="pkg-carousel">
      ${TRANSPORT_OPTIONS.map(t => {
        const sel = pkg.transport?.id === t.id;
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="selectTransport('${t.id}')">
            <div class="pkg-card-img">
               <img src="${t.img}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://picsum.photos/seed/${t.id}/400/300'" />
               <div class="pkg-badge">${t.name}</div>
               <button class="btn-fav" onclick="event.stopPropagation(); this.classList.toggle('active')">
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
  `;
  const icon = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM8 12h8"></path></svg>`;
  return pkgSection('3', 'Pilih Transportasi', 'Pilih transportasi selama di Gunung Kidul', 'transport', content, icon);
}

function renderPkgActivities() {
  const pkg = State.package;
  const allAct = [...(API_DATA?.wisata || []), ...(API_DATA?.kuliner || [])];
  const content = `
    <div class="pkg-carousel">
      ${allAct.map(item => {
        const sel = pkg.activities.find(a=>a.id===item.id);
        const badge = getCategoryBadge(item.category);
        return `
          <div class="pkg-card ${sel?'selected':''}" onclick="toggleActivity('${item.id}','${item.category}')">
            <div class="pkg-card-img">
              <img src="${item.img}" onerror="this.src='https://picsum.photos/seed/${item.id}a/400/300'" />
              <div class="pkg-badge">${badge.label}</div>
              <button class="btn-fav" onclick="event.stopPropagation(); this.classList.toggle('active')">
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
  `;
  const icon = `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
  return pkgSection('4', 'Pilih Aktivitas', 'Tambahkan aktivitas pendukung', 'activities', content, icon);
}

function renderPackageSummary() {
  const pkg = State.package;
  const total = State.calcTotal();
  const progress = State.getProgress();
  const days = Array.from({length: pkg.nights}, (_,i) => i+1);

  const summaryEl = el('div', 'package-summary');
  summaryEl.innerHTML = `
    <div class="package-summary-header">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Nama Paket</div>
      <input type="text" value="${pkg.name}" onchange="State.package.name=this.value"
        style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:10px 12px;color:var(--gray-800);font-weight:700;font-size:1rem;width:100%;outline:none;transition:border-color 0.2s" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--gray-200)'" />
      <div style="margin-top:1.5rem">
        <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:8px">Kelengkapan Paket (${Math.round(progress)}%)</div>
        <div class="progress-bar" style="background:var(--gray-200);height:6px;border-radius:4px;overflow:hidden;"><div class="progress-fill" style="width:${progress}%;background:var(--green);height:100%;border-radius:4px;"></div></div>
      </div>
    </div>

    <div class="package-breakdown">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem;text-transform:uppercase">Rincian Biaya</div>
      ${pkg.penginapan ? `<div class="breakdown-row"><span>${pkg.penginapan.name}<br/><span style="font-size:0.75rem;color:var(--gray-400)">${bookingState.checkIn ? pkg.nights : '?'} malam × ${formatRupiah(pkg.penginapan.price)}</span></span><span style="font-weight:700">${bookingState.checkIn ? formatRupiah(pkg.penginapan.price*pkg.nights) : '-'}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih penginapan</span><span>-</span></div>`}
      ${pkg.workspaces.length > 0 ? `<div class="breakdown-row"><span>Workspace (${pkg.workspaces.length} tempat)</span><span style="font-weight:700">${formatRupiah(pkg.workspaces.reduce((s,w)=>s+w.price*(w.days||1),0))}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih workspace</span><span>-</span></div>`}
      ${pkg.transport ? `<div class="breakdown-row"><span>${pkg.transport.name}<br/><span style="font-size:0.75rem;color:var(--gray-400)">${bookingState.checkIn ? pkg.nights : '?'} hari × ${formatRupiah(pkg.transport.price||0)}</span></span><span style="font-weight:700">${bookingState.checkIn ? formatRupiah((pkg.transport.price||0)*pkg.nights) : '-'}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih transport</span><span>-</span></div>`}
      ${pkg.activities.length > 0 ? `<div class="breakdown-row"><span>Aktivitas (${pkg.activities.length} item)</span><span style="font-weight:700">${formatRupiah(pkg.activities.reduce((s,a)=>s+a.price,0))}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>Belum pilih aktivitas</span><span>-</span></div>`}
      <div class="breakdown-row breakdown-total"><span>TOTAL ESTIMASI</span><span style="color:var(--green)">${bookingState.checkIn ? formatRupiah(total) : '?'}</span></div>
    </div>

    ${!pkg.workspace?.length ? `<div style="margin:0 1.25rem 1rem;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:0.875rem;font-size:0.8rem;color:var(--gray-700)"><span style="font-weight:700;color:var(--gray-900)">Rekomendasi:</span> Coba <strong>Segara Cafe</strong>! WiFi 100 Mbps · Rating 4.9</div>` : ''}

    <div style="padding:0 1.25rem 1rem">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.75rem">Preview Itinerary</div>
      <div style="display:flex;flex-direction:column;gap:0.5rem">
        ${days.map(d => `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem;background:var(--gray-50);border-radius:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0">${d}</div>
            <div style="font-size:0.8rem">
              <div style="font-weight:600">Hari ${d}</div>
              <div style="color:var(--gray-400)">${pkg.penginapan?pkg.penginapan.name:'Penginapan belum dipilih'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="padding:0 1.25rem 1.25rem;display:flex;flex-direction:column;gap:0.625rem">
      <button class="btn btn-primary btn-full" onclick="savePackage()">Simpan Paket</button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.625rem">
        <button class="btn btn-outline btn-sm" onclick="sharePackage()">Bagikan</button>
        <button class="btn btn-secondary btn-sm" onclick="navigate('booking')">Booking →</button>
      </div>
    </div>
  `;
  return summaryEl;
}

// Package handlers
function selectPenginapan(id) {
  State.package.penginapan = (API_DATA?.penginapan || []).find(x=>x.id==id);
  renderApp();
}
function toggleWorkspace(id) {
  const pkg = State.package;
  const idx = pkg.workspaces.findIndex(w=>w.id==id);
  if (idx >= 0) pkg.workspaces.splice(idx,1);
  else if (pkg.workspaces.length < 3) pkg.workspaces.push({ ...(API_DATA?.workspace || []).find(x=>x.id==id), days:1, workDays:[] });
  renderApp();
}
function toggleWorkspaceDay(id, dayIdx) {
  const pkg = State.package;
  const ws = pkg.workspaces.find(w=>w.id==id);
  if (!ws) return;
  if (!ws.workDays) ws.workDays = [];
  const idx = ws.workDays.indexOf(dayIdx);
  if (idx >= 0) ws.workDays.splice(idx,1); else ws.workDays.push(dayIdx);
  ws.days = ws.workDays.length || 1;
  renderApp();
}
function selectTransport(id) {
  State.package.transport = TRANSPORT_OPTIONS.find(t=>t.id===id);
  renderApp();
}
function toggleActivity(id, cat) {
  const pkg = State.package;
  const idx = pkg.activities.findIndex(a=>a.id==id);
  if (idx >= 0) pkg.activities.splice(idx,1);
  else pkg.activities.push((API_DATA?.[cat] || []).find(x=>x.id==id));
  renderApp();
}
function autoRecommend() {
  const budget = pkgState.budgetLimit;
  const pkg = State.package;
  pkg.penginapan = (API_DATA?.penginapan || []).find(p=>p.price*pkg.nights<=budget*0.6) || (API_DATA?.penginapan || [])[0];
  if (!pkg.workspaces.length && API_DATA?.workspace?.length) pkg.workspaces = [{ ...API_DATA.workspace[0], days:2, workDays:[1,2] }];
  pkg.transport = TRANSPORT_OPTIONS[0];
  if (!pkg.activities.length) pkg.activities = [API_DATA?.wisata?.[0], API_DATA?.kuliner?.[0]].filter(Boolean);
  renderApp();
  showToast('Rekomendasi otomatis diterapkan!');
}
function savePackage() {
  State.savePackage();
  showToast('Paket berhasil disimpan!');
}
function sharePackage() {
  const text = `Paket Workation Gunung Kidul\n${State.package.name}\nTotal: ${formatRupiah(State.calcTotal())}\n\nDibuat di GLOW - Gunung Kidul Location for Work`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast('Disalin ke clipboard!'));
}
