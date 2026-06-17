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
  header.style.cssText = 'background:linear-gradient(135deg,var(--green-dark),var(--green));padding:3rem 0 2rem;color:#fff';
  header.innerHTML = `
    <div class="container">
      <h1 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:800;margin-bottom:0.5rem">Booking & Itinerary</h1>
      <p style="opacity:0.8">Pesan, atur jadwal, dan bayar dalam satu platform</p>
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
      stepEl.innerHTML = `<div class="step-num">${i+1<bookingState.step?'✓':i+1}</div><div class="step-label">${s}</div>`;
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
    <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--green-dark)">📋 Ringkasan Pemesanan</h2>
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

    <div style="background:var(--gray-50);border-radius:12px;padding:1.5rem;margin-bottom:1.5rem">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);text-transform:uppercase;margin-bottom:1rem">Paket yang Dipesan</div>
      ${pkg.penginapan ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem">
          <div><span style="font-weight:600">🏨 ${pkg.penginapan.name}</span><br/><span style="font-size:0.75rem;color:var(--gray-400)">${bookingState.checkIn ? pkg.nights : '?'} malam</span></div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span style="color:#16a34a;font-weight:600">✓ Tersedia</span>
            <span style="font-weight:700">${bookingState.checkIn ? formatRupiah(pkg.penginapan.price*pkg.nights) : '-'}</span>
          </div>
        </div>
      ` : '<p style="color:var(--gray-400);font-size:0.875rem">Belum ada penginapan. <a onclick="navigate(\'package\')" style="color:var(--green);cursor:pointer;font-weight:600">Pilih di Package Builder →</a></p>'}

      ${pkg.workspaces.map(w=>`
        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem">
          <span style="font-weight:600">☕ ${w.name}</span>
          <span style="color:#16a34a;font-weight:600">✓ Tersedia</span>
        </div>
      `).join('')}

      ${pkg.transport ? `
        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem">
          <span style="font-weight:600">${pkg.transport.icon} ${pkg.transport.name}</span>
          <span style="font-weight:700">${bookingState.checkIn ? formatRupiah((pkg.transport.price||0)*pkg.nights) : '-'}</span>
        </div>
      ` : ''}

      ${pkg.activities.map(a=>`
        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem">
          <span style="font-weight:600">🎯 ${a.name}</span>
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
    <h2 style="font-size:1.25rem;font-weight:800;color:var(--green-dark)">🗓️ Susun Itinerary</h2>
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
                ${act ? `<div style="font-weight:600;font-size:0.875rem">${act.name}</div><div style="font-size:0.75rem;color:var(--gray-400)">${act.category==='wisata'?'🏖️ Wisata':act.category==='kuliner'?'🍽️ Kuliner':'📍'}</div>`
                  : `<div style="color:var(--gray-300);font-size:0.8rem;text-align:center;padding-top:4px">+ Klik untuk tambah kegiatan</div>`}
              </div>
              ${act ? `<button style="padding:4px 8px;border:none;background:var(--gray-100);border-radius:6px;cursor:pointer;font-size:0.75rem" onclick="clearSlot(${d},${si})">✕</button>` : ''}
            </div>
          `;
        }).join('')}
        <div style="background:#fef3c7;border-radius:8px;padding:0.75rem;font-size:0.8rem;margin-top:0.5rem">
          💡 <strong>Tip:</strong> ${d===0?'Sunrise terbaik pagi hari → Bukit Panguk Kediwung':d===1?'Hari produktif: coba Kopi Kidul Workspace untuk deep work':'Hari terakhir? Santai di Pantai Indrayanti!'}
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
      <button class="btn btn-ghost" onclick="exportItinerary()">📋 Export Teks</button>
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
    <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--green-dark)">✅ Konfirmasi Pemesanan</h2>
    <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem">
      ${pkg.penginapan ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Penginapan:</strong> ${pkg.penginapan.name}, ${pkg.nights} malam</span></div>` : ''}
      ${pkg.workspaces.length ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Workspace:</strong> ${pkg.workspaces.map(w=>w.name).join(', ')}</span></div>` : ''}
      ${pkg.transport ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Transport:</strong> ${pkg.transport.name} ${pkg.nights} hari</span></div>` : ''}
      ${pkg.activities.length ? `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.875rem;background:#d1fae5;border-radius:10px"><span style="color:#059669;font-size:1.25rem">✓</span><span><strong>Aktivitas:</strong> ${pkg.activities.length} destinasi terjadwal</span></div>` : ''}
    </div>
    <div style="background:#eff6ff;border-radius:10px;padding:1rem;margin-bottom:1.5rem;font-size:0.875rem">
      🔔 <strong>Pengingat otomatis:</strong> Kami akan kirim reminder H-1 sebelum check-in ke email & WhatsApp Anda.
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
    <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--green-dark)">💳 Pembayaran</h2>
    <div style="background:var(--gray-50);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem">
      <div style="font-size:0.75rem;font-weight:600;color:var(--gray-500);margin-bottom:0.75rem">TOTAL PEMBAYARAN</div>
      <div style="font-size:2rem;font-weight:900;color:var(--green)">${formatRupiah(total)}</div>
    </div>
    <div style="margin-bottom:1.5rem">
      <div class="form-label" style="margin-bottom:0.75rem">Metode Pembayaran</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem">
        ${[['bank','🏦 Transfer Bank'],['gopay','💚 GoPay'],['ovo','💜 OVO'],['qris','📱 QRIS']].map(([id,label])=>`
          <div style="padding:1rem;border-radius:10px;border:2px solid ${bookingState.payment===id?'var(--green)':'var(--gray-200)'};background:${bookingState.payment===id?'rgba(26,74,58,0.04)':'#fff'};cursor:pointer;text-align:center;font-weight:600;font-size:0.875rem;transition:all 0.2s" onclick="bookingState.payment='${id}';renderApp()">
            ${label}
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
      <button class="btn btn-primary btn-lg" onclick="confirmPayment()">✅ Konfirmasi Pembayaran</button>
    </div>
  `;
  return wrap;
}

function renderBookingSuccess() {
  const wrap = el('div', 'text-center slide-up');
  wrap.style.padding = '3rem 1rem';
  wrap.innerHTML = `
    <div style="font-size:5rem;margin-bottom:1rem;animation:slideUp 0.5s ease">🎉</div>
    <h2 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:800;color:var(--green-dark);margin-bottom:0.75rem">Booking Berhasil!</h2>
    <p style="color:var(--gray-500);margin-bottom:1.5rem">Selamat! Workation impianmu sudah terkonfirmasi.</p>
    <div style="display:inline-block;background:var(--green);color:#fff;border-radius:16px;padding:1rem 2rem;margin-bottom:2rem">
      <div style="font-size:0.75rem;opacity:0.7;margin-bottom:4px">KODE BOOKING</div>
      <div style="font-family:monospace;font-size:1.5rem;font-weight:800;letter-spacing:2px">${bookingState.bookingCode}</div>
    </div>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-secondary btn-lg" onclick="showItineraryView()">📅 Lihat Itinerary Saya</button>
      <button class="btn btn-ghost btn-lg" onclick="navigate('search')">← Kembali ke Beranda</button>
    </div>
  `;

  // Confetti
  setTimeout(() => {
    for (let i = 0; i < 40; i++) {
      const c = el('div', 'confetti-piece');
      c.style.cssText = `left:${Math.random()*100}%;background:${['#F5A623','#1a4a3a','#fff','#f87171','#60a5fa'][Math.floor(Math.random()*5)]};animation-delay:${Math.random()*2}s;animation-duration:${2+Math.random()*2}s;border-radius:${Math.random()>0.5?'50%':'2px'}`;
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
  if (!bookingState.payment) { showToast('⚠️ Pilih metode pembayaran dahulu!'); return; }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  bookingState.bookingCode = 'GLOW-2025-' + Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  bookingState.confirmed = true;
  renderApp();
}

function exportItinerary() {
  const pkg = State.package;
  let text = `🌟 ITINERARY WORKATION GUNUNG KIDUL\n${pkg.name}\n${'='.repeat(40)}\n\n`;
  for (let d = 0; d < pkg.nights; d++) {
    text += `📅 HARI ${d+1}\n`;
    TIME_SLOTS.forEach((slot,si) => {
      const act = bookingState.itinerary[`${d}_${si}`];
      text += `  ${slot}: ${act ? act.name : '-'}\n`;
    });
    text += '\n';
  }
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast('📋 Itinerary disalin!'));
}

function showItineraryView() {
  navigate('productivity');
}
