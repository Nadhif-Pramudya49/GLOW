// ===== PAGE: BOOKING & ITINERARY =====

const defaultBookingState = {
  step: 1,
  checkIn: '',
  checkOut: '',
  notes: '',
  payment: null,
  bookingCode: '',
  confirmed: false,
  itinerary: {},
  isProdMode: false,
  paymentCountdown: 15, // 15 seconds for testing

  // Form Data Diri
  name: '',
  email: '',
  phone: '',
  isGuestSame: true,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  agreeTnc: false,
  modalOpen: false,
  modalTitle: '',
  modalContent: '',
  errors: {}, // Store field-specific validation errors
};

let rawBookingState;
try {
  rawBookingState = JSON.parse(localStorage.getItem('glow_bookingState')) || defaultBookingState;
  // Fallback to ensure new properties exist if old state was loaded
  rawBookingState = { ...defaultBookingState, ...rawBookingState };
} catch(e) {
  rawBookingState = defaultBookingState;
}

// Reset errors on page load so they don't persist across sessions
rawBookingState.errors = {};

// Force 15 seconds for testing purposes so it doesn't use old cached value
rawBookingState.paymentCountdown = 15;

// Auto-fill from State.user if available
try {
  if (typeof State !== 'undefined' && State.user) {
    if (!rawBookingState.name) rawBookingState.name = State.user.fullName || '';
    if (!rawBookingState.email) rawBookingState.email = State.user.email || '';
    if (!rawBookingState.phone && State.user.userProfile) rawBookingState.phone = State.user.userProfile.phone || '';
  }
} catch(e) {}

let bookingState = new Proxy(rawBookingState, {
  set: function(target, property, value) {
    target[property] = value;
    localStorage.setItem('glow_bookingState', JSON.stringify(target));
    return true;
  }
});

const TIME_SLOTS = ['Pagi (06–11)', 'Siang (11–15)', 'Sore (15–18)', 'Malam (18–22)'];
const WEATHER = ['☀️ 28°C Cerah', '⛅ 26°C Berawan', '🌤️ 29°C Cerah', '☀️ 30°C Terik'];

window.copyToClipboard = function(text, btnElement) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnElement.innerText;
      btnElement.innerText = 'Tersalin!';
      btnElement.style.backgroundColor = 'var(--green)';
      btnElement.style.color = '#fff';
      setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.style.backgroundColor = 'transparent';
        btnElement.style.color = 'var(--green)';
      }, 2000);
    });
  } else {
    // Fallback if clipboard API is not available (e.g., HTTP without localhost)
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    const originalText = btnElement.innerText;
    btnElement.innerText = 'Tersalin!';
    btnElement.style.backgroundColor = 'var(--green)';
    btnElement.style.color = '#fff';
    setTimeout(() => {
      btnElement.innerText = originalText;
      btnElement.style.backgroundColor = 'transparent';
      btnElement.style.color = 'var(--green)';
    }, 2000);
  }
};

window.handleDragOver = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('drop-zone');
  if (dz) {
    dz.style.backgroundColor = '#ecfdf5';
    dz.style.borderColor = 'var(--green)';
  }
};

window.handleDragLeave = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('drop-zone');
  if (dz) {
    dz.style.backgroundColor = 'var(--gray-50)';
    dz.style.borderColor = 'var(--gray-300)';
  }
};

window.handleDrop = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('drop-zone');
  if (dz) {
    dz.style.backgroundColor = 'var(--gray-50)';
    dz.style.borderColor = 'var(--gray-300)';
  }
  
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const fileInput = document.getElementById('payment-proof');
    if (fileInput) {
      fileInput.files = e.dataTransfer.files;
      window.handleFileSelect(fileInput);
    }
  }
};

window.handleFileSelect = function(input) {
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const content = document.getElementById('drop-zone-content');
    const preview = document.getElementById('drop-zone-preview');
    const filename = document.getElementById('drop-zone-filename');
    
    if (content) content.style.display = 'none';
    if (preview) preview.style.display = 'flex';
    if (filename) filename.innerText = file.name;
    
    bookingState.paymentProof = file;
  }
};

window.requestExtraTime = function() {
  bookingState.paymentCountdown = 15;
  if (window.paymentTimerInterval) {
    clearInterval(window.paymentTimerInterval);
    window.paymentTimerInterval = null;
  }
  renderApp();
};

