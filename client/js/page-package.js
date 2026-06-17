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
  header.style.cssText = 'background:linear-gradient(135deg,var(--green-dark),var(--green));padding:3rem 0 2rem;color:#fff';
  header.innerHTML = `
    <div class="container">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,166,35,0.2);border:1px solid rgba(245,166,35,0.4);border-radius:100px;padding:6px 16px;margin-bottom:1rem;font-size:0.875rem;color:var(--gold)">📦 Package Builder</div>
      <h1 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:800;margin-bottom:0.5rem">Susun Paket Workation<br/><span style="color:var(--gold)">Sesuai Keinginanmu</span></h1>
      <p style="opacity:0.8;max-width:500px">Pilih penginapan, workspace, transportasi, dan aktivitas — atur sendiri sesuai budget.</p>
      <div style="margin-top:1.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <span style="font-size:0.875rem;opacity:0.8">Budget Maksimal:</span>
        <input type="range" class="range-slider" min="500000" max="10000000" step="100000" value="${pkgState.budgetLimit}"
          oninput="pkgState.budgetLimit=+this.value;document.getElementById('budget-val').textContent=formatRupiah(+this.value);renderApp()" style="width:200px" />
        <span id="budget-val" style="font-weight:700;color:var(--gold)">${formatRupiah(pkgState.budgetLimit)}</span>
        <button class="btn btn-primary btn-sm" onclick="autoRecommend()">🤖 Rekomendasi Otomatis</button>
      </div>
    </div>
  `;
  page.appendChild(header);

  const main = el('div', 'container', '');
  main.style.paddingTop = '2rem';
  const layout = el('div', '', '');
  layout.style.cssText = 'display:grid;grid-template-columns:1fr 380px;gap:2rem;align-items:start';

  // Left panel
  const left = el('div', '');
  left.appendChild(renderPkgPenginapan());
  left.appendChild(renderPkgWorkspace());
  left.appendChild(renderPkgTransport());
  left.appendChild(renderPkgActivities());
  layout.appendChild(left);

  // Right summary
  layout.appendChild(renderPackageSummary());
  main.appendChild(layout);
  page.appendChild(main);
  return page;
}

