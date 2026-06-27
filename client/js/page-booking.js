// ===== PAGE: BOOKING & ITINERARY =====

let bookingState = {
  step: 1,
  checkIn: '',
  checkOut: '',
  notes: '',
  payment: null,
  bookingCode: '',
  confirmed: false,
  itinerary: {},
};

const TIME_SLOTS = ['Pagi (06–11)', 'Siang (11–15)', 'Sore (15–18)', 'Malam (18–22)'];
const WEATHER = ['☀️ 28°C Cerah', '⛅ 26°C Berawan', '🌤️ 29°C Cerah', '☀️ 30°C Terik'];

function renderBookingPage() {
  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '');
  header.style.cssText = 'position:relative;padding:5rem 0 4rem;color:#fff;overflow:hidden;';
  header.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url('assets/images/hero-aerial.png');background-size:cover;background-position:center;z-index:0;"></div>
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(15, 118, 110, 0.85);backdrop-filter:blur(4px);z-index:1;"></div>
    <div class="container" style="position:relative;z-index:2;text-align:center;">
      <h1 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:800;margin-bottom:0.5rem">Booking & Itinerary</h1>
      <p style="opacity:0.9;font-size:1.1rem">Pesan, atur jadwal, dan bayar dalam satu platform terintegrasi</p>
    </div>
  `;
  page.appendChild(header);

  const main = el('div', 'container', '');
  main.style.paddingTop = '2.5rem';

  if (bookingState.confirmed) {
    main.appendChild(renderBookingSuccess());
  } else {
    // Stepper
    const steps = ['Pilih & Pesan','Susun Itinerary','Konfirmasi','Pembayaran'];
    const stepperEl = el('div', 'steps');
    steps.forEach((s,i) => {
      const stepEl = el('div', `step ${i+1===bookingState.step?'active':''} ${i+1<bookingState.step?'done':''}`);
      stepEl.innerHTML = `<div class="step-num">${i+1<bookingState.step?'<svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>':i+1}</div><div class="step-label">${s}</div>`;
      stepperEl.appendChild(stepEl);
    });
    main.appendChild(stepperEl);

    const content = el('div', '');
    if (bookingState.step === 1) content.appendChild(renderStep1());
    else if (bookingState.step === 2) content.appendChild(renderStep2());
    else if (bookingState.step === 3) content.appendChild(renderStep3());
    else if (bookingState.step === 4) content.appendChild(renderStep4());
    main.appendChild(content);
  }

  page.appendChild(main);
  return page;
}

function renderStep1() {
  const pkg = State.package;
  const wrap = el('div', 'card slide-up');
  wrap.style.padding = '2rem';
  wrap.innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--green-dark)"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg> Ringkasan Pemesanan</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
      <div class="form-group">
        <label class="form-label">Tanggal Check-in</label>
        <input type="date" class="form-input" value="${bookingState.checkIn}" onchange="setCheckIn(this.value)" min="${new Date().toISOString().split('T')[0]}" />
        ${bookingState.checkIn ? `<div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px">Tampilan: ${formatDateID(bookingState.checkIn)}</div>` : ''}
      </div>
      <div class="form-group">
        <label class="form-label">Tanggal Check-out</label>
        <input type="date" class="form-input" value="${bookingState.checkOut}" onchange="setCheckOut(this.value)" min="${bookingState.checkIn ? new Date(new Date(bookingState.checkIn).getTime() + 86400000).toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]}" />
        ${bookingState.checkOut ? `<div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px">Tampilan: ${formatDateID(bookingState.checkOut)}</div>` : ''}
      </div>
    </div>

    <div style="background:#FAF9F6;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:1rem">Paket yang Dipesan</div>
      ${pkg.penginapan ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div><span style="font-weight:600"><svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v2H9V7zm0 4h1v2H9v-2zm0 4h1v2H9v-2zm3-8h1v2h-1V7zm0 4h1v2h-1v-2zm0 4h1v2h-1v-2z"></path></svg> ${pkg.penginapan.name}</span><br/><span style="font-size:0.75rem;color:var(--gray-400)">${bookingState.checkIn ? pkg.nights : '?'} malam</span></div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span style="color:#16a34a;font-weight:600"><svg style="width:14px;height:14px;display:inline-block" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Tersedia</span>
            <span style="font-weight:700">${bookingState.checkIn ? formatRupiah(pkg.penginapan.price*pkg.nights) : '-'}</span>
          </div>
        </div>
      ` : '<p style="color:var(--gray-400);font-size:0.875rem">Belum ada penginapan. <a onclick="navigate(\'package\')" style="color:var(--green);cursor:pointer;font-weight:600">Pilih di Package Builder →</a></p>'}

      ${pkg.workspaces.map(w=>`
        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <span style="font-weight:600"><svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 8h-3V4H3v13a4 4 0 004 4h9a4 4 0 004-4v-1h2a2 2 0 002-2V10a2 2 0 00-2-2z"></path></svg> ${w.name}</span>
          <span style="color:#16a34a;font-weight:600"><svg style="width:14px;height:14px;display:inline-block" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Tersedia</span>
        </div>
      `).join('')}

      ${pkg.transport ? `
        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <span style="font-weight:600"><svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> ${pkg.transport.name}</span>
          <span style="font-weight:700">${bookingState.checkIn ? formatRupiah((pkg.transport.price||0)*pkg.nights) : '-'}</span>
        </div>
      ` : ''}

      ${pkg.activities.map(a=>`
        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <span style="font-weight:600"><svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> ${a.name}</span>
          <span style="font-weight:700">${a.price===0?'Gratis':formatRupiah(a.price)}</span>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;justify-content:flex-end;gap:1rem">
      <button class="btn btn-ghost" onclick="navigate('package')">← Edit Paket</button>
      <button class="btn btn-primary btn-lg" onclick="goToStep(2)">Susun Itinerary →</button>
    </div>
  `;
  return wrap;
}

function renderStep2() {
  const pkg = State.package;
  const days = Array.from({length: pkg.nights||3}, (_,i)=>i);
  const wrap = el('div', 'slide-up');

  const toggleProd = el('div', 'flex items-center justify-between mb-4');
  toggleProd.innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:800;color:var(--green-dark)"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Susun Itinerary</h2>
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.875rem;font-weight:600">
      <input type="checkbox" id="prod-mode" style="accent-color:var(--green);width:16px;height:16px" />
      Mode Produktivitas
    </label>
  `;
  wrap.appendChild(toggleProd);

  const grid = el('div', '');
  grid.style.cssText = 'display:flex;flex-direction:column;gap:1.5rem';

  days.forEach(d => {
    const dayCard = el('div', 'card');
    dayCard.style.overflow = 'visible';
    const checkinDate = bookingState.checkIn ? new Date(bookingState.checkIn) : new Date();
    checkinDate.setDate(checkinDate.getDate() + d);
    const dateStr = checkinDate.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' });

    dayCard.innerHTML = `
      <div style="background:var(--green);padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:800;color:#fff">Hari ${d+1}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.75)">${dateStr}</div>
        </div>
        <span style="font-size:0.875rem;color:rgba(255,255,255,0.8)">${WEATHER[d%WEATHER.length]}</span>
      </div>
      <div style="padding:1.25rem">
        ${TIME_SLOTS.map((slot,si) => {
          const act = bookingState.itinerary[`${d}_${si}`];
          return `
            <div style="display:flex;gap:1rem;margin-bottom:0.875rem;align-items:flex-start">
              <div style="width:80px;font-size:0.75rem;font-weight:600;color:var(--gray-400);padding-top:8px;flex-shrink:0">${slot}</div>
              <div style="flex:1;border:2px dashed ${act?'var(--green)':'var(--gray-200)'};border-radius:10px;padding:0.75rem;cursor:pointer;background:${act?'rgba(26,74,58,0.04)':'#fff'};min-height:50px;transition:all 0.2s"
                onclick="openSlotPicker(${d},${si})">
                ${act ? `<div style="font-weight:600;font-size:0.875rem;color:var(--gray-900)">${act.name}</div><div><span style="display:inline-block;background:rgba(15,118,110,0.1);color:var(--green-dark);padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:700;margin-top:4px;text-transform:uppercase;">${act.category}</span></div>`
                  : `<div style="color:var(--gray-400);font-size:0.8rem;text-align:center;padding-top:4px"><svg style="width:14px;height:14px;display:inline-block;vertical-align:text-bottom;margin-right:4px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> Klik untuk tambah kegiatan</div>`}
              </div>
              ${act ? `<button style="padding:4px 8px;border:none;background:var(--gray-100);border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="clearSlot(${d},${si})">✕</button>` : ''}
            </div>
          `;
        }).join('')}
        <div style="background:#FAF9F6;border:1px solid #fde68a;border-radius:8px;padding:0.75rem;font-size:0.8rem;margin-top:0.5rem">
          <svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;color:#d97706" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg> <strong style="color:#b45309">Tip:</strong> ${d===0?'Sunrise terbaik pagi hari → Bukit Panguk Kediwung':d===1?'Hari produktif: coba Kopi Kidul Workspace untuk deep work':'Hari terakhir? Santai di Pantai Indrayanti!'}
        </div>
      </div>
    `;
    grid.appendChild(dayCard);
  });

  wrap.appendChild(grid);

  const nav = el('div', 'flex justify-between mt-4');
  nav.innerHTML = `
    <button class="btn btn-ghost" onclick="goToStep(1)">← Kembali</button>
    <div style="display:flex;gap:1rem">
      <button class="btn btn-ghost" onclick="exportItinerary()"><svg style="width:18px;height:18px;display:inline-block;vertical-align:bottom;margin-right:4px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Export Teks</button>
      <button class="btn btn-primary btn-lg" onclick="goToStep(3)">Konfirmasi →</button>
    </div>
  `;
  wrap.appendChild(nav);
  return wrap;
}