window.printInvoice = function() {
  const printContent = document.getElementById('invoice-container').innerHTML;
  const originalContent = document.body.innerHTML;
  
  // Style khusus print
  const printStyle = document.createElement('style');
  printStyle.id = 'print-style';
  printStyle.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      #invoice-container, #invoice-container * { visibility: visible; }
      #invoice-container { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; }
      .no-print { display: none !important; }
    }
  `;
  document.head.appendChild(printStyle);
  
  window.print();
  
  // Hapus style setelah print
  setTimeout(() => {
    const styleEl = document.getElementById('print-style');
    if (styleEl) styleEl.remove();
  }, 1000);
};

window.generateProfessionalInvoiceHTML = function(booking) {
  const pkg = booking.package || booking.packageData || {};
  const inDate = formatDateID(booking.startDate || booking.checkIn);
  const outDate = formatDateID(booking.endDate || booking.checkOut);
  const user = State.user || {};
  
  const nights = pkg.nights || 4;
  let itemsHtml = '';
  let subtotal = 0;
  
  const formatRp = (angka) => 'Rp ' + (angka || 0).toLocaleString('id-ID');
  
  if (pkg.penginapan && pkg.penginapan.length > 0) {
    pkg.penginapan.forEach(h => {
       const img = h.img || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=100';
       itemsHtml += `
         <tr>
           <td style="padding:1rem;border-bottom:1px solid #eee;display:flex;align-items:center;">
             <img src="${img}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;margin-right:1rem;border:1px solid var(--gray-200);" alt="${h.name}">
             <div>
               <div style="font-weight:700;color:var(--gray-900);margin-bottom:0.2rem;">${h.name}</div>
               <div style="font-size:0.8rem;color:var(--gray-500)">Penginapan (${nights} malam)</div>
             </div>
           </td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;">${formatRp(h.price)}/mlm</td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:var(--gray-800);">${formatRp(h.price * nights)}</td>
         </tr>
       `;
       subtotal += h.price * nights;
    });
  }
  
  if (pkg.workspaces && pkg.workspaces.length > 0) {
     pkg.workspaces.forEach(w => {
       const img = w.img || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=100';
       itemsHtml += `
         <tr>
           <td style="padding:1rem;border-bottom:1px solid #eee;display:flex;align-items:center;">
             <img src="${img}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;margin-right:1rem;border:1px solid var(--gray-200);" alt="${w.name}">
             <div>
               <div style="font-weight:700;color:var(--gray-900);margin-bottom:0.2rem;">${w.name}</div>
               <div style="font-size:0.8rem;color:var(--gray-500)">Workspace (${nights} hari)</div>
             </div>
           </td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;">${formatRp(w.price)}/hari</td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:var(--gray-800);">${formatRp(w.price * nights)}</td>
         </tr>
       `;
       subtotal += w.price * nights;
     });
  }
  
  if (pkg.transport) {
       const img = pkg.transport.img || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=100';
       itemsHtml += `
         <tr>
           <td style="padding:1rem;border-bottom:1px solid #eee;display:flex;align-items:center;">
             <img src="${img}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;margin-right:1rem;border:1px solid var(--gray-200);" alt="${pkg.transport.name}">
             <div>
               <div style="font-weight:700;color:var(--gray-900);margin-bottom:0.2rem;">${pkg.transport.name}</div>
               <div style="font-size:0.8rem;color:var(--gray-500)">Transportasi (${nights} hari)</div>
             </div>
           </td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;">${formatRp(pkg.transport.price)}/hari</td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:var(--gray-800);">${formatRp(pkg.transport.price * nights)}</td>
         </tr>
       `;
       subtotal += pkg.transport.price * nights;
  }
  
  if (pkg.activities && pkg.activities.length > 0) {
     pkg.activities.forEach(a => {
       const img = a.img || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=100';
       itemsHtml += `
         <tr>
           <td style="padding:1rem;border-bottom:1px solid #eee;display:flex;align-items:center;">
             <img src="${img}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;margin-right:1rem;border:1px solid var(--gray-200);" alt="${a.name}">
             <div>
               <div style="font-weight:700;color:var(--gray-900);margin-bottom:0.2rem;">${a.name}</div>
               <div style="font-size:0.8rem;color:var(--gray-500)">Aktivitas / Wisata</div>
             </div>
           </td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;">-</td>
           <td style="padding:1rem;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:var(--gray-800);">${formatRp(a.price)}</td>
         </tr>
       `;
       subtotal += a.price;
     });
  }
  
  if(itemsHtml === '') {
     itemsHtml = `<tr><td colspan="3" style="padding:1rem;text-align:center;color:var(--gray-500);">Tidak ada rincian item.</td></tr>`;
  }
  
  let fee = Math.floor(subtotal * 0.05); // 5% fee for simulation
  let grandTotal = subtotal + fee;
  
  if (booking.totalPrice) {
    grandTotal = booking.totalPrice;
    fee = grandTotal - subtotal;
    if (fee < 0) fee = 0;
  }
  
  return `
    <div id="invoice-container" style="background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.1);width:100%;max-width:800px;margin:0 auto;overflow:hidden;font-family:'Inter', sans-serif;color:var(--gray-800);text-align:left;">
      
      <!-- HEADER -->
      <div style="padding:1.5rem 2.5rem;border-bottom:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;background:var(--gray-50);">
        <div style="display:flex;align-items:center;gap:1rem;">
           <div style="width:48px;height:48px;background:var(--green);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 10px rgba(16,185,129,0.2);">
             <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
           </div>
           <div>
             <div style="font-family:'Playfair Display', serif;font-size:1.75rem;font-weight:900;color:var(--gray-900);line-height:1;">GLOW</div>
             <div style="font-size:0.75rem;color:var(--gray-500);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-top:0.25rem;">Workation Platform</div>
           </div>
        </div>
        <div style="text-align:right;">
           <div style="font-size:1.75rem;font-weight:800;letter-spacing:1px;color:var(--gray-300);text-transform:uppercase;line-height:1;">INVOICE</div>
           <div style="display:inline-block;background:#ecfdf5;color:#059669;padding:0.25rem 1rem;border-radius:20px;font-size:0.75rem;font-weight:700;margin-top:0.5rem;border:1px solid #a7f3d0;">LUNAS (PAID)</div>
        </div>
      </div>
      
      <!-- INFO -->
      <div style="padding:2rem 2.5rem;border-bottom:1px solid var(--gray-200);display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
         <div>
           <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:1rem;letter-spacing:1px;">Ditagihkan Kepada</div>
           <div style="font-weight:700;font-size:1.1rem;color:var(--gray-900);margin-bottom:0.25rem;">${user.fullName || 'Tamu GLOW'}</div>
           <div style="font-size:0.9rem;color:var(--gray-600);margin-bottom:0.25rem;">${user.email || '-'}</div>
           <div style="font-size:0.9rem;color:var(--gray-600);">${booking.phone || '-'}</div>
         </div>
         <div>
           <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
             <div>
               <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.5rem;letter-spacing:1px;">Nomor Invoice</div>
               <div style="font-weight:700;color:var(--gray-900);">INV-${booking.id || booking.bookingCode}</div>
             </div>
             <div>
               <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.5rem;letter-spacing:1px;">Tanggal Terbit</div>
               <div style="font-weight:700;color:var(--gray-900);">${formatDateID(new Date())}</div>
             </div>
           </div>
           
           <div style="background:var(--gray-50);padding:1rem;border-radius:8px;border:1px solid var(--gray-200);display:flex;justify-content:space-between;">
             <div>
               <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.25rem;">Check-in</div>
               <div style="font-weight:700;color:var(--gray-900);">${inDate}</div>
             </div>
             <div style="text-align:right;">
               <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;margin-bottom:0.25rem;">Check-out</div>
               <div style="font-weight:700;color:var(--gray-900);">${outDate}</div>
             </div>
           </div>
         </div>
      </div>
      
      <!-- ITEMS -->
      <div style="padding:2.5rem;padding-bottom:1rem;">
         <table style="width:100%;border-collapse:collapse;">
           <thead>
             <tr>
               <th style="text-align:left;padding:0.75rem 1rem;border-bottom:2px solid var(--gray-300);font-size:0.75rem;font-weight:800;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Layanan / Item</th>
               <th style="text-align:right;padding:0.75rem 1rem;border-bottom:2px solid var(--gray-300);font-size:0.75rem;font-weight:800;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Harga Satuan</th>
               <th style="text-align:right;padding:0.75rem 1rem;border-bottom:2px solid var(--gray-300);font-size:0.75rem;font-weight:800;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Total</th>
             </tr>
           </thead>
           <tbody>
             ${itemsHtml}
           </tbody>
         </table>
      </div>
      
      <!-- TOTALS -->
      <div style="padding:1rem 2.5rem 3rem;display:flex;justify-content:space-between;align-items:flex-end;">
         <div style="display:flex;gap:1.5rem;align-items:center;">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GLOW-${booking.id || booking.bookingCode}" style="width:140px;height:140px;border-radius:12px;border:1px solid var(--gray-200);padding:0.5rem;background:white;" alt="QR Code" />
           <div style="font-size:0.9rem;color:var(--gray-500);max-width:150px;line-height:1.5;">
             <strong>QR Code Check-in</strong><br>
             Tunjukkan kode ini kepada resepsionis saat kedatangan.
           </div>
         </div>
         <div style="width:320px;">
           <div style="display:flex;justify-content:space-between;padding:0.75rem 0;color:var(--gray-600);font-size:1rem;">
             <span>Subtotal</span>
             <span style="font-weight:600;color:var(--gray-800)">${formatRp(subtotal)}</span>
           </div>
           <div style="display:flex;justify-content:space-between;padding:0.75rem 0;color:var(--gray-600);font-size:1rem;border-bottom:1px solid var(--gray-200);">
             <span>Pajak & Layanan</span>
             <span style="font-weight:600;color:var(--gray-800)">${formatRp(fee)}</span>
           </div>
           <div style="display:flex;justify-content:space-between;padding:1.25rem 0 0;font-size:1.5rem;font-weight:800;color:var(--green-dark);">
             <span>Grand Total</span>
             <span>${formatRp(grandTotal)}</span>
           </div>
         </div>
      </div>
      
      <!-- FOOTER -->
      <div style="background:var(--green-dark);padding:2rem;text-align:center;color:rgba(255,255,255,0.9);">
        <div style="font-weight:700;font-size:1.1rem;margin-bottom:0.5rem;color:white;">Terima kasih telah memilih GLOW!</div>
        <div style="font-size:0.85rem;opacity:0.8;">Jika Anda memiliki pertanyaan terkait invoice ini, silakan hubungi <strong>hello@glow-workation.com</strong> atau <strong>+62 812 3456 7890</strong></div>
      </div>
    </div>
  `;
};

window.viewBookingInvoice = function(booking) {
  const invoiceHtml = window.generateProfessionalInvoiceHTML(booking);
  const content = `
    <button class="no-print" onclick="closeModal()" style="position:absolute;top:-40px;right:0;width:32px;height:32px;border:none;background:rgba(255,255,255,0.2);border-radius:50%;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;transition:background 0.2s;padding:0;z-index:10;" onmouseover="this.style.background='rgba(255,255,255,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
      <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    ${invoiceHtml}
    <div class="no-print" style="margin-top:1.5rem;text-align:center;">
      <button class="btn btn-primary" onclick="window.printInvoice()" style="padding:1rem 2rem;border-radius:99px;font-weight:700;box-shadow:0 10px 20px rgba(16,185,129,0.2);">
        <svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:8px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Cetak Invoice (PDF)
      </button>
    </div>
  `;
  
  const overlay = showModal(content);
  const modalDiv = overlay.querySelector('.modal');
  if (modalDiv) {
    modalDiv.style.maxWidth = '800px';
    modalDiv.style.background = 'transparent';
    modalDiv.style.boxShadow = 'none';
    modalDiv.style.padding = '0';
  }
};

window.viewOrderDescription = function(id) {
  const container = document.getElementById(`booking-details-${id}`);
  if (!container) return;

  // Toggle logic: if already open and is description, close it
  if (container.style.display === 'block' && container.dataset.viewType === 'description') {
    container.style.maxHeight = container.scrollHeight + 'px';
    container.style.overflow = 'hidden';
    container.getBoundingClientRect();
    container.style.maxHeight = '0px';
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      container.style.display = 'none';
      container.innerHTML = '';
      container.dataset.viewType = '';
    }, 350);
    return;
  }

  const b = (window._dashboardBookings || []).find(x => x.id == id);
  if (!b) {
    showToast("Pesanan tidak ditemukan");
    return;
  }

  // Backup state
  const oldPkg = State.package;
  const oldCheckIn = bookingState.checkIn;
  const oldCheckOut = bookingState.checkOut;

  // Use booking's package data temporarily
  State.package = b.package || {};
  if (!State.package.startDate) State.package.startDate = b.startDate;
  if (!State.package.endDate) State.package.endDate = b.endDate;
  
  // Calculate nights if missing (fixes "Hari NaN" issue)
  if (!State.package.nights && State.package.startDate && State.package.endDate) {
    const s = new Date(State.package.startDate);
    const e = new Date(State.package.endDate);
    State.package.nights = Math.max(1, Math.round((e-s)/(1000*60*60*24)));
  }

  bookingState.checkIn = b.startDate;
  bookingState.checkOut = b.endDate;

  // Generate UI
  const summaryDOM = renderStep1();

  // Restore original state
  State.package = oldPkg;
  bookingState.checkIn = oldCheckIn;
  bookingState.checkOut = oldCheckOut;

  // Remove action buttons (Edit Paket / Isi Data Diri)
  const buttonsWrap = summaryDOM.querySelector('div[style*="justify-content:flex-end"]');
  if (buttonsWrap) buttonsWrap.remove();

  // Remove the "Detail Perjalanan Anda" title as it's redundant inline
  const title = summaryDOM.querySelector('h2');
  if (title) title.remove();

  // Style the summary DOM to fit perfectly inside the card below
  summaryDOM.style.boxShadow = 'none';
  summaryDOM.style.border = '1px solid var(--gray-200)';
  summaryDOM.style.borderTop = 'none';
  summaryDOM.style.borderTopLeftRadius = '0';
  summaryDOM.style.borderTopRightRadius = '0';
  summaryDOM.style.background = '#FAF9F6';
  
  // Insert into container
  container.innerHTML = '';
  container.appendChild(summaryDOM);
  container.dataset.viewType = 'description';
  
  // Setup state awal animasi membuka
  container.style.display = 'block';
  container.style.overflow = 'hidden';
  container.style.maxHeight = '0px';
  container.style.opacity = '0';
  container.style.transform = 'translateY(-10px)';
  container.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Minta browser render ulang dulu (trigger reflow)
  container.getBoundingClientRect();
  
  // Tembak state akhir
  const fullHeight = container.scrollHeight;
  container.style.maxHeight = (fullHeight + 100) + 'px';
  container.style.opacity = '1';
  container.style.transform = 'translateY(0)';
  
  // Bersihkan styling inline setelah animasi selesai
  setTimeout(() => {
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';
  }, 350);
};

function renderBookingPage() {
  if (typeof State !== 'undefined' && State.user) {
    if (!bookingState.name) bookingState.name = State.user.fullName || '';
    if (!bookingState.email) bookingState.email = State.user.email || '';
    if (!bookingState.phone && State.user.userProfile) bookingState.phone = State.user.userProfile.phone || '';
  }

  // Auto-reset if user finished a booking previously but has now started a new package
  const hasItems = (State.package.penginapan && State.package.penginapan.length > 0) || 
                   (State.package.workspaces && State.package.workspaces.length > 0) || 
                   (State.package.activities && State.package.activities.length > 0);
  
  if (bookingState.confirmed && hasItems) {
    bookingState.step = 1;
    bookingState.confirmed = false;
    bookingState.payment = null;
    bookingState.paymentProof = null;
    bookingState.bookingCode = '';
    bookingState.itinerary = {};
    bookingState.agreeTnc = false;
    localStorage.setItem('glow_bookingState', JSON.stringify(bookingState));
  }

  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '');
  header.style.cssText = 'position:relative;padding:6rem 0 5rem;color:#fff;overflow:hidden;border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; margin-bottom: -1rem; box-shadow: 0 10px 30px rgba(15,118,110,0.15);';
  header.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url('assets/images/cafe-beach.png');background-size:cover;background-position:center;z-index:0;"></div>
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to right, rgba(0, 0, 0, 0.7) 0%, rgba(20, 40, 30, 0.4) 100%);z-index:1;"></div>
    
    <!-- Decorative elements -->
    <div style="position:absolute;top:-50%;left:-10%;width:60%;height:200%;background:radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);transform:rotate(30deg);z-index:1;pointer-events:none"></div>
    <div style="position:absolute;bottom:-50px;right:5%;width:300px;height:300px;background:radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%);border-radius:50%;z-index:1;pointer-events:none"></div>
    <div style="position:absolute;top:20px;right:20%;width:150px;height:150px;background:radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);border-radius:50%;z-index:1;pointer-events:none"></div>

    <div class="container" style="position:relative;z-index:2;text-align:center;">
      <span style="display:inline-block;padding:6px 16px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:100px;font-size:0.75rem;font-weight:700;letter-spacing:1px;margin-bottom:1.5rem;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,0.1);color:#fff">Secure Booking</span>
      <h1 style="font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:800;margin-bottom:1rem;letter-spacing:-0.02em;text-shadow:0 4px 12px rgba(0,0,0,0.3);">Booking & Itinerary</h1>
      <p style="opacity:0.95;font-size:1.15rem;max-width:600px;margin:0 auto;line-height:1.6;font-weight:400;text-shadow:0 2px 8px rgba(0,0,0,0.2);">Pesan, atur jadwal, dan bayar dalam satu platform terintegrasi dengan pengalaman kelas premium.</p>
    </div>
  `;
  page.appendChild(header);

  const main = el('div', 'container', '');
  main.style.paddingTop = '2.5rem';

  if (bookingState.confirmed) {
    main.appendChild(renderBookingSuccess());
  } else {
    // Stepper Premium UI
    const steps = [
      { name: 'Ringkasan', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />' },
      { name: 'Isi Data Diri', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />' },
      { name: 'Pembayaran', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />' }
    ];
    const stepperEl = el('div', '');
    stepperEl.style.cssText = 'display:flex;justify-content:space-between;align-items:center;position:relative;margin-bottom:3rem;max-width:800px;margin-left:auto;margin-right:auto;';
    
    // Progress Bar Background
    const track = el('div', '');
    track.style.cssText = 'position:absolute;top:20px;left:40px;right:40px;height:4px;background:var(--gray-200);border-radius:4px;z-index:1;';
    stepperEl.appendChild(track);
    
    // Progress Bar Fill
    const fill = el('div', '');
    const progressPercent = ((bookingState.step - 1) / (steps.length - 1)) * 100;
    fill.style.cssText = `position:absolute;top:20px;left:40px;width:calc(${progressPercent}% - 40px);height:4px;background:var(--green);border-radius:4px;z-index:2;transition:width 0.4s ease;`;
    if (bookingState.step === 1) fill.style.width = '0%'; // specific for step 1
    stepperEl.appendChild(fill);

    steps.forEach((s, i) => {
      const stepNum = i + 1;
      const isActive = stepNum === bookingState.step;
      const isDone = stepNum < bookingState.step;
      const stepEl = el('div', '');
      stepEl.style.cssText = 'position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;gap:0.5rem;width:80px;';
      
      let circleBg = 'var(--white)';
      let circleColor = 'var(--gray-300)';
      let circleBorder = '2px solid var(--gray-200)';
      if (isActive) {
        circleBg = 'var(--green)';
        circleColor = 'var(--white)';
        circleBorder = '2px solid var(--green)';
      } else if (isDone) {
        circleBg = 'var(--green)';
        circleColor = 'var(--white)';
        circleBorder = '2px solid var(--green)';
      }
      
      const shadowStyle = isActive ? 'box-shadow: 0 0 0 4px rgba(15,118,110,0.15);' : '';

      stepEl.innerHTML = `
        <div style="width:44px;height:44px;border-radius:50%;background:${circleBg};color:${circleColor};border:${circleBorder};display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;${shadowStyle}">
          ${isDone 
            ? '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${s.icon}</svg>`}
        </div>
        <div style="font-size:0.75rem;font-weight:${isActive?'700':'600'};color:${isActive||isDone?'var(--gray-900)':'var(--gray-400)'};text-align:center;transition:all 0.3s ease;">${s.name}</div>
      `;
      stepperEl.appendChild(stepEl);
    });
    main.appendChild(stepperEl);

    const content = el('div', '');
    if (bookingState.step === 1) content.appendChild(renderStep1());
    else if (bookingState.step === 2) content.appendChild(renderStep3());
    else if (bookingState.step === 3) content.appendChild(renderStep4());
    main.appendChild(content);
  }

  page.appendChild(main);
  if (bookingState.modalOpen) {
    const modal = el('div', 'fade-in');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    modal.innerHTML = `
      <div class="slide-up" style="background:#fff;width:90%;max-width:600px;max-height:80vh;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.25);display:flex;flex-direction:column;">
        <div style="padding:1.5rem 2rem;border-bottom:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;background:#FAF9F6">
          <h3 style="font-size:1.25rem;font-weight:800;color:var(--gray-900);margin:0;">${bookingState.modalTitle}</h3>
          <button onclick="bookingState.modalOpen=false;renderApp()" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:var(--gray-500);transition:color 0.2s" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--gray-500)'">✕</button>
        </div>
        <div style="padding:2rem;overflow-y:auto;color:var(--gray-700);font-size:0.95rem;">
          ${bookingState.modalContent}
        </div>
        <div style="padding:1.5rem 2rem;border-top:1px solid var(--gray-200);text-align:right;background:#FAF9F6">
          <button class="btn btn-primary" onclick="bookingState.modalOpen=false;renderApp()" style="border-radius:9999px;padding:0.75rem 2rem;font-weight:700;">Saya Mengerti</button>
        </div>
      </div>
    `;
    page.appendChild(modal);
  }

  return page;
}

function renderStep1() {
  const pkg = State.package;
  // Sync dates with Package Builder
  if (!bookingState.checkIn && State.package.startDate) bookingState.checkIn = State.package.startDate;
  if (!bookingState.checkOut && State.package.endDate) bookingState.checkOut = State.package.endDate;

  let sd = new Date(pkg.startDate || new Date());
  let ed = new Date(sd);
  ed.setDate(ed.getDate() + (pkg.nights || 1));
  let fmtStart = sd.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'});
  let fmtEnd = ed.toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'});

  const wrap = el('div', 'card slide-up');
  wrap.style.padding = '2rem';
  wrap.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900)">Detail Perjalanan Anda</h2>
    
    <div style="display:flex;align-items:center;justify-content:space-between;background:#fff;padding:1rem 2rem;border-radius:100px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);margin-bottom:2rem;overflow-x:auto;">
      <div style="display:flex;align-items:center;gap:1rem;min-width:max-content;">
        <svg style="width:24px;height:24px;color:var(--gray-400);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <div>
          <div style="font-size:0.7rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;">Tanggal Kedatangan</div>
          <div style="font-size:1.125rem;font-weight:700;color:var(--gray-900);">${fmtStart}</div>
        </div>
        <svg style="width:20px;height:20px;color:var(--gray-300);margin:0 0.5rem;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        <div>
          <div style="font-size:0.7rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;">Tanggal Kepulangan</div>
          <div style="font-size:1.125rem;font-weight:700;color:var(--gray-900);">${fmtEnd}</div>
        </div>
      </div>
      <div style="width:1px;height:40px;background:var(--gray-200);margin:0 1.5rem;display:block;"></div>
      <div style="display:flex;align-items:center;gap:0.75rem;min-width:max-content;">
        <svg style="width:24px;height:24px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        <div>
          <div style="font-size:0.7rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;">Durasi</div>
          <div style="font-size:1.125rem;font-weight:700;color:var(--green);">${pkg.nights || '?'} Malam</div>
        </div>
      </div>
    </div>

    <div style="background:#fff;border:1px solid var(--gray-200);border-radius:16px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:var(--shadow-sm)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
        <div style="font-size:1.125rem;font-weight:700;color:var(--gray-900)">Rincian Paket</div>
      </div>

      <div style="font-size:1rem;font-weight:700;color:var(--gray-700);margin-top:1.5rem;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px dashed var(--gray-200);">Hari 1: Kedatangan & Check-in</div>
      
      ${(pkg.penginapan && pkg.penginapan.length > 0) ? pkg.penginapan.map(p => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div style="display:flex;align-items:center;gap:1rem;">
            <img src="${p.img || 'https://picsum.photos/100/100'}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='https://picsum.photos/100/100'" />
            <div>
              <span style="font-weight:600;display:flex;align-items:center;"><svg style="width:16px;height:16px;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v2H9V7zm0 4h1v2H9v-2zm0 4h1v2H9v-2zm3-8h1v2h-1V7zm0 4h1v2h-1v-2zm0 4h1v2h-1v-2z"></path></svg> ${p.name}</span>
              <div style="font-size:0.75rem;color:var(--gray-400);margin-top:2px;">Check-in Penginapan</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;">
            <span style="font-weight:700">${formatRupiah(p.price * (pkg.nights || 1))}</span>
          </div>
        </div>
      `).join('') : ''}

      ${pkg.transport ? `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div style="display:flex;align-items:center;gap:1rem;">
            <img src="${pkg.transport.img || 'https://picsum.photos/100/100'}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='https://picsum.photos/100/100'" />
            <div>
              <span style="font-weight:600;display:flex;align-items:center;"><svg style="width:16px;height:16px;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg> ${pkg.transport.name}</span>
              <div style="font-size:0.75rem;color:var(--gray-400);margin-top:2px;">Penjemputan & Sewa Kendaraan</div>
            </div>
          </div>
          <span style="font-weight:700">${formatRupiah(pkg.transport.price)}</span>
        </div>
      ` : ''}

      <div style="font-size:1rem;font-weight:700;color:var(--gray-700);margin-top:1.5rem;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px dashed var(--gray-200);">Hari 2 - ${pkg.nights}: Eksplorasi & Produktivitas</div>
      
      ${(pkg.workspaces && pkg.workspaces.length > 0) ? pkg.workspaces.map(w=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div style="display:flex;align-items:center;gap:1rem;">
            <img src="${w.img || 'https://picsum.photos/100/100'}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='https://picsum.photos/100/100'" />
            <div>
              <span style="font-weight:600;display:flex;align-items:center;"><svg style="width:16px;height:16px;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 8h-3V4H3v13a4 4 0 004 4h9a4 4 0 004-4v-1h2a2 2 0 002-2V10a2 2 0 00-2-2z"></path></svg> ${w.name}</span>
              <div style="font-size:0.75rem;color:var(--gray-400);margin-top:2px;">Sesi Kerja Terjadwal</div>
            </div>
          </div>
          <span style="color:#16a34a;font-weight:600;font-size:0.75rem;display:flex;align-items:center;"><svg style="width:12px;height:12px;margin-right:2px;" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Tersedia</span>
        </div>
      `).join('') : ''}

      ${(pkg.activities && pkg.activities.length > 0) ? pkg.activities.map(a=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div style="display:flex;align-items:center;gap:1rem;">
            <img src="${a.img || 'https://picsum.photos/100/100'}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='https://picsum.photos/100/100'" />
            <div>
              <span style="font-weight:600;display:flex;align-items:center;"><svg style="width:16px;height:16px;margin-right:4px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> ${a.name}</span>
              <div style="font-size:0.75rem;color:var(--gray-400);margin-top:2px;">Aktivitas & Eksplorasi</div>
            </div>
          </div>
          <span style="font-weight:700">${a.price===0?'Gratis':formatRupiah(a.price)}</span>
        </div>
      `).join('') : ''}

      <div style="font-size:1rem;font-weight:700;color:var(--gray-700);margin-top:1.5rem;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px dashed var(--gray-200);">Hari ${pkg.nights + 1}: Check-out & Kepulangan</div>
      
      ${(pkg.penginapan && pkg.penginapan.length > 0) ? pkg.penginapan.map(p => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:#fff;border-radius:8px;margin-bottom:0.5rem;box-shadow:var(--shadow-sm);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div style="display:flex;align-items:center;gap:1rem;">
            <div style="width:48px;height:48px;border-radius:8px;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;color:#ef4444;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </div>
            <div>
              <span style="font-weight:600;display:flex;align-items:center;">Check-out ${p.name}</span>
              <div style="font-size:0.75rem;color:var(--gray-400);margin-top:2px;">Persiapan kembali pulang</div>
            </div>
          </div>
          <span style="color:#16a34a;font-weight:600;font-size:0.75rem;display:flex;align-items:center;"><svg style="width:12px;height:12px;margin-right:2px;" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Selesai</span>
        </div>
      `).join('') : ''}
    </div>

    <div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:1rem;">
      <button class="btn btn-outline" onclick="navigate('package'); setTimeout(() => { const el = document.getElementById('simpan-paket-section'); if(el) el.scrollIntoView({behavior: 'smooth', block: 'start'}); }, 100)" style="border-radius:9999px;padding:1rem 2rem;font-weight:800;display:flex;align-items:center;gap:0.75rem;transition:all 0.3s;">
        Edit Paket
      </button>
      <button class="btn btn-primary btn-lg" onclick="goToStep(2)" style="border-radius:9999px;padding:1rem 2.5rem;font-weight:800;display:flex;align-items:center;gap:0.75rem;box-shadow:0 8px 20px rgba(15,118,110,0.25);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 24px rgba(15,118,110,0.3)'" onmouseout="this.style.transform='none';this.style.boxShadow='0 8px 20px rgba(15,118,110,0.25)'">
        Isi Data Diri
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>
  `;
  return wrap;
}

function renderStep2() {
  const pkg = State.package;
  const days = Array.from({length: pkg.nights||3}, (_,i)=>i);
  const wrap = el('div', 'slide-up');
  
  const isProd = bookingState.isProdMode;
  const themeColor = isProd ? '#4338ca' : 'var(--green)'; // indigo-700 vs green
  const themeLight = isProd ? '#e0e7ff' : '#d1fae5'; // indigo-100 vs emerald-100
  const themeBg = isProd ? '#e0e7ff' : 'rgba(26,74,58,0.04)';

  const toggleProd = el('div', 'flex items-center justify-between mb-4');
  toggleProd.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;color:var(--gray-900)"><svg style="width:24px;height:24px;display:inline-block;vertical-align:bottom;margin-right:8px;color:${themeColor};" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Papan Itinerary</h2>
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.875rem;font-weight:600;background:${isProd?'#4338ca':'#FAF9F6'};color:${isProd?'#fff':'var(--gray-700)'};padding:0.5rem 1rem;border-radius:100px;transition:all 0.3s ease;border:1px solid ${isProd?'#4338ca':'var(--gray-200)'}">
      <input type="checkbox" id="prod-mode" style="accent-color:${themeColor};width:16px;height:16px;margin:0" ${isProd?'checked':''} onchange="bookingState.isProdMode=this.checked;renderApp()" />
      Mode Produktivitas ${isProd?'🚀':''}
    </label>
  `;
  wrap.appendChild(toggleProd);

  const grid = el('div', '');
  grid.style.cssText = 'display:flex;gap:1.5rem;overflow-x:auto;padding-bottom:1rem;margin-bottom:1.5rem;scroll-snap-type:x mandatory;';

  days.forEach(d => {
    const dayCard = el('div', '');
    dayCard.style.cssText = `flex:0 0 320px;background:#fff;border:1px solid var(--gray-200);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm);scroll-snap-align:start;transition:transform 0.3s, box-shadow 0.3s;`;
    
    const checkinDate = bookingState.checkIn ? new Date(bookingState.checkIn) : new Date();
    checkinDate.setDate(checkinDate.getDate() + d);
    const dateStr = checkinDate.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' });

    dayCard.innerHTML = `
      <div style="background:${themeColor};padding:1.25rem;display:flex;justify-content:space-between;align-items:center;transition:background 0.3s;">
        <div>
          <div style="font-weight:800;color:#fff;font-size:1.125rem;">Hari ${d+1}</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.8)">${dateStr}</div>
        </div>
        <div style="background:rgba(255,255,255,0.2);padding:4px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;color:#fff">${WEATHER[d%WEATHER.length]}</div>
      </div>
      <div style="padding:1.25rem;background:#FAF9F6;min-height:300px;">
        ${TIME_SLOTS.map((slot,si) => {
          const act = bookingState.itinerary[`${d}_${si}`];
          let emptyStateHTML = `<div style="color:var(--gray-400);font-size:0.75rem;text-align:center;padding-top:6px;font-weight:600"><svg style="width:14px;height:14px;display:inline-block;vertical-align:text-bottom;margin-right:2px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> Tambah Kegiatan</div>`;
          
          if (isProd && !act && (si === 0 || si === 1)) {
             emptyStateHTML = `<div style="color:#4338ca;font-size:0.75rem;text-align:center;padding-top:6px;font-weight:600"><svg style="width:14px;height:14px;display:inline-block;vertical-align:text-bottom;margin-right:2px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Deep Work Session Disarankan</div>`;
          }

          return `
            <div style="margin-bottom:1rem;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">${slot}</div>
              <div style="display:flex;gap:0.5rem;align-items:stretch">
                <div style="flex:1;border:2px dashed ${act?themeColor:'var(--gray-300)'};border-radius:10px;padding:0.75rem;cursor:pointer;background:${act?themeBg:'#fff'};min-height:48px;transition:all 0.2s"
                  onclick="openSlotPicker(${d},${si})" onmouseover="this.style.borderColor='${themeColor}'" onmouseout="this.style.borderColor='${act?themeColor:'var(--gray-300)'}'">
                  ${act ? `<div style="font-weight:700;font-size:0.875rem;color:var(--gray-900);line-height:1.2;margin-bottom:4px">${act.name}</div><span style="display:inline-block;background:${themeLight};color:${themeColor};padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:700;text-transform:uppercase;">${act.category}</span>`
                    : emptyStateHTML}
                </div>
                ${act ? `<button style="width:32px;border:none;background:#fee2e2;color:#ef4444;border-radius:10px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:background 0.2s" onclick="clearSlot(${d},${si})" onmouseover="this.style.background='#f87171';this.style.color='#fff'" onmouseout="this.style.background='#fee2e2';this.style.color='#ef4444'" title="Hapus Kegiatan">✕</button>` : ''}
              </div>
            </div>
          `;
        }).join('')}
        <div style="background:${isProd?'#e0e7ff':'#fef3c7'};border:1px solid ${isProd?'#c7d2fe':'#fde68a'};border-radius:8px;padding:0.75rem;font-size:0.8rem;margin-top:1rem;color:${isProd?'#3730a3':'#92400e'}">
          <svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <strong style="font-weight:700">AI Tip:</strong> ${isProd ? (d===0?'Fokus pada setup kerja di hari pertama':d===1?'Ambil sesi deep work 4 jam tanpa gangguan':'Gunakan sore hari untuk review mingguan') : (d===0?'Sunrise terbaik pagi hari → Bukit Panguk Kediwung':d===1?'Hari produktif: coba Kopi Kidul Workspace':'Hari terakhir? Santai di Pantai Indrayanti!')}
        </div>
      </div>
    `;
    
    // Add hover effect via event listeners since inline onmouseover for transform can be tricky with existing styles
    dayCard.onmouseover = () => { dayCard.style.transform = 'translateY(-4px)'; dayCard.style.boxShadow = 'var(--shadow-md)'; };
    dayCard.onmouseout = () => { dayCard.style.transform = 'none'; dayCard.style.boxShadow = 'var(--shadow-sm)'; };

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

window.clearBookingData = function() {
  const content = `
    <!-- Tombol Silang (Close) -->
    <button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;width:32px;height:32px;border:none;background:transparent;cursor:pointer;color:var(--gray-400);display:flex;align-items:center;justify-content:center;transition:color 0.2s;padding:0;" onmouseover="this.style.color='var(--gray-700)'" onmouseout="this.style.color='var(--gray-400)'">
      <svg style="width:24px;height:24px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    
    <div style="text-align:center;padding:2rem 1rem 1rem;">
      <div style="width:56px;height:56px;background:#fee2e2;color:#b91c1c;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
        <svg style="width:28px;height:28px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </div>
      <h3 style="font-size:1.25rem;font-weight:800;color:var(--gray-900);margin-bottom:0.5rem">Bersihkan Form?</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:2rem;line-height:1.5;">Apakah Anda yakin ingin menghapus seluruh data yang telah diisi? Tindakan ini tidak dapat dibatalkan.</p>
      
      <button class="btn btn-primary" style="width:100%;border-radius:12px;padding:0.875rem 0;font-weight:700;background:#b91c1c;border-color:#b91c1c;box-shadow:0 4px 12px rgba(185, 28, 28, 0.2);color:#fff;text-align:center;display:block;" onclick="executeClearBookingData()">Hapus Data</button>
    </div>
  `;
  
  const overlay = showModal(content);
  const modalDiv = overlay.querySelector('.modal');
  if (modalDiv) {
    modalDiv.style.maxWidth = '400px';
    modalDiv.style.position = 'relative';
  }
}

window.executeClearBookingData = function() {
  bookingState.name = '';
  bookingState.email = '';
  bookingState.phone = '';
  bookingState.isGuestSame = true;
  bookingState.guestName = '';
  bookingState.guestEmail = '';
  bookingState.guestPhone = '';
  bookingState.notes = '';
  bookingState.agreeTnc = false;
  bookingState.errors = {};
  bookingState.paymentProof = null;
  
  closeModal();
  renderApp();
  
  showToast('Data form berhasil dibersihkan');
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const nameInput = document.querySelector('input[placeholder="Nama Lengkap sesuai KTP"]');
    if (nameInput) nameInput.focus();
  }, 50);
};

window.finishBookingAndNavigate = function(target) {
  // Reset the entire booking state for the next time
  bookingState.step = 1;
  bookingState.confirmed = false;
  bookingState.payment = null;
  bookingState.paymentProof = null;
  bookingState.bookingCode = '';
  bookingState.itinerary = {};
  bookingState.agreeTnc = false;
  
  localStorage.setItem('glow_bookingState', JSON.stringify(bookingState));
  
  navigate(target);
};

window.handleInput = function(field, val, el) {
  bookingState[field] = val;

  const nameRegex = /^[A-Za-z\s.\-']+$/;
  const phoneRegex = /^[0-9\+\-\s()]{9,20}$/;
  
  let errorMsg = "";
  if (!val) {
    // Jika kosong, hilangkan error. Validasi "wajib diisi" hanya saat submit.
    errorMsg = "";
  } else if (field === 'name' || field === 'guestName') {
    if (!nameRegex.test(val)) errorMsg = "Nama hanya boleh berisi huruf (tanpa angka).";
  } else if (field === 'phone' || field === 'guestPhone') {
    const phoneCharRegex = /^[0-9\+\-\s()]*$/;
    if (!phoneCharRegex.test(val)) errorMsg = "Nomor WhatsApp hanya boleh angka dan simbol (+, -).";
  }

  updateFieldErrorDOM(field, errorMsg, el);
}

window.handleBlur = function(field, val, el) {
  if (field === 'email' || field === 'guestEmail') {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let errorMsg = "";
    if (!val) {
      errorMsg = ""; // Ignore empty on blur
    } else if (!emailRegex.test(val)) {
      errorMsg = "Format alamat email tidak valid.";
    }
    
    updateFieldErrorDOM(field, errorMsg, el);
  } else if (field === 'phone' || field === 'guestPhone') {
    const phoneRegex = /^[0-9\+\-\s()]{8,20}$/;
    let errorMsg = "";
    if (!val) {
      errorMsg = "";
    } else if (!phoneRegex.test(val)) {
      errorMsg = "Nomor WhatsApp tidak valid (minimal 8 digit).";
    }
    
    updateFieldErrorDOM(field, errorMsg, el);
  }
}

function updateFieldErrorDOM(field, errorMsg, el) {
  bookingState.errors[field] = errorMsg;
  const errDiv = document.getElementById('err-' + field);
  const labelEl = el.previousElementSibling;
  
  if (errorMsg) {
    el.style.borderColor = '#ef4444';
    el.style.backgroundColor = '#fef2f2';
    if (labelEl) labelEl.style.color = '#ef4444';
    if (errDiv) {
      errDiv.innerHTML = '⚠️ ' + errorMsg;
      errDiv.style.display = 'block';
    }
  } else {
    el.style.borderColor = '';
    el.style.backgroundColor = '';
    if (labelEl) labelEl.style.color = '';
    if (errDiv) {
      errDiv.style.display = 'none';
    }
  }
}

window.validateAndGoToStep4 = function() {
  const nameRegex = /^[A-Za-z\s.\-']+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9\+\-\s()]{8,20}$/;
  
  bookingState.errors = {};
  let hasError = false;

  if (!bookingState.name) {
    bookingState.errors.name = "Nama lengkap wajib diisi.";
    hasError = true;
  } else if (!nameRegex.test(bookingState.name)) {
    bookingState.errors.name = "Nama hanya boleh berisi huruf (tanpa angka).";
    hasError = true;
  }

  if (!bookingState.email) {
    bookingState.errors.email = "Alamat email wajib diisi.";
    hasError = true;
  } else if (!emailRegex.test(bookingState.email)) {
    bookingState.errors.email = "Format alamat email tidak valid.";
    hasError = true;
  }

  if (!bookingState.phone) {
    bookingState.errors.phone = "Nomor WhatsApp wajib diisi.";
    hasError = true;
  } else if (!phoneRegex.test(bookingState.phone)) {
    bookingState.errors.phone = "Nomor WhatsApp tidak valid (minimal 8 digit).";
    hasError = true;
  }

  if (!bookingState.isGuestSame) {
    if (!bookingState.guestName) {
      bookingState.errors.guestName = "Nama tamu wajib diisi.";
      hasError = true;
    } else if (!nameRegex.test(bookingState.guestName)) {
      bookingState.errors.guestName = "Nama tamu hanya boleh berisi huruf.";
      hasError = true;
    }

    if (!bookingState.guestEmail) {
      bookingState.errors.guestEmail = "Email tamu wajib diisi.";
      hasError = true;
    } else if (!emailRegex.test(bookingState.guestEmail)) {
      bookingState.errors.guestEmail = "Format email tamu tidak valid.";
      hasError = true;
    }

    if (!bookingState.guestPhone) {
      bookingState.errors.guestPhone = "WhatsApp tamu wajib diisi.";
      hasError = true;
    } else if (!phoneRegex.test(bookingState.guestPhone)) {
      bookingState.errors.guestPhone = "Nomor WhatsApp tidak valid (minimal 8 digit).";
      hasError = true;
    }
  }

  if (hasError) {
    renderApp();
    setTimeout(() => {
      const firstErrorField = Object.keys(bookingState.errors).find(k => bookingState.errors[k]);
      if (firstErrorField) {
        const errDiv = document.getElementById('err-' + firstErrorField);
        if (errDiv && errDiv.previousElementSibling) {
          errDiv.previousElementSibling.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errDiv.previousElementSibling.focus();
        }
      }
    }, 50);
    return;
  }

  if (!bookingState.agreeTnc) {
    return;
  }
  
  // Clear error if success
  bookingState.errors = {};
  
  // Save data to profile automatically
  localStorage.setItem('glow_savedBookingProfile', JSON.stringify({
    name: bookingState.name,
    email: bookingState.email,
    phone: bookingState.phone
  }));

  goToStep(3);
}

window.openTncModal = function(e) {
  if (e) e.preventDefault();
  bookingState.modalTitle = "Syarat & Ketentuan";
  bookingState.modalContent = `<p style="margin-bottom:1rem">Selamat datang di GLOW. Dengan menggunakan layanan kami, Anda setuju untuk terikat dengan syarat dan ketentuan berikut:</p>
  <ol style="padding-left:1.5rem;line-height:1.6;margin-bottom:1rem;">
    <li><strong>Pemesanan:</strong> Semua pemesanan bergantung pada ketersediaan. Harga dapat berubah sewaktu-waktu sebelum konfirmasi pembayaran.</li>
    <li><strong>Pembayaran:</strong> Pembayaran harus diselesaikan dalam batas waktu 15 menit. Jika tidak, sistem akan otomatis membatalkan pesanan.</li>
    <li><strong>Pembatalan & Pengembalian Dana:</strong> Pembatalan yang dilakukan H-7 sebelum check-in berhak mendapatkan refund 100%. Pembatalan H-3 refund 50%. Kurang dari H-3 tidak ada refund.</li>
    <li><strong>Perilaku Tamu:</strong> Seluruh tamu wajib menjaga ketertiban, kebersihan, dan menghormati norma sosial di Gunung Kidul. Kerusakan properti akibat kelalaian akan ditanggung sepenuhnya oleh pihak tamu.</li>
    <li><strong>Force Majeure:</strong> GLOW tidak bertanggung jawab atas kegagalan pemenuhan layanan akibat bencana alam, cuaca ekstrem, atau kondisi darurat lainnya di luar kendali kami.</li>
    <li><strong>Asuransi:</strong> Kami sangat menyarankan pengguna untuk memiliki asuransi perjalanan mandiri.</li>
  </ol>
  <p>Dengan melanjutkan pemesanan ini, Anda dianggap telah membaca dan memahami sepenuhnya seluruh syarat yang berlaku di platform GLOW.</p>`;
  bookingState.modalOpen = true;
  renderApp();
}

window.openPrivacyModal = function(e) {
  if (e) e.preventDefault();
  bookingState.modalTitle = "Kebijakan Privasi";
  bookingState.modalContent = `<p style="margin-bottom:1rem">Privasi Anda sangat penting bagi GLOW. Dokumen ini menjelaskan bagaimana kami mengumpulkan dan melindungi data Anda.</p>
  <ul style="padding-left:1.5rem;line-height:1.6;margin-bottom:1rem;">
    <li><strong>Data yang Kami Kumpulkan:</strong> Kami mengumpulkan nama, alamat email, dan nomor telepon untuk memproses pesanan dan memfasilitasi komunikasi.</li>
    <li><strong>Penggunaan Data:</strong> Data Anda tidak akan pernah kami jual ke pihak ketiga. Kami hanya menggunakannya untuk operasional booking, pengiriman e-tiket, dan notifikasi reminder perjalanan Anda.</li>
    <li><strong>Keamanan Data:</strong> Kami menerapkan enkripsi standar industri (SSL) untuk semua transmisi data pembayaran dan penyimpanan database kami. Akses ke data pribadi sangat dibatasi.</li>
    <li><strong>Penggunaan Cookies:</strong> Kami menggunakan cookies ringan hanya untuk mempertahankan sesi login dan preferensi keranjang belanja Anda, bukan untuk pelacakan iklan lintas platform yang invasif.</li>
    <li><strong>Pihak Ketiga:</strong> Kami mungkin membagikan sebagian data identitas dasar kepada mitra (seperti pemilik penginapan atau vendor sewa mobil) semata-mata untuk verifikasi check-in.</li>
    <li><strong>Hak Pengguna:</strong> Anda berhak meminta penghapusan seluruh data pribadi Anda dari server kami kapan saja setelah perjalanan Anda selesai, dengan menghubungi tim support kami di privacy@glow.id.</li>
  </ul>
  <p>Kebijakan ini berlaku efektif sejak pemesanan ini dibuat dan dapat diperbarui secara berkala sesuai regulasi perlindungan data yang berlaku di Indonesia.</p>`;
  bookingState.modalOpen = true;
  renderApp();
}

function renderStep3() {
  const pkg = State.package;
  const wrap = el('div', 'slide-up');
  
  wrap.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900);text-align:center;"><svg style="width:28px;height:28px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Lengkapi Data Diri</h2>
    
    <div style="max-width:800px;margin:0 auto;">
      
      <!-- Form Data Diri -->
      <div style="background:#fff;padding:2rem;border-radius:16px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);margin-bottom:2rem;">
        <h3 style="font-weight:700;font-size:1.125rem;margin-bottom:1.5rem;border-bottom:2px solid var(--gray-100);padding-bottom:0.75rem;">Informasi Pemesan</h3>
        
        <div class="form-group">
          <label class="form-label" style="${bookingState.errors.name ? 'color:#ef4444' : ''}">Nama Lengkap (Sesuai KTP/Paspor) <span style="color:red">*</span></label>
          <input type="text" class="form-input" style="${bookingState.errors.name ? 'border-color:#ef4444;background:#fef2f2;' : ''}" placeholder="Misal: Budi Santoso" value="${bookingState.name || ''}" oninput="handleInput('name', this.value, this)" required />
          <div id="err-name" style="color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:600;display:${bookingState.errors.name ? 'block' : 'none'}">⚠️ ${bookingState.errors.name || ''}</div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:1rem;">
          <div class="form-group">
            <label class="form-label" style="${bookingState.errors.email ? 'color:#ef4444' : ''}">Alamat Email <span style="color:red">*</span></label>
            <input type="email" class="form-input" style="${bookingState.errors.email ? 'border-color:#ef4444;background:#fef2f2;' : ''}" placeholder="Misal: budi@email.com" value="${bookingState.email || ''}" oninput="handleInput('email', this.value, this)" onblur="handleBlur('email', this.value, this)" required />
            <div id="err-email" style="color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:600;display:${bookingState.errors.email ? 'block' : 'none'}">⚠️ ${bookingState.errors.email || ''}</div>
          </div>
          <div class="form-group">
            <label class="form-label" style="${bookingState.errors.phone ? 'color:#ef4444' : ''}">Nomor WhatsApp <span style="color:red">*</span></label>
            <input type="tel" class="form-input" style="${bookingState.errors.phone ? 'border-color:#ef4444;background:#fef2f2;' : ''}" placeholder="Misal: 08123456789" value="${bookingState.phone || ''}" oninput="handleInput('phone', this.value, this)" onblur="handleBlur('phone', this.value, this)" required />
            <div id="err-phone" style="color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:600;display:${bookingState.errors.phone ? 'block' : 'none'}">⚠️ ${bookingState.errors.phone || ''}</div>
          </div>
        </div>

        <div class="form-group" style="margin-top:1rem;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600;color:var(--gray-700)">
            <input type="checkbox" style="accent-color:var(--green);width:18px;height:18px;" ${bookingState.isGuestSame ? 'checked' : ''} onchange="bookingState.isGuestSame=this.checked; renderApp()" />
            Saya adalah tamu yang akan menginap
          </label>
        </div>

        ${!bookingState.isGuestSame ? `
        <div class="form-group slide-up" style="margin-top:1.5rem;background:#f8fafc;padding:1.5rem;border-radius:12px;border:1px solid #e2e8f0;">
          <h4 style="font-weight:800;margin-bottom:1rem;color:var(--gray-800);font-size:1.1rem">Detail Tamu Utama</h4>
          <div class="form-group">
            <label class="form-label" style="${bookingState.errors.guestName ? 'color:#ef4444' : ''}">Nama Lengkap Tamu <span style="color:red">*</span></label>
            <input type="text" class="form-input" style="${bookingState.errors.guestName ? 'border-color:#ef4444;background:#fef2f2;' : ''}" placeholder="Masukkan nama tamu utama yang akan menginap" value="${bookingState.guestName || ''}" oninput="handleInput('guestName', this.value, this)" required />
            <div id="err-guestName" style="color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:600;display:${bookingState.errors.guestName ? 'block' : 'none'}">⚠️ ${bookingState.errors.guestName || ''}</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:1rem;">
            <div class="form-group">
              <label class="form-label" style="${bookingState.errors.guestEmail ? 'color:#ef4444' : ''}">Email Tamu <span style="color:red">*</span></label>
              <input type="email" class="form-input" style="${bookingState.errors.guestEmail ? 'border-color:#ef4444;background:#fef2f2;' : ''}" placeholder="Email tamu" value="${bookingState.guestEmail || ''}" oninput="handleInput('guestEmail', this.value, this)" onblur="handleBlur('guestEmail', this.value, this)" required />
              <div id="err-guestEmail" style="color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:600;display:${bookingState.errors.guestEmail ? 'block' : 'none'}">⚠️ ${bookingState.errors.guestEmail || ''}</div>
            </div>
            <div class="form-group">
              <label class="form-label" style="${bookingState.errors.guestPhone ? 'color:#ef4444' : ''}">WhatsApp Tamu <span style="color:red">*</span></label>
              <input type="tel" class="form-input" style="${bookingState.errors.guestPhone ? 'border-color:#ef4444;background:#fef2f2;' : ''}" placeholder="Nomor WA tamu" value="${bookingState.guestPhone || ''}" oninput="handleInput('guestPhone', this.value, this)" onblur="handleBlur('guestPhone', this.value, this)" required />
              <div id="err-guestPhone" style="color:#ef4444;font-size:0.8rem;margin-top:4px;font-weight:600;display:${bookingState.errors.guestPhone ? 'block' : 'none'}">⚠️ ${bookingState.errors.guestPhone || ''}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="form-group" style="margin-top:1.5rem;">
          <label class="form-label">Catatan / Request Khusus (Opsional)</label>
          <textarea class="form-input form-textarea" placeholder="Contoh: kamar non-smoking, early check-in, dll..." oninput="bookingState.notes=this.value">${bookingState.notes}</textarea>
        </div>
      </div>
      
      <!-- Persetujuan -->
      <div style="background:#fff;padding:1.5rem;border-radius:16px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
        <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;line-height:1.5;">
          <input type="checkbox" id="tnc-checkbox" style="accent-color:var(--green);width:24px;height:24px;flex-shrink:0;margin-top:2px;" ${bookingState.agreeTnc ? 'checked' : ''} onchange="bookingState.agreeTnc=this.checked; renderApp()" />
          <span style="font-size:0.95rem;color:var(--gray-700);">
            Saya menyetujui <a href="#" onclick="openTncModal(event)" style="color:var(--green-dark);font-weight:700;text-decoration:underline;">Syarat & Ketentuan</a> serta <a href="#" onclick="openPrivacyModal(event)" style="color:var(--green-dark);font-weight:700;text-decoration:underline;">Kebijakan Privasi</a> yang berlaku di GLOW. Saya mengonfirmasi bahwa data yang saya masukkan adalah benar.
          </span>
        </label>
      </div>


      
      <!-- Navigasi -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--gray-200);">
        <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:flex-start;">
          <button class="btn btn-outline" onclick="goToStep(1)" style="border-radius:9999px;padding:0.75rem 1.5rem;font-weight:700;display:flex;align-items:center;gap:0.5rem">
            <svg style="width:20px;height:20px" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
            Kembali
          </button>
          <a href="#" onclick="clearBookingData()" style="font-size:0.8rem;color:var(--gray-500);text-decoration:underline;margin-left:0.5rem;">Bersihkan Data</a>
        </div>
        <button id="btn-bayar" class="btn btn-primary btn-lg" onclick="validateAndGoToStep4()" style="border-radius:9999px;padding:1rem 2.5rem;font-weight:800;display:flex;align-items:center;gap:0.75rem;box-shadow:0 8px 20px rgba(15,118,110,0.25);transition:all 0.3s;opacity:${bookingState.agreeTnc ? '1' : '0.5'};cursor:${bookingState.agreeTnc ? 'pointer' : 'not-allowed'}">
          Lanjut Pembayaran
          <svg style="width:20px;height:20px" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </button>
      </div>

    </div>
  `;
  return wrap;
}

function renderStep4() {
  const total = State.calcTotal();
  const wrap = el('div', 'slide-up');
  
  // Timer Logic
  if (!window.paymentTimerInterval) {
    window.paymentTimerInterval = setInterval(() => {
      if (bookingState.paymentCountdown > 0) {
        bookingState.paymentCountdown--;
        const elTimer = document.getElementById('payment-timer');
        if (elTimer) {
          const m = Math.floor(bookingState.paymentCountdown / 60);
          const s = bookingState.paymentCountdown % 60;
          elTimer.innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
      } else {
        clearInterval(window.paymentTimerInterval);
        window.paymentTimerInterval = null;
        const elContainer = document.getElementById('payment-timer-container');
        if (elContainer) {
          elContainer.innerHTML = `
            <svg style="width:20px;height:20px;color:#be123c;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span style="font-weight:700;font-size:1rem;color:#be123c;">Waktu Habis!</span>
            <button onclick="requestExtraTime()" style="background:#be123c;color:#fff;border:none;padding:8px 20px;border-radius:99px;font-size:0.9rem;cursor:pointer;margin-left:16px;font-weight:700;box-shadow:0 4px 10px rgba(190,18,60,0.25);transition:all 0.2s;">Minta Waktu Tambahan</button>
          `;
        }
      }
    }, 1000);
  }

  const m = Math.floor(bookingState.paymentCountdown / 60);
  const s = bookingState.paymentCountdown % 60;
  const timeStr = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

  wrap.innerHTML = `
    <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900);text-align:center;">Pembayaran</h2>
    
    <div id="payment-timer-container" style="background:#fff4f2;border:1px solid #fecdd3;border-radius:12px;padding:1rem;margin-bottom:2rem;text-align:center;color:#be123c;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.3s ease;">
      ${bookingState.paymentCountdown > 0 ? `
        <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span style="font-weight:600;font-size:0.9rem;">Selesaikan pembayaran dalam <span id="payment-timer" style="font-weight:800;font-size:1.1rem;margin-left:4px">${timeStr}</span></span>
      ` : `
        <svg style="width:20px;height:20px;color:#be123c;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span style="font-weight:700;font-size:1rem;color:#be123c;">Waktu Habis!</span>
        <button onclick="requestExtraTime()" style="background:#be123c;color:#fff;border:none;padding:8px 20px;border-radius:99px;font-size:0.9rem;cursor:pointer;margin-left:16px;font-weight:700;box-shadow:0 4px 10px rgba(190,18,60,0.25);transition:all 0.2s;">Minta Waktu Tambahan</button>
      `}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
      <div>
        <div class="form-label" style="margin-bottom:1rem;font-size:1rem;">Pilih Metode Pembayaran</div>
        <div style="display:flex;flex-direction:column;gap:1rem;">
          ${[
            { id: 'bca', label: 'BCA', logos: ['https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg'], w: 50 },
            { id: 'mandiri', label: 'Bank Mandiri', logos: ['https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg'], w: 65 },
            { id: 'bri', label: 'Bank BRI', logos: ['https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg'], w: 60 },
            { id: 'gopay', label: 'GoPay', logos: ['https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg'], w: 60 },
            { id: 'ovo', label: 'OVO', html: '<span style="font-weight:900;color:#4C2A86;font-size:1.1rem;letter-spacing:1px;font-style:italic;">OVO</span>' },
            { id: 'qris', label: 'QRIS', logos: ['https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg'], w: 60 },
            { id: 'cc', label: 'Kartu Kredit', logos: ['https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'], w: 32 }
          ].map(m => `
            <div style="padding:1rem 1.25rem;border-radius:16px;border:2px solid ${bookingState.payment===m.id?'var(--green)':'var(--gray-200)'};background:${bookingState.payment===m.id?'#f0fdf4':'#fff'};cursor:pointer;display:flex;align-items:center;gap:1.25rem;font-weight:700;font-size:1rem;color:var(--gray-900);transition:all 0.2s;box-shadow:${bookingState.payment===m.id?'0 4px 12px rgba(16,185,129,0.15)':'var(--shadow-sm)'};transform:${bookingState.payment===m.id?'scale(1.02)':'scale(1)'}" onclick="bookingState.payment = (bookingState.payment === '${m.id}') ? null : '${m.id}'; renderApp()">
              <div style="min-width:56px;padding:0 8px;height:40px;background:#fff;border:1px solid var(--gray-200);border-radius:8px;display:flex;align-items:center;justify-content:center;gap:6px;flex-shrink:0;">
                ${m.html ? m.html : m.logos.map(l => `<img src="${l}" style="width:${m.w}px;max-height:20px;object-fit:contain;" alt="logo"/>`).join('')}
              </div>
              <div style="flex:1">${m.label}</div>
              ${bookingState.payment===m.id?'<svg style="width:24px;height:24px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>':''}
            </div>
          `).join('')}
        </div>
        
        <!-- Dynamic Payment Info -->
        ${['bca', 'mandiri', 'bri'].includes(bookingState.payment) ? `
          <div style="margin-top:1.5rem;padding:1.5rem;background:#f8fafc;border:1px solid var(--gray-200);border-radius:16px;animation:slideDown 0.3s ease;">
            <div style="font-size:0.875rem;font-weight:600;color:var(--gray-500);margin-bottom:1rem;">Transfer ke Rekening Berikut:</div>
            <div style="display:flex;align-items:center;gap:1rem;background:#fff;padding:1rem;border-radius:12px;border:1px solid var(--gray-200);">
              <div style="width:56px;height:48px;background:${bookingState.payment==='bca'?'#0066AE':bookingState.payment==='mandiri'?'#003D79':'#0B5599'};color:#fff;font-weight:900;font-style:italic;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:0.85rem;text-align:center;">${bookingState.payment.toUpperCase()}</div>
              <div style="flex:1">
                <div style="font-size:1.25rem;font-weight:800;color:var(--gray-900);letter-spacing:1px;font-family:monospace;">${bookingState.payment==='bca'?'8720 1928 3746':bookingState.payment==='mandiri'?'1370 0192 8374':'0019 0102 9384'}</div>
                <div style="font-size:0.875rem;color:var(--gray-500);margin-top:2px;">a.n. PT GLOW WORKATION</div>
              </div>
              <button class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.875rem;" onclick="copyToClipboard('${bookingState.payment==='bca'?'872019283746':bookingState.payment==='mandiri'?'137001928374':'001901029384'}', this)">Salin</button>
            </div>
          </div>
        ` : bookingState.payment === 'qris' ? `
          <div style="margin-top:1.5rem;padding:1.5rem;background:#f8fafc;border:1px solid var(--gray-200);border-radius:16px;animation:slideDown 0.3s ease;text-align:center;">
            <div style="font-size:0.875rem;font-weight:600;color:var(--gray-500);margin-bottom:1rem;">Scan QRIS via Aplikasi M-Banking/E-Wallet Anda</div>
            <div style="background:#fff;padding:1rem;border-radius:12px;border:1px solid var(--gray-200);display:inline-block;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GLOW-PAYMENT-QRIS-MOCK" style="width:200px;height:200px;display:block;margin:0 auto;" alt="QRIS Code" />
            </div>
          </div>
        ` : bookingState.payment === 'gopay' || bookingState.payment === 'ovo' ? `
          <div style="margin-top:1.5rem;padding:1.5rem;background:#f8fafc;border:1px solid var(--gray-200);border-radius:16px;animation:slideDown 0.3s ease;">
            <div style="font-size:0.875rem;font-weight:600;color:var(--gray-500);margin-bottom:1rem;">Nomor Tujuan ${bookingState.payment === 'gopay' ? 'GoPay' : 'OVO'}:</div>
            <div style="display:flex;align-items:center;gap:1rem;background:#fff;padding:1rem;border-radius:12px;border:1px solid var(--gray-200);">
              <div style="flex:1">
                <div style="font-size:1.25rem;font-weight:800;color:var(--gray-900);letter-spacing:1px;font-family:monospace;">0812 3456 7890</div>
                <div style="font-size:0.875rem;color:var(--gray-500);margin-top:2px;">a.n. GLOW OFFICIAL</div>
              </div>
              <button class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.875rem;" onclick="copyToClipboard('081234567890', this)">Salin</button>
            </div>
          </div>
        ` : bookingState.payment === 'cc' ? `
          <div style="margin-top:1.5rem;padding:1.5rem;background:#f8fafc;border:1px solid var(--gray-200);border-radius:16px;animation:slideDown 0.3s ease;">
            <div style="font-size:0.875rem;font-weight:600;color:var(--gray-500);margin-bottom:1rem;">Masukkan Detail Kartu Kredit / Debit (Visa/Mastercard)</div>
            <div style="display:flex;flex-direction:column;gap:1rem;">
              <input type="text" class="form-input" placeholder="Nomor Kartu (16 digit)" style="width:100%;" />
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <input type="text" class="form-input" placeholder="Masa Berlaku (MM/YY)" style="width:100%;" />
                <input type="text" class="form-input" placeholder="CVV (3 digit)" style="width:100%;" />
              </div>
            </div>
          </div>
        ` : ''}
      </div>
      
      <div>
        <div style="background:#fff;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);position:relative;overflow:hidden;margin-bottom:1.5rem;">
          <!-- Zigzag top -->
          <div style="height:12px;background-image:radial-gradient(circle at 10px 0, transparent 12px, #fff 13px);background-size:20px 20px;background-position:-10px -10px;width:100%;position:absolute;top:0;left:0;transform:rotate(180deg)"></div>
          
          <div style="padding:2.5rem 2rem 2rem;">
            <div style="text-align:center;margin-bottom:2rem;border-bottom:2px dashed var(--gray-200);padding-bottom:1.5rem;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--gray-500);letter-spacing:0.1em;margin-bottom:0.5rem">TOTAL TAGIHAN</div>
              <div style="font-size:2.5rem;font-weight:900;color:var(--green-dark);font-family:'Playfair Display',serif;">${formatRupiah(total)}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.875rem;color:var(--gray-600);margin-bottom:1.5rem;">
              <div style="display:flex;justify-content:space-between;"><span>Kode Pesanan</span><span style="font-weight:700;color:var(--gray-900)">GLOW-PENDING</span></div>
              <div style="display:flex;justify-content:space-between;"><span>Durasi</span><span style="font-weight:700;color:var(--gray-900)">${State.package.nights} Malam</span></div>
              <div style="display:flex;justify-content:space-between;"><span>Pajak & Layanan</span><span style="font-weight:700;color:var(--gray-900)">Termasuk</span></div>
            </div>
          </div>
          
          <!-- Zigzag bottom -->
          <div style="height:12px;background-image:radial-gradient(circle at 10px 12px, transparent 12px, #fff 13px);background-size:20px 20px;background-position:-10px 0;width:100%;position:absolute;bottom:0;left:0;"></div>
        </div>

        <div class="form-group" style="background:#fff;padding:1.5rem;border-radius:16px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
          <label class="form-label" style="margin-bottom:1rem;">Upload Bukti Pembayaran</label>
          <div id="drop-zone" onclick="document.getElementById('payment-proof').click()" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)" style="border:2px dashed var(--gray-300); border-radius:16px; padding:2.5rem 1rem; text-align:center; background:var(--gray-50); cursor:pointer; transition:all 0.3s ease;">
            <input type="file" id="payment-proof" accept="image/*" style="display:none;" onchange="handleFileSelect(this)" />
            <div id="drop-zone-content" style="${bookingState.paymentProof ? 'display:none;' : ''}">
              <svg style="width:48px;height:48px;color:var(--green);margin:0 auto 1rem;opacity:0.8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <div style="font-weight:700;color:var(--gray-700);font-size:1rem;margin-bottom:0.25rem;">Klik atau seret foto bukti transfer Anda ke sini</div>
              <div style="font-size:0.75rem;color:var(--gray-500);">Format didukung: JPG, PNG, PDF (Maks. 5MB)</div>
            </div>
            <div id="drop-zone-preview" style="${bookingState.paymentProof ? 'display:flex;' : 'display:none;'} align-items:center;justify-content:center;flex-direction:column;">
              <svg style="width:32px;height:32px;color:var(--green);margin-bottom:0.5rem" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div id="drop-zone-filename" style="font-weight:700;color:var(--gray-900);font-size:0.9rem;">${bookingState.paymentProof ? bookingState.paymentProof.name : ''}</div>
              <div style="font-size:0.75rem;color:var(--green);margin-top:4px;font-weight:600;">File siap diunggah</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2.5rem;border-top:1px solid var(--gray-200);padding-top:2rem;">
      <button class="btn btn-outline" onclick="goToStep(2)" style="border-radius:9999px;padding:0.75rem 1.5rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;color:var(--gray-600);border-color:var(--gray-300);">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> 
        Kembali
      </button>
      <button class="btn btn-primary btn-lg" onclick="confirmPayment()" style="border-radius:9999px;padding:1rem 2.5rem;font-size:1.1rem;font-weight:800;display:flex;align-items:center;gap:0.75rem;box-shadow:0 8px 16px rgba(16,185,129,0.25);transition:all 0.3s;">
        Konfirmasi Pembayaran 
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </div>
  `;
  return wrap;
}

function renderBookingSuccess() {
  const wrap = el('div', 'text-center slide-up');
  wrap.style.padding = '3rem 1rem';
  
  // Format the data properly for generateProfessionalInvoiceHTML
  let pkgData = bookingState.packageData;
  if (!pkgData && bookingState.bookingCode) {
    const mockBookings = JSON.parse(localStorage.getItem('glow_mock_bookings') || '[]');
    const mock = mockBookings.find(x => 'GLOW-' + x.id === bookingState.bookingCode);
    if (mock && mock.package) {
      pkgData = mock.package;
    }
  }

  const mockBooking = {
    id: bookingState.bookingCode,
    bookingCode: bookingState.bookingCode,
    startDate: bookingState.checkIn,
    endDate: bookingState.checkOut,
    package: pkgData,
    phone: bookingState.contactPhone || State.user?.phone || ''
  };
  
  const invoiceHtml = window.generateProfessionalInvoiceHTML(mockBooking);
  
  wrap.innerHTML = `
    <div style="margin-bottom:1rem;animation:slideUp 0.5s ease;display:flex;justify-content:center;">
      <div style="width:80px;height:80px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 10px rgba(16,185,129,0.1)">
        <svg style="width:40px;height:40px;color:#fff;" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
      </div>
    </div>
    <h2 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:900;color:var(--gray-900);margin-bottom:0.5rem">Pembayaran Berhasil!</h2>
    <p style="color:var(--gray-500);margin-bottom:2.5rem;font-size:1.1rem;">Selamat! Workation impianmu sudah terkonfirmasi. Berikut adalah Invoice Anda.</p>
    
    <div style="margin: 0 auto 2.5rem; text-align: left;">
      ${invoiceHtml}
    </div>
    
    <div class="no-print" style="margin-bottom:2.5rem;text-align:center;">
      <button class="btn btn-outline" onclick="window.printInvoice()" style="padding:0.75rem 2rem;border-radius:99px;font-weight:700;">
        <svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:8px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        Cetak Invoice (PDF)
      </button>
    </div>

    <div class="no-print" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-primary btn-lg" onclick="finishBookingAndNavigate('dashboard-user')" style="border-radius:100px;padding:1rem 2rem;"><svg style="width:18px;height:18px;display:inline-block;vertical-align:bottom;margin-right:6px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Lihat di Dashboard</button>
      <button class="btn btn-outline btn-lg" onclick="finishBookingAndNavigate('package')" style="border-radius:100px;padding:1rem 2rem;border:2px solid var(--gray-200);color:var(--gray-700);font-weight:600;"><svg style="width:18px;height:18px;display:inline-block;vertical-align:bottom;margin-right:6px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Buat Paket Baru</button>
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
    State.syncSchedules(diffDays > 0 ? diffDays : 1);
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