function pkgSection(title, id, content) {
  const expanded = pkgState.expandedSections[id];
  const wrap = el('div', 'card mb-4');
  wrap.style.overflow = 'visible';
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem;border-bottom:${expanded?'1px solid var(--gray-100)':'none'};cursor:pointer" onclick="pkgState.expandedSections['${id}']=!pkgState.expandedSections['${id}'];renderApp()">
      <h3 style="font-weight:700;font-size:1rem;color:var(--green-dark)">${title}</h3>
      <span style="font-size:1.25rem;transition:transform 0.3s;display:inline-block;transform:rotate(${expanded?'180deg':'0deg'})">${expanded?'▲':'▼'}</span>
    </div>
    ${expanded ? `<div style="padding:1.25rem" id="pkg-${id}">${content}</div>` : ''}
  `;
  return wrap;
}

function renderPkgPenginapan() {
  const pkg = State.package;
  const items = DATA.penginapan;
  const content = `
    <div style="margin-bottom:1rem;padding:0.75rem;background:#eff6ff;border-radius:8px;font-size:0.875rem;color:var(--gray-600)">
      ℹ️ Durasi menginap akan dihitung otomatis saat kamu memilih tanggal di halaman <strong>Booking</strong>.
    </div>
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      ${items.map(item => {
        const sel = pkg.penginapan?.id === item.id;
        return `
          <div style="display:flex;gap:1rem;align-items:center;padding:0.875rem;border-radius:12px;border:2px solid ${sel?'var(--green)':'var(--gray-200)'};background:${sel?'rgba(26,74,58,0.04)':'#fff'};cursor:pointer;transition:all 0.2s" onclick="selectPenginapan('${item.id}')">
            <img src="${item.img}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0" onerror="this.src='https://picsum.photos/seed/${item.id}s/200/200'" />
            <div style="flex:1">
              <div style="font-weight:600;font-size:0.875rem;margin-bottom:2px">${item.name}</div>
              <div style="font-size:0.75rem;color:var(--gray-400)">📶 ${item.wifi} Mbps &nbsp;⭐ ${item.rating}</div>
              <div style="font-weight:700;color:var(--green);font-size:0.875rem">${formatRupiah(item.price)}/malam</div>
            </div>
            <div style="flex-shrink:0">
              <button class="btn ${sel?'btn-secondary':'btn-outline'} btn-sm">${sel?'✓ Dipilih':'Pilih'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  return pkgSection('🏨 Penginapan', 'penginapan', content);
}

function renderPkgWorkspace() {
  const pkg = State.package;
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const content = `
    <p style="font-size:0.8rem;color:var(--gray-400);margin-bottom:1rem">Pilih 1–3 workspace. Untuk setiap workspace, tandai hari kerja.</p>
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      ${DATA.workspace.map(item => {
        const sel = pkg.workspaces.find(w=>w.id===item.id);
        return `
          <div style="border-radius:12px;border:2px solid ${sel?'var(--green)':'var(--gray-200)'};background:${sel?'rgba(26,74,58,0.04)':'#fff'};overflow:hidden">
            <div style="display:flex;gap:1rem;align-items:center;padding:0.875rem;cursor:pointer" onclick="toggleWorkspace('${item.id}')">
              <img src="${item.img}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0" onerror="this.src='https://picsum.photos/seed/${item.id}w/200/200'" />
              <div style="flex:1">
                <div style="font-weight:600;font-size:0.875rem">${item.name}</div>
                <div style="font-size:0.75rem;color:var(--gray-400)">📶 ${item.wifi} Mbps · ${(item.suasana||[]).join(', ')}</div>
                <div style="font-weight:700;color:var(--green);font-size:0.875rem">${formatRupiah(item.price)}/hari</div>
              </div>
              <input type="checkbox" ${sel?'checked':''} style="width:18px;height:18px;accent-color:var(--green)" onclick="event.stopPropagation();toggleWorkspace('${item.id}')" />
            </div>
            ${sel ? `
              <div style="padding:0 0.875rem 0.875rem;border-top:1px solid var(--gray-100)">
                <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:6px;margin-top:8px">HARI KERJA:</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  ${days.map((d,i)=>`
                    <label style="cursor:pointer">
                      <input type="checkbox" style="display:none" onchange="toggleWorkspaceDay('${item.id}',${i})" ${(sel.workDays||[]).includes(i)?'checked':''} />
                      <span style="display:inline-block;padding:4px 10px;border-radius:8px;font-size:0.75rem;font-weight:600;border:1px solid ${(sel.workDays||[]).includes(i)?'var(--green)':'var(--gray-200)'};background:${(sel.workDays||[]).includes(i)?'var(--green)':'#fff'};color:${(sel.workDays||[]).includes(i)?'#fff':'var(--gray-500)'};cursor:pointer" onclick="toggleWorkspaceDay('${item.id}',${i})">${d}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  return pkgSection('☕ Workspace / Cafe', 'workspace', content);
}

function renderPkgTransport() {
  const pkg = State.package;
  const content = `
    <p style="font-size:0.8rem;color:var(--gray-400);margin-bottom:1rem">Durasi otomatis mengikuti lama menginap (${bookingState.checkIn ? pkg.nights : '?'} hari).</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem">
      ${TRANSPORT_OPTIONS.map(t => {
        const sel = pkg.transport?.id === t.id;
        return `
          <div style="padding:1rem;border-radius:12px;border:2px solid ${sel?'var(--green)':'var(--gray-200)'};background:${sel?'rgba(26,74,58,0.04)':'#fff'};cursor:pointer;text-align:center;transition:all 0.2s" onclick="selectTransport('${t.id}')">
            <div style="font-size:2rem;margin-bottom:4px">${t.icon}</div>
            <div style="font-weight:600;font-size:0.875rem">${t.name}</div>
            <div style="font-weight:700;color:var(--green);font-size:0.875rem">${t.price>0?formatRupiah(t.price)+'/hari':'Bayar per trip'}</div>
            ${t.price>0?`<div style="font-size:0.75rem;color:var(--gray-400)">Total: ${bookingState.checkIn ? formatRupiah(t.price*pkg.nights) : '?'}</div>`:''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  return pkgSection('🚗 Transportasi', 'transport', content);
}

function renderPkgActivities() {
  const pkg = State.package;
  const allAct = [...DATA.wisata, ...DATA.kuliner];
  const content = `
    <div style="display:flex;flex-direction:column;gap:0.625rem">
      ${allAct.map(item => {
        const sel = pkg.activities.find(a=>a.id===item.id);
        const badge = getCategoryBadge(item.category);
        return `
          <div style="display:flex;align-items:center;gap:0.875rem;padding:0.75rem;border-radius:10px;border:1px solid ${sel?'var(--green)':'var(--gray-200)'};background:${sel?'rgba(26,74,58,0.04)':'#fff'};cursor:pointer" onclick="toggleActivity('${item.id}','${item.category}')">
            <input type="checkbox" ${sel?'checked':''} style="width:16px;height:16px;accent-color:var(--green)" onclick="event.stopPropagation();toggleActivity('${item.id}','${item.category}')" />
            <img src="${item.img}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0" onerror="this.src='https://picsum.photos/seed/${item.id}a/200/200'" />
            <div style="flex:1">
              <span class="badge ${badge.cls}" style="font-size:0.65rem;padding:2px 6px">${badge.label}</span>
              <div style="font-weight:600;font-size:0.8rem;margin-top:2px">${item.name}</div>
            </div>
            <div style="text-align:right;font-weight:700;font-size:0.8rem;color:var(--green);flex-shrink:0">${item.price===0?'Gratis':formatRupiah(item.price)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  return pkgSection('🎯 Aktivitas & Wisata', 'activities', content);
}

function renderPackageSummary() {
  const pkg = State.package;
  const total = State.calcTotal();
  const progress = State.getProgress();
  const days = Array.from({length: pkg.nights}, (_,i) => i+1);

  const summaryEl = el('div', 'package-summary');
  summaryEl.innerHTML = `
    <div class="package-summary-header">
      <div style="font-size:0.75rem;opacity:0.7;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">Nama Paket</div>
      <input type="text" value="${pkg.name}" onchange="State.package.name=this.value"
        style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:8px 12px;color:#fff;font-weight:700;font-size:1rem;width:100%;outline:none" />
      <div style="margin-top:1rem">
        <div style="font-size:0.75rem;opacity:0.7;margin-bottom:6px">Kelengkapan Paket (${Math.round(progress)}%)</div>
        <div class="progress-bar" style="background:rgba(255,255,255,0.2)"><div class="progress-fill" style="width:${progress}%;background:var(--gold)"></div></div>
      </div>
    </div>

    <div class="package-breakdown">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem;text-transform:uppercase">Rincian Biaya</div>
      ${pkg.penginapan ? `<div class="breakdown-row"><span>🏨 ${pkg.penginapan.name}<br/><span style="font-size:0.75rem;color:var(--gray-400)">${bookingState.checkIn ? pkg.nights : '?'} malam × ${formatRupiah(pkg.penginapan.price)}</span></span><span style="font-weight:700">${bookingState.checkIn ? formatRupiah(pkg.penginapan.price*pkg.nights) : '-'}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>🏨 Belum pilih penginapan</span><span>-</span></div>`}
      ${pkg.workspaces.length > 0 ? `<div class="breakdown-row"><span>☕ Workspace (${pkg.workspaces.length} tempat)</span><span style="font-weight:700">${formatRupiah(pkg.workspaces.reduce((s,w)=>s+w.price*(w.days||1),0))}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>☕ Belum pilih workspace</span><span>-</span></div>`}
      ${pkg.transport ? `<div class="breakdown-row"><span>${pkg.transport.icon} ${pkg.transport.name}<br/><span style="font-size:0.75rem;color:var(--gray-400)">${bookingState.checkIn ? pkg.nights : '?'} hari × ${formatRupiah(pkg.transport.price||0)}</span></span><span style="font-weight:700">${bookingState.checkIn ? formatRupiah((pkg.transport.price||0)*pkg.nights) : '-'}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>🚗 Belum pilih transport</span><span>-</span></div>`}
      ${pkg.activities.length > 0 ? `<div class="breakdown-row"><span>🎯 Aktivitas (${pkg.activities.length} item)</span><span style="font-weight:700">${formatRupiah(pkg.activities.reduce((s,a)=>s+a.price,0))}</span></div>` : `<div class="breakdown-row" style="color:var(--gray-400)"><span>🎯 Belum pilih aktivitas</span><span>-</span></div>`}
      <div class="breakdown-row breakdown-total"><span>TOTAL ESTIMASI</span><span style="color:var(--green)">${bookingState.checkIn ? formatRupiah(total) : '?'}</span></div>
    </div>

    ${!pkg.workspace?.length ? `<div style="margin:0 1.25rem 1rem;background:rgba(245,166,35,0.1);border:1px solid rgba(245,166,35,0.3);border-radius:10px;padding:0.875rem;font-size:0.8rem"><span style="font-weight:700;color:var(--gold-dark,#d48e00)">💡 Rekomendasi:</span> Coba <strong>Segara Cafe</strong>! WiFi 100 Mbps ⭐ 4.9</div>` : ''}

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
      <button class="btn btn-primary btn-full" onclick="savePackage()">💾 Simpan Paket</button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.625rem">
        <button class="btn btn-ghost btn-sm" onclick="sharePackage()">📤 Bagikan</button>
        <button class="btn btn-secondary btn-sm" onclick="navigate('booking')">Booking →</button>
      </div>
    </div>
  `;
  return summaryEl;
}

// Package handlers
function selectPenginapan(id) {
  State.package.penginapan = DATA.penginapan.find(x=>x.id===id);
  renderApp();
}
function toggleWorkspace(id) {
  const pkg = State.package;
  const idx = pkg.workspaces.findIndex(w=>w.id===id);
  if (idx >= 0) pkg.workspaces.splice(idx,1);
  else if (pkg.workspaces.length < 3) pkg.workspaces.push({ ...DATA.workspace.find(x=>x.id===id), days:1, workDays:[] });
  renderApp();
}
function toggleWorkspaceDay(id, dayIdx) {
  const pkg = State.package;
  const ws = pkg.workspaces.find(w=>w.id===id);
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
  const idx = pkg.activities.findIndex(a=>a.id===id);
  if (idx >= 0) pkg.activities.splice(idx,1);
  else pkg.activities.push(DATA[cat].find(x=>x.id===id));
  renderApp();
}
function autoRecommend() {
  const budget = pkgState.budgetLimit;
  const pkg = State.package;
  pkg.penginapan = DATA.penginapan.find(p=>p.price*pkg.nights<=budget*0.6) || DATA.penginapan[0];
  if (!pkg.workspaces.length) pkg.workspaces = [{ ...DATA.workspace[0], days:2, workDays:[1,2] }];
  pkg.transport = TRANSPORT_OPTIONS[0];
  if (!pkg.activities.length) pkg.activities = [DATA.wisata[0], DATA.kuliner[0]];
  renderApp();
  showToast('🤖 Rekomendasi otomatis diterapkan!');
}
function savePackage() {
  State.savePackage();
  showToast('💾 Paket berhasil disimpan!');
}
function sharePackage() {
  const text = `🌟 Paket Workation Gunung Kidul\n${State.package.name}\nTotal: ${formatRupiah(State.calcTotal())}\n\nDibuat di GLOW - Gunung Kidul Location for Work`;
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast('📋 Disalin ke clipboard!'));
}