function renderStep3() {
  const pkg = State.package;
  const wrap = el('div', 'card slide-up');
  wrap.style.padding = '2rem';
  wrap.innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--green-dark)"><svg style="width:24px;height:24px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Konfirmasi Pemesanan</h2>
    <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem">
      ${pkg.penginapan ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#FAF9F6;border:1px solid #d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Penginapan:</strong> ${pkg.penginapan.name}, ${pkg.nights} malam</span></div>` : ''}
      ${pkg.workspaces.length ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#FAF9F6;border:1px solid #d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Workspace:</strong> ${pkg.workspaces.map(w=>w.name).join(', ')}</span></div>` : ''}
      ${pkg.transport ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#FAF9F6;border:1px solid #d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Transport:</strong> ${pkg.transport.name} ${pkg.nights} hari</span></div>` : ''}
      ${pkg.activities.length ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#FAF9F6;border:1px solid #d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Aktivitas:</strong> ${pkg.activities.length} destinasi terjadwal</span></div>` : ''}
    </div>
    <div style="background:#FAF9F6;border:1px solid #bfdbfe;border-radius:10px;padding:1rem;margin-bottom:1.5rem;font-size:0.875rem">
      <svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;color:#3b82f6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> <strong style="color:#1d4ed8">Pengingat otomatis:</strong> Kami akan kirim reminder H-1 sebelum check-in ke email & WhatsApp Anda.
    </div>
    <div class="form-group">
      <label class="form-label">Catatan / Request Khusus</label>
      <textarea class="form-input form-textarea" placeholder="Contoh: kamar non-smoking, early check-in, dll..." onchange="bookingState.notes=this.value">${bookingState.notes}</textarea>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:1rem">
      <button class="btn btn-ghost" onclick="goToStep(2)">← Kembali</button>
      <button class="btn btn-primary btn-lg" onclick="goToStep(4)">Lanjut Pembayaran →</button>
    </div>
  `;
  return wrap;
}

function renderStep4() {
  const total = State.calcTotal();
  const wrap = el('div', 'card slide-up');
  wrap.style.padding = '2rem';
  wrap.innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--green-dark)"><svg style="width:24px;height:24px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> Pembayaran</h2>
    <div style="background:#FAF9F6;border-radius:12px;padding:1.25rem;margin-bottom:1.5rem">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem">TOTAL PEMBAYARAN</div>
      <div style="font-size:2rem;font-weight:900;color:var(--green)">${formatRupiah(total)}</div>
    </div>
    <div style="margin-bottom:1.5rem">
      <div class="form-label" style="margin-bottom:0.75rem">Metode Pembayaran</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem">
        ${[['bank','Transfer Bank'],['gopay','GoPay'],['ovo','OVO'],['qris','QRIS']].map(([id,label])=>`
          <div style="padding:1rem;border-radius:10px;border:2px solid ${bookingState.payment===id?'var(--green)':'var(--gray-200)'};background:${bookingState.payment===id?'#FAF9F6':'#fff'};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:0.875rem;transition:all 0.2s" onclick="bookingState.payment='${id}';renderApp()">
            ${bookingState.payment===id?'<svg style="width:16px;height:16px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>':''}${label}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Upload Bukti Pembayaran</label>
      <input type="file" class="form-input" accept="image/*" />
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:1.5rem">
      <button class="btn btn-ghost" onclick="goToStep(3)">← Kembali</button>
      <button class="btn btn-primary btn-lg" onclick="confirmPayment()">Konfirmasi Pembayaran</button>
    </div>
  `;
  return wrap;
}

function renderBookingSuccess() {
  const wrap = el('div', 'text-center slide-up');
  wrap.style.padding = '3rem 1rem';
  wrap.innerHTML = `
    <div style="margin-bottom:1.5rem;animation:slideUp 0.5s ease">
      <svg style="width:80px;height:80px;color:var(--green);display:inline-block;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
    <h2 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:800;color:var(--green-dark);margin-bottom:0.75rem">Booking Berhasil!</h2>
    <p style="color:var(--gray-500);margin-bottom:1.5rem">Selamat! Workation impianmu sudah terkonfirmasi.</p>
    <div style="display:inline-block;background:var(--green);color:#fff;border-radius:16px;padding:1rem 2rem;margin-bottom:2rem">
      <div style="font-size:0.75rem;opacity:0.7;margin-bottom:4px">KODE BOOKING</div>
      <div style="font-family:monospace;font-size:1.5rem;font-weight:800;letter-spacing:2px">${bookingState.bookingCode}</div>
    </div>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-secondary btn-lg" onclick="showItineraryView()"><svg style="width:18px;height:18px;display:inline-block;vertical-align:bottom;margin-right:6px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Lihat Itinerary Saya</button>
      <button class="btn btn-ghost btn-lg" onclick="navigate('search')">← Kembali ke Beranda</button>
    </div>
  `;

  // Confetti
  setTimeout(() => {
    for (let i = 0; i < 40; i++) {
      const c = el('div', 'confetti-piece');
      c.style.cssText = `left:${Math.random()*100}%;background:${['#16a34a','#1a4a3a','#FAF9F6','#d1fae5'][Math.floor(Math.random()*4)]};animation-delay:${Math.random()*2}s;animation-duration:${2+Math.random()*2}s;border-radius:${Math.random()>0.5?'50%':'2px'}`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5000);
    }
  }, 100);

  return wrap;
}

function goToStep(n) { bookingState.step = n; renderApp(); }

function formatDateID(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function setCheckIn(val) {
  bookingState.checkIn = val;
  if (!bookingState.checkOut || bookingState.checkOut <= val) {
    const d = new Date(val);
    d.setDate(d.getDate() + 1);
    bookingState.checkOut = d.toISOString().split('T')[0];
  }
  updateNights();
  renderApp();
}

function setCheckOut(val) {
  if (val <= bookingState.checkIn) {
    showToast('⚠️ Tanggal check-out harus setelah check-in!');
    const d = new Date(bookingState.checkIn);
    d.setDate(d.getDate() + 1);
    bookingState.checkOut = d.toISOString().split('T')[0];
  } else {
    bookingState.checkOut = val;
  }
  updateNights();
  renderApp();
}

function updateNights() {
  if (bookingState.checkIn && bookingState.checkOut) {
    const inDate = new Date(bookingState.checkIn);
    const outDate = new Date(bookingState.checkOut);
    const diffDays = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    State.package.nights = diffDays > 0 ? diffDays : 1;
  }
}

function openSlotPicker(day, slot) {
  const acts = [...DATA.wisata, ...DATA.kuliner, ...DATA.workspace];
  const content = `
    <div class="modal-header">
      <h3 style="font-weight:700">Pilih Kegiatan — ${TIME_SLOTS[slot]}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;flex-direction:column;gap:0.625rem">
        ${acts.map(a => `
          <div style="display:flex;align-items:center;gap:0.875rem;padding:0.75rem;border-radius:10px;border:1px solid var(--gray-200);cursor:pointer" onclick="setSlot(${day},${slot},'${a.id}','${a.category}');closeModal()">
            <img src="${a.img}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0" onerror="this.src='https://picsum.photos/seed/${a.id}p/200/200'" />
            <div style="flex:1"><div style="font-weight:600;font-size:0.875rem">${a.name}</div><div style="font-size:0.75rem;color:var(--gray-400)">${a.category}</div></div>
            <button class="btn btn-primary btn-sm">Pilih</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  showModal(content);
}

function setSlot(day, slot, id, cat) {
  const item = DATA[cat].find(x=>x.id===id);
  bookingState.itinerary[`${day}_${slot}`] = item;
  renderApp();
}

function clearSlot(day, slot) {
  delete bookingState.itinerary[`${day}_${slot}`];
  renderApp();
}

function confirmPayment() {
  if (!bookingState.payment) { showToast('Pilih metode pembayaran dahulu!'); return; }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  bookingState.bookingCode = 'GLOW-2025-' + Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  bookingState.confirmed = true;
  renderApp();
}

function exportItinerary() {
  const pkg = State.package;
  let text = `ITINERARY WORKATION GUNUNG KIDUL\n${pkg.name}\n${'='.repeat(40)}\n\n`;
  for (let d = 0; d < pkg.nights; d++) {
    text += `HARI ${d+1}\n`;
    TIME_SLOTS.forEach((slot,si) => {
      const act = bookingState.itinerary[`${d}_${si}`];
      text += `  ${slot}: ${act ? act.name : '-'}\n`;
    });
    text += '\n';
  }
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast('Itinerary disalin!'));
}

function showItineraryView() {
  navigate('productivity');
}