async function confirmPayment() {
  if (!bookingState.payment) { showToast('Pilih metode pembayaran dahulu!'); return; }
  
  const pkg = State.package;
  let items = [];
  if (pkg.penginapan) items.push(pkg.penginapan);
  if (pkg.workspaces) items = items.concat(pkg.workspaces);
  if (pkg.activities) items = items.concat(pkg.activities);
  
  if (items.length === 0) {
    showToast('Paket kosong, tambahkan item ke paket terlebih dahulu!');
    return;
  }
  
  const payload = {
    items,
    startDate: bookingState.checkIn || new Date().toISOString(),
    endDate: bookingState.checkOut || new Date().toISOString(),
    guestCount: 1,
    totalPrice: State.calcTotal()
  };

  try {
    const btn = document.querySelector('.btn-primary');
    if(btn) { btn.disabled = true; btn.innerText = 'Memproses...'; }
    
    // Call backend API
    let result;
    try {
      if (!bookingState.isProdMode) {
        throw new Error('API Error: Mocking mode active');
      }
      result = await BookingService.createBooking(payload);
      if (!result || (!result.booking && !result.id)) {
        throw new Error('API Error: Invalid response format');
      }
    } catch (e) {
      // Fallback for demo/testing if token is invalid or server is unreachable
      if (e.message.includes('API Error') || e.message.includes('Unauthorized') || e.message.includes('Failed to fetch') || !bookingState.isProdMode) {
        console.warn('Falling back to mock booking success.', e.message);
        result = { booking: { id: Math.floor(Math.random() * 10000) } };
        
        // Save to local storage so it shows up in Order History
        const mockBooking = {
          id: result.booking.id,
          userId: State.user ? State.user.id : null,
          status: 'PAID',
          package: { ...JSON.parse(JSON.stringify(State.package)), packageName: 'Paket Workation' },
          startDate: payload.startDate,
          endDate: payload.endDate,
          guestCount: payload.guestCount,
          totalPrice: payload.totalPrice,
          createdAt: new Date().toISOString()
        };
        const existingMocks = JSON.parse(localStorage.getItem('glow_mock_bookings') || '[]');
        existingMocks.push(mockBooking);
        localStorage.setItem('glow_mock_bookings', JSON.stringify(existingMocks));
      } else {
        throw e;
      }
    }
    
    bookingState.bookingCode = 'GLOW-' + (result.booking ? result.booking.id : result.id);
    bookingState.confirmed = true;
    bookingState.packageData = JSON.parse(JSON.stringify(State.package));
    
    // Reset package cart
    State.set('package', { nights: 1, penginapan: null, workspaces: [], transport: null, activities: [] });
    
    renderApp();
  } catch (error) {
    console.error(error);
    showToast('Gagal memproses pesanan: ' + error.message);
    const btn = document.querySelector('.btn-primary');
    if(btn) { btn.disabled = false; btn.innerText = 'Konfirmasi Pembayaran'; }
  }
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
