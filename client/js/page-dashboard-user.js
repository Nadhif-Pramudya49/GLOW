window.renderUserTab = async function(tab) {
  const content = document.getElementById('user-content');
  if (!content) return;
  
  sessionStorage.setItem('glow_dashboard_tab', tab);
  
  document.querySelectorAll('.sidebar-item').forEach(el => {
    if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(`('${tab}')`)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  
  if (tab === 'bookings') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Pesanan Saya</h1>
        <p>Selamat datang kembali, ${State.user.fullName}!</p>
      </div>
      <div id="booking-list">
        <div style="text-align:center;padding:3rem;color:var(--gray-400)">Memuat riwayat pesanan...</div>
      </div>
    `;
    try {
      let bookings = [];
      try {
        const apiRes = await BookingService.getMyBookings();
        if (Array.isArray(apiRes)) {
          bookings = apiRes;
        } else if (apiRes && Array.isArray(apiRes.data)) {
          bookings = apiRes.data;
        }
      } catch (e) {
        console.warn("Failed to fetch bookings, falling back to mock data", e.message);
      }
      
      const localMockStr = localStorage.getItem('glow_mock_bookings');
      if (localMockStr) {
        const localMock = JSON.parse(localMockStr);
        bookings = bookings.concat(localMock);
        // Sort descending by date
        bookings.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }
      
      window._dashboardBookings = bookings;
      
      const listEl = content.querySelector('#booking-list');
      if (bookings.length === 0) {
        listEl.innerHTML = `
          <div class="dashboard-card" style="text-align:center;padding:4rem 2rem">
            <h3 style="font-weight:700;margin-bottom:0.5rem;color:var(--gray-800)">Belum ada pesanan</h3>
            <p style="color:var(--gray-500);margin-bottom:1.5rem">Mulai eksplorasi dan rancang workation impian Anda sekarang.</p>
            <button class="btn btn-primary" onclick="navigate('search')">Cari Tempat Workation</button>
          </div>
        `;
        return;
      }
      listEl.innerHTML = bookings.map(b => {
        const inDate = new Date(b.startDate).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
        const outDate = new Date(b.endDate).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
        let statusColor = 'var(--gray-600)';
        let statusBg = 'var(--gray-100)';
        if (b.status === 'PENDING') { statusColor = '#d97706'; statusBg = '#fef3c7'; }
        else if (b.status === 'CONFIRMED' || b.status === 'ACTIVE') { statusColor = '#2563eb'; statusBg = '#dbeafe'; }
        else if (b.status === 'COMPLETED') { statusColor = '#059669'; statusBg = '#d1fae5'; }
        else if (b.status === 'CANCELLED' || b.status === 'REJECTED') { statusColor = '#dc2626'; statusBg = '#fee2e2'; }

        return `
          <div class="dashboard-card" style="margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2;">
            <div>
              <div style="font-size:0.75rem;color:var(--gray-500);margin-bottom:4px;display:flex;align-items:center;gap:0.5rem;">
                <span>ORDER #${b.id}</span>
                <span style="font-size:0.65rem;font-weight:700;color:${statusColor};background:${statusBg};padding:2px 8px;border-radius:12px;letter-spacing:0.05em;">${b.status}</span>
              </div>
              <div style="font-weight:700;font-size:1.1rem;color:var(--gray-900);margin-bottom:4px">${b.package?.packageName || 'Paket Workation'}</div>
              <div style="font-size:0.875rem;color:var(--gray-600)">${inDate} s.d. ${outDate} (${b.guestCount} Tamu)</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:1.25rem;font-weight:800;color:var(--green)">Rp ${b.totalPrice ? parseFloat(b.totalPrice).toLocaleString('id-ID') : 0}</div>
              <div style="margin-top:0.5rem;display:flex;gap:0.5rem;justify-content:flex-end;">
                <button class="btn btn-outline" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="viewOrderDescription('${b.id}')">Deskripsi Pesanan</button>
                <button class="btn btn-ghost" style="padding:0.25rem 0.5rem;font-size:0.75rem;" onclick="window.viewBookingInvoiceFromHistory('${b.id}')">Lihat Invoice</button>
              </div>
            </div>
          </div>
          <div id="booking-details-${b.id}" style="display:none; margin-top:-1.5rem; margin-bottom:1.5rem; padding-top:1rem; position:relative; z-index:1; animation: slideDown 0.3s ease-out"></div>
        `;
      }).join('');
    } catch (error) {
      content.querySelector('#booking-list').innerHTML = `<div class="dashboard-card" style="text-align:center;color:var(--red);padding:2rem">Gagal memuat pesanan.</div>`;
    }
  } else if (tab === 'login-info') {
    window.isAccountEditMode = false;
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Informasi Login</h1>
        <p>Kelola informasi otentikasi akun Anda.</p>
      </div>
      <div class="dashboard-card" style="max-width:600px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:var(--gray-900)">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Informasi Akun (Login)
            </h3>
            <p style="color:var(--gray-500);font-size:0.9rem;margin:0;line-height:1.5">
              Data kredensial utama untuk otentikasi.
            </p>
          </div>
          <button type="button" id="acc-edit-mode-btn" class="btn btn-outline" onclick="toggleAccountEditMode()" style="padding:0.5rem 1rem; font-size:0.875rem; border-radius:99px; display:flex; gap:0.5rem; align-items:center; transition:all 0.2s;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span id="acc-edit-mode-text">Mode Ubah</span>
          </button>
        </div>
        <form id="profile-form" onsubmit="executeSaveAccountInfo(event)">
          <div style="margin-bottom:1.5rem">
            <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.5rem">Nama Lengkap</label>
            <input type="text" id="acc-name" class="form-input" value="${State.user.fullName}" required oninput="checkAccountChanges()" readonly style="background:var(--gray-50); color:var(--gray-500); cursor:not-allowed; transition:all 0.2s;" />
          </div>
          <div style="margin-bottom:1.5rem">
            <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.5rem">Alamat Email</label>
            <input type="email" id="acc-email" class="form-input" value="${State.user.email}" required oninput="checkAccountChanges()" readonly style="background:var(--gray-50); color:var(--gray-500); cursor:not-allowed; transition:all 0.2s;" />
            <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">Email digunakan untuk otentikasi login.</div>
          </div>

          <div style="margin-bottom:1.5rem;">
            <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.5rem">Kata Sandi</label>
            <div style="position:relative;">
              <input type="password" id="acc-pwd" class="form-input" value="********" required oninput="checkAccountChanges()" readonly style="background:var(--gray-50); color:var(--gray-500); cursor:not-allowed; transition:all 0.2s; padding-right:2.5rem; letter-spacing:0.25rem;" />
              <button type="button" id="btn-toggle-acc-pwd" onclick="togglePasswordVisibility('btn-toggle-acc-pwd', 'acc-pwd')" style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--gray-500); padding:0; display:none; align-items:center;">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
            <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">Kosongkan jika tidak ingin mengubah kata sandi.</div>
          </div>
          
          <button type="submit" id="acc-save-btn" class="btn" style="width:100%;justify-content:center;padding:0.875rem;font-size:1rem;background-color:var(--gray-300);color:var(--gray-500);cursor:not-allowed;border:none;display:none;" disabled>Simpan Perubahan</button>
          <div id="acc-changes-text" style="font-size:0.85rem;color:var(--green);margin-top:0.75rem;text-align:center;font-weight:600;display:none;"></div>
        </form>
      </div>
    `;
  } else if (tab === 'booking-data') {
    let userProfile = {};
    try {
      const res = await UserService.getProfile();
      userProfile = res.profile || {};
    } catch(e) {
      console.error('Failed to get profile', e);
    }
    
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Selamat datang kembali, ${State.user.fullName.split(' ')[0]}!</h1>
        <p>Di sini Anda dapat mengelola data profil untuk mempercepat proses pesanan.</p>
      </div>
      <div class="dashboard-card" style="max-width:600px;">
        <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;color:var(--green)">
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Data Pemesanan
        </h3>
        <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;line-height:1.5">
          Data profil ini akan disalin secara otomatis ke form setiap kali Anda membuat pesanan baru (Booking) agar proses lebih cepat.
        </p>
        
        ${userProfile.phone ? `
          <div style="background:var(--gray-50);padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;border:1px solid var(--gray-200);">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)">
              <span style="color:var(--gray-500);font-size:0.9rem">Nama Lengkap</span>
              <strong style="color:var(--gray-900);text-align:right">${State.user.fullName}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)">
              <span style="color:var(--gray-500);font-size:0.9rem">Email Utama</span>
              <strong style="color:var(--gray-900);text-align:right">${State.user.email}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)">
              <span style="color:var(--gray-500);font-size:0.9rem">WhatsApp</span>
              <strong style="color:var(--gray-900);text-align:right">${userProfile.phone}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--gray-500);font-size:0.9rem">Alamat</span>
              <strong style="color:var(--gray-900);text-align:right">${userProfile.address || '-'}</strong>
            </div>
          </div>
          <div style="display:flex;gap:1rem;">
            <button class="btn btn-primary" style="flex:1;text-align:center;justify-content:center;" onclick="editSavedBookingProfile('${userProfile.phone || ''}', '${userProfile.address || ''}')">Perbarui Data Tambahan</button>
          </div>
        ` : `
          <div style="background:#fff7ed;color:#c2410c;padding:1rem 1.5rem;border-radius:12px;font-size:0.9rem;border:1px solid #fed7aa;text-align:center;line-height:1.5;margin-bottom:1.5rem;">
            Belum ada data nomor WhatsApp dan Alamat. Tambahkan agar mempermudah pesanan Anda.
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="editSavedBookingProfile('', '')">Tambah Data Tambahan</button>
        `}
      </div>
    `;
  } else if (tab === 'saved-packages') {
    const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');
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

    let listHtml = '';
    if (!State.savedPackages || State.savedPackages.length === 0) {
      listHtml = `
        <div class="dashboard-card" style="text-align:center;padding:4rem 2rem">
          <div style="font-size:3rem; margin-bottom:1rem; opacity:0.5;">📦</div>
          <h3 style="font-weight:700;margin-bottom:0.5rem;color:var(--gray-800)">Belum ada paket tersimpan</h3>
          <p style="color:var(--gray-500);margin-bottom:1.5rem">Anda belum menyimpan rancangan workation apa pun dari Package Builder.</p>
          <button class="btn btn-primary" onclick="navigate('package')">Buka Package Builder</button>
        </div>
      `;
    } else {
      listHtml = State.savedPackages.map((p, idx) => {
        const coverImg = p.penginapan?.[0]?.img || p.workspaces?.[0]?.img || p.activities?.[0]?.img || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400';
        const total = calcSavedTotal(p);
        return `
        <div class="dashboard-card" style="margin-bottom:1.5rem;display:flex;gap:1.5rem;align-items:center;padding:1.5rem;">
          <img src="${coverImg}" alt="Cover" style="width:140px;height:140px;object-fit:cover;border-radius:12px;flex-shrink:0;">
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
              <div>
                <div style="font-size:0.75rem;color:var(--gray-500);margin-bottom:0.25rem;">Disimpan: ${p.saved || 'Baru Saja'}</div>
                <div style="font-weight:800;color:var(--gray-900);font-size:1.25rem;">${p.name || 'Paket Tanpa Nama'}</div>
              </div>
              <div style="background:var(--green);color:white;padding:0.35rem 0.75rem;border-radius:8px;font-size:0.85rem;font-weight:700;display:flex;align-items:center;gap:0.35rem;">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                ${p.nights} Malam
              </div>
            </div>
            
            <div style="font-size:0.875rem;color:var(--gray-600);margin-bottom:1.25rem;display:flex;gap:2rem;">
              <div style="display:flex;align-items:center;gap:0.5rem">
                <div style="width:24px;height:24px;background:var(--gray-100);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--gray-500)">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </div>
                ${p.penginapan?.length || 0} Penginapan
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <div style="width:24px;height:24px;background:var(--gray-100);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--gray-500)">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                ${p.workspaces?.length || 0} Workspace
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <div style="width:24px;height:24px;background:var(--gray-100);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--gray-500)">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                ${p.activities?.length || 0} Aktivitas
              </div>
            </div>
            
            <div style="display:flex;justify-content:space-between;align-items:flex-end;">
              <div>
                <div style="font-size:0.75rem;color:var(--gray-500);margin-bottom:0.25rem;">Estimasi Total</div>
                <div style="font-size:1.35rem;font-weight:900;color:var(--green)">
                  ${formatRupiah(total)}
                </div>
              </div>
              <div style="display:flex;gap:0.75rem;">
                <button class="btn btn-outline" onclick="window.viewSavedPackageDetailDashboard(${idx})">Detail</button>
                <button class="btn btn-outline" style="color:#ef4444;border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);" onclick="deleteSavedPackageDashboard(${idx})">Hapus</button>
                <button class="btn btn-primary" style="padding-left:1.5rem;padding-right:1.5rem;" onclick="loadSavedPackage(${idx})">Muat Paket Ini</button>
              </div>
            </div>
          </div>
        </div>
        <div id="saved-package-details-${idx}" style="display:none; margin-top:-1.5rem; margin-bottom:1.5rem; padding-top:1rem; position:relative; z-index:1; animation: slideDown 0.3s ease-out"></div>
        `;
      }).join('');
    }

    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Paket Tersimpan</h1>
        <p>Rancangan workation yang telah Anda simpan sebelumnya.</p>
      </div>
      <div>
        ${listHtml}
      </div>
    `;
  }
};

async function renderDashboardUser() {
  const container = el('div', 'dashboard-layout fade-in');
  
  const sidebar = el('div', 'dashboard-sidebar');
  sidebar.innerHTML = `
    <div style="margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--gray-200); text-align:center;">
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(State.user.fullName)}&background=10b981&color=fff&rounded=true&size=64" alt="Profile" style="width:64px;height:64px;border-radius:50%;margin-bottom:1rem;border:3px solid var(--green);box-shadow:0 4px 12px rgba(15,118,110,0.2)" />
      <div style="font-weight:800; font-size:1.1rem; color:var(--gray-900); margin-bottom:0.25rem;">${State.user.fullName}</div>
      <div style="font-size:0.75rem; font-weight:700; color:var(--green); display:inline-block; padding:4px 12px; border-radius:100px; background:rgba(15,118,110,0.1); border:1px solid rgba(15,118,110,0.2);">ROLE: ${State.user.role}</div>
    </div>
    <ul class="sidebar-nav" style="flex:1; display:flex; flex-direction:column;">
      <li><a class="sidebar-item" onclick="renderUserTab('booking-data')">Data Pengguna</a></li>
      <li><a class="sidebar-item" onclick="renderUserTab('login-info')">Informasi Login</a></li>
      <li><a class="sidebar-item" onclick="renderUserTab('saved-packages')">Paket Tersimpan</a></li>
      <li><a class="sidebar-item" onclick="renderUserTab('bookings')">Riwayat Pesanan</a></li>
      <li style="margin-top:auto; padding-top:2rem;"><a class="sidebar-item" style="color:#ef4444; background:rgba(239,68,68,0.1); border-radius:8px; text-align:center; font-weight:700; transition:all 0.2s; cursor:pointer;" onclick="AuthService.logout()" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444';">Logout</a></li>
    </ul>
  `;
  
  const content = el('div', 'dashboard-content');
  content.id = 'user-content';
  
  container.appendChild(sidebar);
  container.appendChild(content);

  // Initial load
  const initialTab = sessionStorage.getItem('glow_dashboard_tab') || 'booking-data';
  setTimeout(() => renderUserTab(initialTab), 0);

  return container;
}

window.deleteSavedBookingProfile = function() {
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
      <h3 style="font-size:1.25rem;font-weight:800;color:var(--gray-900);margin-bottom:0.5rem">Hapus Data Profil?</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:2rem;line-height:1.5;">Apakah Anda yakin ingin menghapus data profil pemesan tersimpan ini? Data yang terhapus tidak dapat dikembalikan.</p>
      
      <button class="btn btn-primary" style="width:100%;border-radius:12px;padding:0.875rem 0;font-weight:700;background:#b91c1c;border-color:#b91c1c;box-shadow:0 4px 12px rgba(185, 28, 28, 0.2);color:#fff;text-align:center;display:block;" onclick="executeDeleteBookingProfile()">Hapus Data</button>
    </div>
  `;
  
  const overlay = showModal(content);
  const modalDiv = overlay.querySelector('.modal');
  if (modalDiv) {
    modalDiv.style.maxWidth = '400px';
    modalDiv.style.position = 'relative'; 
  }
}

window.executeDeleteBookingProfile = async function() {
  try {
    await UserService.updateProfile({ phone: '', address: '' });
    if(State.user.userProfile) {
      State.user.userProfile.phone = '';
      State.user.userProfile.address = '';
    }
    closeModal();
    renderUserTab('booking-data');
    showToast("Data pemesan berhasil dihapus!");
  } catch(e) {
    alert("Gagal menghapus profil: " + e.message);
  }
}

window.editSavedBookingProfile = function() {
  const savedProfile = window._tempEditProfile || { 
    name: State.user?.fullName || '', 
    email: State.user?.email || '', 
    phone: State.user?.userProfile?.phone || '' 
  };
  const content = `
    <style>
      @keyframes pulse-yellow { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
    </style>
    <!-- Tombol Silang (Close) -->
    <button onclick="closeModal()" style="position:absolute;top:1.5rem;right:1.5rem;width:32px;height:32px;border:none;background:var(--gray-100);border-radius:50%;cursor:pointer;color:var(--gray-500);display:flex;align-items:center;justify-content:center;transition:all 0.2s;padding:0;" onmouseover="this.style.background='var(--gray-200)';this.style.color='var(--gray-900)'" onmouseout="this.style.background='var(--gray-100)';this.style.color='var(--gray-500)'">
      <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>

    <div style="padding:1.5rem;">
      <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:0.5rem;color:var(--gray-900)">Perbarui Identitas</h2>
      <p style="color:var(--gray-500);margin-bottom:1.5rem;font-size:0.95rem;">Pastikan data yang Anda masukkan sesuai dengan identitas resmi (KTP/Paspor).</p>

      <div style="margin-bottom:1rem;">
        <label id="lbl-edit-name" style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.25rem;color:var(--gray-700)">Nama Lengkap</label>
        <input type="text" id="edit-booking-name" class="form-input" placeholder="Nama Lengkap sesuai KTP" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--gray-200);transition:all 0.2s" value="${savedProfile.name || ''}" oninput="liveValidateEditField('name', this)" onblur="liveValidateEditField('name', this)" onfocus="if(!document.getElementById('err-edit-name').innerText){this.style.borderColor='var(--green)';this.style.boxShadow='0 0 0 4px rgba(15,118,110,0.1)'}" />
        <div id="err-edit-name" style="color:#ef4444;font-size:0.75rem;margin-top:0.25rem;display:none;font-weight:600"></div>
      </div>

      <div style="margin-bottom:1rem;">
        <label id="lbl-edit-email" style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.25rem;color:var(--gray-700)">Alamat Email</label>
        <input type="email" id="edit-booking-email" class="form-input" placeholder="Misal: rangga@gmail.com" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--gray-200);transition:all 0.2s" value="${savedProfile.email || ''}" oninput="liveValidateEditField('email', this)" onblur="liveValidateEditField('email', this)" onfocus="if(!document.getElementById('err-edit-email').innerText){this.style.borderColor='var(--green)';this.style.boxShadow='0 0 0 4px rgba(15,118,110,0.1)'}" />
        <div id="err-edit-email" style="color:#ef4444;font-size:0.75rem;margin-top:0.25rem;display:none;font-weight:600"></div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <label id="lbl-edit-phone" style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.25rem;color:var(--gray-700)">Nomor WhatsApp Aktif</label>
        <input type="tel" id="edit-booking-phone" class="form-input" placeholder="Misal: 08123456789" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--gray-200);transition:all 0.2s" value="${savedProfile.phone || ''}" oninput="liveValidateEditField('phone', this)" onblur="liveValidateEditField('phone', this)" onfocus="if(!document.getElementById('err-edit-phone').innerText){this.style.borderColor='var(--green)';this.style.boxShadow='0 0 0 4px rgba(15,118,110,0.1)'}" />
        <div id="err-edit-phone" style="color:#ef4444;font-size:0.75rem;margin-top:0.25rem;display:none;font-weight:600"></div>
        <div style="font-size:0.7rem;color:var(--gray-500);margin-top:0.25rem;">Kami akan mengirimkan detail pesanan melalui WhatsApp.</div>
      </div>

      <div style="margin-bottom:1.5rem;background:var(--gray-50);border:1px solid var(--gray-200);padding:1rem;border-radius:12px;display:flex;gap:0.75rem;align-items:flex-start;">
        <input type="checkbox" id="edit-booking-confirm" style="margin-top:0.25rem;width:1.25rem;height:1.25rem;accent-color:#f59e0b;cursor:pointer;" onchange="if(typeof checkEditFormStatus === 'function') checkEditFormStatus()">
        <div>
          <label for="edit-booking-confirm" style="font-size:0.875rem;color:var(--gray-700);font-weight:700;cursor:pointer;display:block;margin-bottom:0.25rem;">
            Saya mengonfirmasi bahwa data ini adalah benar.
          </label>
          <p style="font-size:0.75rem;color:var(--gray-500);line-height:1.5;margin:0;">
            Data Anda akan disimpan dengan aman sesuai dengan <a href="#" onclick="openPrivacyPolicyDashboard(event)" style="color:var(--gray-700);text-decoration:underline;"><strong>Kebijakan Privasi</strong></a> kami dan hanya digunakan untuk mempercepat proses pemesanan (Booking) Anda di GLOW.
          </p>
        </div>
      </div>
      <div id="err-edit-confirm" style="color:#ef4444;font-size:0.75rem;margin-bottom:1rem;display:none;font-weight:600;text-align:center;">⚠️ Anda harus mengonfirmasi data terlebih dahulu.</div>

      <button id="btn-save-edit-profile" class="btn" onclick="validateAndConfirmEditProfile()" style="width:100%;border-radius:9999px;padding:0.75rem 1rem;font-weight:800;display:flex;align-items:center;justify-content:center;gap:0.75rem;background-color:var(--gray-300);color:var(--gray-500);border:none;transition:all 0.2s;" disabled>Simpan Data</button>
      <div id="missing-info-text" style="font-size:0.75rem;color:var(--gray-500);text-align:center;margin-top:0.75rem;height:1.2rem;transition:all 0.3s;font-weight:600"></div>
    </div>
  `;
  
  const overlay = showModal(content);
  const modalDiv = overlay.querySelector('.modal');
  if (modalDiv) {
    modalDiv.style.maxWidth = '600px';
    modalDiv.style.width = '95vw';
    modalDiv.style.maxHeight = 'none';
    modalDiv.style.overflowY = 'visible';
    modalDiv.style.position = 'relative'; 
    modalDiv.style.padding = '0';
  }
}

window.liveValidateEditField = function(field, inputEl) {
  const val = inputEl.value;
  const errDiv = document.getElementById('err-edit-' + field);
  const labelEl = document.getElementById('lbl-edit-' + field);
  let errorMsg = '';

  const nameRegex = /^[A-Za-z\s.\-']+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneCharRegex = /^[0-9\+\-\s()]*$/;

  if (field === 'name') {
    if (!val) {
      errorMsg = '';
    } else if (!nameRegex.test(val)) {
      errorMsg = 'Nama hanya boleh berisi huruf (tanpa angka).';
    }
  } else if (field === 'email') {
    if (!val) {
      errorMsg = '';
    } else if (!emailRegex.test(val)) {
      errorMsg = 'Format alamat email tidak valid.';
    }
  } else if (field === 'phone') {
    if (!val) {
      errorMsg = '';
    } else if (!phoneCharRegex.test(val)) {
      errorMsg = 'Nomor WhatsApp hanya boleh angka.';
    } else if (val.length < 8) {
      errorMsg = 'Nomor WhatsApp tidak valid (minimal 8 digit).';
    }
  }

  if (errorMsg) {
    errDiv.innerHTML = '⚠️ ' + errorMsg;
    errDiv.style.display = 'block';
    inputEl.style.borderColor = '#ef4444';
    inputEl.style.backgroundColor = '#fef2f2';
    inputEl.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.1)';
    if (labelEl) labelEl.style.color = '#ef4444';
  } else {
    errDiv.innerHTML = '';
    errDiv.style.display = 'none';
    inputEl.style.borderColor = 'var(--gray-200)';
    inputEl.style.backgroundColor = '#fff';
    inputEl.style.boxShadow = 'none';
    if (labelEl) labelEl.style.color = 'var(--gray-700)';
  }
  
  if (typeof checkEditFormStatus === 'function') checkEditFormStatus();
}

window.validateAndConfirmEditProfile = function() {
  const name = document.getElementById('edit-booking-name').value;
  const email = document.getElementById('edit-booking-email').value;
  let phone = document.getElementById('edit-booking-phone').value;
  const isConfirmed = document.getElementById('edit-booking-confirm').checked;
  
  const nameRegex = /^[A-Za-z\s.\-']+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneCharRegex = /^[0-9\+\-\s()]*$/;
  
  let hasError = false;
  
  function setError(field, msg) {
    const errDiv = document.getElementById('err-edit-' + field);
    const input = document.getElementById('edit-booking-' + field);
    if (msg) {
      errDiv.innerHTML = '⚠️ ' + msg;
      errDiv.style.display = 'block';
      input.style.borderColor = '#ef4444';
      input.style.backgroundColor = '#fef2f2';
      hasError = true;
    } else {
      errDiv.style.display = 'none';
      input.style.borderColor = 'var(--gray-200)';
      input.style.backgroundColor = '#fff';
    }
  }

  if (!name) setError('name', "Nama lengkap wajib diisi.");
  else if (!nameRegex.test(name)) setError('name', "Nama hanya boleh berisi huruf (tanpa angka).");
  else setError('name', "");

  if (!email) setError('email', "Alamat email wajib diisi.");
  else if (!emailRegex.test(email)) setError('email', "Format alamat email tidak valid.");
  else setError('email', "");

  const phoneLengthRegex = /^[0-9\+\-\s()]{8,20}$/;
  
  if (!phone) setError('phone', "Nomor WhatsApp wajib diisi.");
  else if (!phoneCharRegex.test(phone)) setError('phone', "Nomor WhatsApp hanya boleh angka.");
  else if (!phoneLengthRegex.test(phone)) setError('phone', "Nomor WhatsApp tidak valid (minimal 8 digit).");
  else setError('phone', "");

  if (hasError) return;

  if (!isConfirmed) {
    document.getElementById('err-edit-confirm').style.display = 'block';
    return;
  } else {
    document.getElementById('err-edit-confirm').style.display = 'none';
  }

  // Save state and close the edit modal
  window._tempEditProfile = { name, email, phone };
  closeModal();

  const content = `
    <!-- Tombol Silang -->
    <button onclick="closeConfirmAndReopenEdit()" style="position:absolute;top:1rem;right:1rem;width:32px;height:32px;border:none;background:transparent;cursor:pointer;color:var(--gray-400);display:flex;align-items:center;justify-content:center;transition:color 0.2s;padding:0;" onmouseover="this.style.color='var(--gray-700)'" onmouseout="this.style.color='var(--gray-400)'">
      <svg style="width:24px;height:24px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    
    <div style="text-align:center;padding:2rem 1rem 1rem;">
      <div style="width:56px;height:56px;background:#e0f2fe;color:#0284c7;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
        <svg style="width:28px;height:28px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
        </svg>
      </div>
      <h3 style="font-size:1.25rem;font-weight:800;color:var(--gray-900);margin-bottom:0.5rem">Simpan Perubahan?</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:2rem;line-height:1.5;">Apakah Anda yakin data identitas yang dimasukkan sudah benar? Data ini akan digunakan secara otomatis pada pesanan berikutnya.</p>
      
      <button class="btn btn-primary" style="width:100%;border-radius:12px;padding:0.875rem 0;font-weight:700;display:block;" onclick="executeSaveBookingProfileEdit('${name}', '${email}', '${phone}')">Ya, Simpan Data</button>
    </div>
  `;
  const overlay = showModal(content);
  const modalDiv = overlay.querySelector('.modal');
  if (modalDiv) {
    modalDiv.style.maxWidth = '400px';
    modalDiv.style.position = 'relative'; 
  }
}

window.executeSaveBookingProfileEdit = async function(name, email, phone) {
  closeModal();
  const address = ''; // Default empty if not edited here
  try {
    await UserService.updateProfile({ phone, address });
    window._tempEditProfile = null; // clear temp data
    renderUserTab('booking-data');
    showToast("Data pemesan berhasil diperbarui!");
  } catch(e) {
    alert("Gagal memperbarui profil: " + e.message);
  }
}

window.closeConfirmAndReopenEdit = function() {
  closeModal();
  editSavedBookingProfile('', ''); // Pass empty strings or current values if known
}

window.closePrivacyAndReopenEdit = function() {
  closeModal();
  editSavedBookingProfile();
}

window.openPrivacyPolicyDashboard = function(e) {
  if (e) e.preventDefault();
  
  const name = document.getElementById('edit-booking-name')?.value || '';
  const email = document.getElementById('edit-booking-email')?.value || '';
  const phone = document.getElementById('edit-booking-phone')?.value || '';
  window._tempEditProfile = { name, email, phone };
  
  closeModal();
  
  const content = `
    <!-- Tombol Silang (Close) -->
    <button onclick="closePrivacyAndReopenEdit()" style="position:absolute;top:1rem;right:1rem;width:32px;height:32px;border:none;background:var(--gray-100);border-radius:50%;cursor:pointer;color:var(--gray-500);display:flex;align-items:center;justify-content:center;transition:all 0.2s;padding:0;" onmouseover="this.style.background='var(--gray-200)';this.style.color='var(--gray-900)'" onmouseout="this.style.background='var(--gray-100)';this.style.color='var(--gray-500)'">
      <svg style="width:20px;height:20px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
    <div style="padding:1.5rem;">
      <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:1rem;color:var(--gray-900);display:flex;align-items:center;gap:0.5rem;">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="color:var(--green)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        Kebijakan Privasi
      </h2>
      <div style="font-size:0.95rem;color:var(--gray-700);line-height:1.6;margin-bottom:1.5rem;">
        <p style="margin-bottom:1rem">Privasi Anda sangat penting bagi GLOW. Dokumen ini menjelaskan bagaimana kami mengumpulkan dan melindungi data Anda.</p>
        <ul style="padding-left:1.5rem;line-height:1.6;margin-bottom:1rem;">
          <li><strong>Data yang Kami Kumpulkan:</strong> Kami mengumpulkan nama, alamat email, dan nomor telepon untuk memproses pesanan dan memfasilitasi komunikasi.</li>
          <li><strong>Penggunaan Data:</strong> Data Anda tidak akan pernah kami jual ke pihak ketiga. Kami hanya menggunakannya untuk operasional booking, pengiriman e-tiket, dan notifikasi reminder perjalanan Anda.</li>
          <li><strong>Keamanan Data:</strong> Kami menerapkan enkripsi standar industri (SSL) untuk semua transmisi data pembayaran dan penyimpanan database kami. Akses ke data pribadi sangat dibatasi.</li>
          <li><strong>Penggunaan Cookies:</strong> Kami menggunakan cookies ringan hanya untuk mempertahankan sesi login dan preferensi keranjang belanja Anda, bukan untuk pelacakan iklan lintas platform yang invasif.</li>
          <li><strong>Pihak Ketiga:</strong> Kami mungkin membagikan sebagian data identitas dasar kepada mitra (seperti pemilik penginapan atau vendor sewa mobil) semata-mata untuk verifikasi check-in.</li>
          <li><strong>Hak Pengguna:</strong> Anda berhak meminta penghapusan seluruh data pribadi Anda dari server kami kapan saja setelah perjalanan Anda selesai, dengan menghubungi tim support kami di privacy@glow.id.</li>
        </ul>
        <p>Kebijakan ini berlaku efektif sejak pemesanan ini dibuat dan dapat diperbarui secara berkala sesuai regulasi perlindungan data yang berlaku di Indonesia.</p>
      </div>
      <button class="btn btn-primary" onclick="closePrivacyAndReopenEdit()" style="display:block;margin:0 auto;border-radius:12px;padding:0.75rem 3rem;font-weight:700;text-align:center;">Saya Mengerti</button>
    </div>
  `;
  const overlay = showModal(content);
  const modalDiv = overlay.querySelector('.modal');
  if (modalDiv) {
    modalDiv.style.maxWidth = '850px';
    modalDiv.style.width = '95vw';
    modalDiv.style.maxHeight = 'none';
    modalDiv.style.overflowY = 'visible';
    modalDiv.style.position = 'relative';
    modalDiv.style.padding = '0';
  }
}

window.checkEditFormStatus = function() {
  const name = document.getElementById('edit-booking-name')?.value;
  const email = document.getElementById('edit-booking-email')?.value;
  const phone = document.getElementById('edit-booking-phone')?.value;
  const confirm = document.getElementById('edit-booking-confirm')?.checked;
  const btn = document.getElementById('btn-save-edit-profile');
  const missingText = document.getElementById('missing-info-text');
  
  if (!btn) return;
  
  const nameRegex = /^[A-Za-z\s.\-']+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneCharRegex = /^[0-9\+\-\s()]*$/;
  const phoneLengthRegex = /^[0-9\+\-\s()]{8,20}$/;
  
  let missing = [];
  if (!name || !nameRegex.test(name)) missing.push("Nama");
  if (!email || !emailRegex.test(email)) missing.push("Email");
  if (!phone || !phoneCharRegex.test(phone) || !phoneLengthRegex.test(phone)) missing.push("WhatsApp");
  if (!confirm) missing.push("Centang Konfirmasi");

  const isValid = missing.length === 0;
                  
  if (isValid) {
    btn.disabled = false;
    btn.style.backgroundColor = '#f59e0b';
    btn.style.color = '#fff';
    btn.style.animation = 'pulse-yellow 2s infinite';
    btn.onmouseover = function() { this.style.backgroundColor='#d97706'; this.style.transform='translateY(-2px)'; this.style.animation='none'; this.style.boxShadow='0 8px 20px rgba(245,158,11,0.25)' };
    btn.onmouseout = function() { this.style.backgroundColor='#f59e0b'; this.style.transform='translateY(0)'; this.style.animation='pulse-yellow 2s infinite'; };
    if (missingText) { missingText.innerHTML = "Data sudah lengkap, siap disimpan!"; missingText.style.color = '#f59e0b'; }
  } else {
    btn.disabled = true;
    btn.style.backgroundColor = 'var(--gray-200)';
    btn.style.color = 'var(--gray-500)';
    btn.style.boxShadow = 'none';
    btn.style.transform = 'none';
    btn.style.animation = 'none';
    btn.onmouseover = null;
    btn.onmouseout = null;
    if (missingText) { missingText.innerHTML = "Mohon lengkapi: " + missing.join(", "); missingText.style.color = '#f59e0b'; }
  }
}

window.togglePasswordVisibility = function(btnId, inputId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"></path></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
}

window.checkAccountChanges = function() {
  const nameInput = document.getElementById('acc-name');
  const emailInput = document.getElementById('acc-email');
  const pwdInput = document.getElementById('acc-pwd');
  const btn = document.getElementById('acc-save-btn');
  const text = document.getElementById('acc-changes-text');
  
  if (!nameInput || !emailInput || !pwdInput || !btn) return;
  
  const changes = [];
  if (nameInput.value !== State.user.fullName) changes.push('Nama Lengkap');
  if (emailInput.value !== State.user.email) changes.push('Alamat Email');
  if (pwdInput.value !== '********' && pwdInput.value !== '') changes.push('Kata Sandi');
  
  if (changes.length > 0) {
    btn.disabled = false;
    btn.style.backgroundColor = 'var(--green)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
    text.style.display = 'block';
    text.innerHTML = 'Ada perubahan pada: ' + changes.join(', ');
  } else {
    btn.disabled = true;
    btn.style.backgroundColor = 'var(--gray-300)';
    btn.style.color = 'var(--gray-500)';
    btn.style.cursor = 'not-allowed';
    btn.style.boxShadow = 'none';
    text.style.display = 'none';
  }
}

window.executeSaveAccountInfo = function(e) {
  e.preventDefault();
  const btn = document.getElementById('acc-save-btn');
  const nameInput = document.getElementById('acc-name');
  const emailInput = document.getElementById('acc-email');
  const pwdInput = document.getElementById('acc-pwd');
  
  if (pwdInput.value !== '********' && pwdInput.value !== '') {
    if (pwdInput.value.length < 6) {
      alert("Kata sandi baru minimal 6 karakter.");
      return;
    }
  }
  
  btn.innerText = 'Menyimpan...';
  
  setTimeout(() => {
    btn.innerText = 'Simpan Perubahan';
    State.user.fullName = nameInput.value;
    State.user.email = emailInput.value;
    
    if (pwdInput.value !== '********' && pwdInput.value !== '') {
      // Mock save password
      pwdInput.type = 'password';
      document.getElementById('btn-toggle-acc-pwd').innerHTML = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
    
    pwdInput.value = '********'; // reset to placeholder after saving
    
    checkAccountChanges();
    showToast('Informasi login berhasil diperbarui!');
    
    // Refresh sidebar name
    const sidebarName = document.querySelector('.dashboard-sidebar div[style*="font-weight:800"]');
    if (sidebarName) sidebarName.innerText = State.user.fullName;
    
    // Automatically exit edit mode on successful save
    if (window.isAccountEditMode) {
      toggleAccountEditMode();
    }
  }, 1000);
}

window.toggleAccountEditMode = function() {
  window.isAccountEditMode = !window.isAccountEditMode;
  const isEdit = window.isAccountEditMode;
  
  const btn = document.getElementById('acc-edit-mode-btn');
  const btnText = document.getElementById('acc-edit-mode-text');
  const nameInput = document.getElementById('acc-name');
  const emailInput = document.getElementById('acc-email');
  const pwdInput = document.getElementById('acc-pwd');
  const pwdToggleBtn = document.getElementById('btn-toggle-acc-pwd');
  
  if (isEdit) {
    btn.style.backgroundColor = 'var(--green)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--green)';
    btnText.innerText = 'Batal Ubah';
    
    [nameInput, emailInput, pwdInput].forEach(el => {
      el.removeAttribute('readonly');
      el.style.background = '#fff';
      el.style.color = 'var(--gray-900)';
      el.style.cursor = 'text';
      if (el.id === 'acc-pwd') el.style.letterSpacing = 'normal';
    });
    
    // clear placeholder password when editing begins
    if (pwdInput.value === '********') pwdInput.value = '';
    pwdToggleBtn.style.display = 'flex';
    if(document.getElementById('acc-save-btn')) document.getElementById('acc-save-btn').style.display = 'block';
  } else {
    btn.style.backgroundColor = 'transparent';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    btnText.innerText = 'Mode Ubah';
    
    [nameInput, emailInput, pwdInput].forEach(el => {
      el.setAttribute('readonly', 'true');
      el.style.background = 'var(--gray-50)';
      el.style.color = 'var(--gray-500)';
      el.style.cursor = 'not-allowed';
      if (el.id === 'acc-pwd') el.style.letterSpacing = '0.25rem';
    });
    
    // reset values when cancelling
    nameInput.value = State.user.fullName;
    emailInput.value = State.user.email;
    pwdInput.value = '********';
    pwdInput.type = 'password';
    pwdToggleBtn.innerHTML = `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    pwdToggleBtn.style.display = 'none';
    if(document.getElementById('acc-save-btn')) document.getElementById('acc-save-btn').style.display = 'none';
    
    checkAccountChanges();
  }
}

window.deleteSavedPackageDashboard = async function(idx) {
  if (confirm('Apakah Anda yakin ingin menghapus rancangan paket ini?')) {
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
    renderUserTab('saved-packages');
    showToast('Paket berhasil dihapus dari daftar tersimpan.');
  }
};

window.viewSavedPackageDetailDashboard = function(idx) {
  const container = document.getElementById(`saved-package-details-${idx}`);
  if (!container) return;
  
  if (container.style.display === 'block') {
    // Animasi Menutup
    container.style.overflow = 'hidden';
    container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    container.style.opacity = '0';
    container.style.transform = 'translateY(-10px)';
    container.style.maxHeight = '0px';
    
    setTimeout(() => {
      container.style.display = 'none';
      container.innerHTML = '';
      
      // Reset style
      container.style.transition = '';
      container.style.opacity = '';
      container.style.transform = '';
      container.style.maxHeight = '';
      container.style.overflow = '';
    }, 300);
    return;
  }
  
  const p = State.savedPackages[idx];
  if (!p) return;
  
  const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');
  
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
  
  container.innerHTML = `
    <div style="background:var(--white); border:1px solid var(--gray-200); border-radius:16px; padding:2rem; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
      <div style="position:relative;height:250px;border-radius:12px;overflow:hidden;margin-bottom:2rem;">
        <img src="${coverImg}" style="width:100%;height:100%;object-fit:cover;" alt="Cover">
        <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8));"></div>
        <button onclick="window.viewSavedPackageDetailDashboard(${idx})" style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.2);backdrop-filter:blur(4px);border:none;width:32px;height:32px;border-radius:50%;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path></svg>
        </button>
        <div style="position:absolute;bottom:1.5rem;left:1.5rem;right:1.5rem;color:white;">
          <div style="background:var(--green);color:white;display:inline-block;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:700;margin-bottom:0.5rem;">${p.nights} Malam</div>
          <h2 style="font-size:1.75rem;font-weight:800;font-family:'Playfair Display', serif;margin-bottom:0.25rem;line-height:1.2;">${p.name || 'Paket Tanpa Nama'}</h2>
        </div>
      </div>
      
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:1.5rem;border-bottom:1px solid var(--gray-200);margin-bottom:2rem;">
        <div>
          <h4 style="font-weight:800;font-size:1.25rem;color:var(--gray-900);margin-bottom:0.25rem;">Rincian Lokasi & Layanan</h4>
          <p style="font-size:0.875rem;color:var(--gray-500);margin:0;">Rincian lengkap rancangan workation Anda.</p>
        </div>
      </div>
      
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

window.viewBookingInvoiceFromHistory = function(id) {
  if (!window._dashboardBookings) return;
  const booking = window._dashboardBookings.find(b => b.id.toString() === id.toString());
  if (!booking) {
    alert("Data pesanan tidak ditemukan.");
    return;
  }
  
  const container = document.getElementById(`booking-details-${id}`);
  if (!container) return;
  
  if (container.style.display === 'block' && container.dataset.viewType === 'invoice') {
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
  
  let invoiceHtml = '';
  if (window.generateProfessionalInvoiceHTML) {
    invoiceHtml = window.generateProfessionalInvoiceHTML(booking);
  }
  
  container.innerHTML = `
    <div style="background:var(--white); border:1px solid var(--gray-200); border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
      <div style="background:var(--gray-50); padding:1rem 1.5rem; border-bottom:1px solid var(--gray-200); display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:700; color:var(--gray-700);">Invoice Pemesanan</div>
        <div style="display:flex;gap:0.5rem">
           <button class="btn btn-outline btn-sm" onclick="window.printInvoice()" style="padding:0.35rem 0.75rem;font-size:0.8rem;display:flex;align-items:center;gap:0.25rem;">
             <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg> Cetak PDF
           </button>
           <button class="btn btn-ghost btn-sm" onclick="window.viewBookingInvoiceFromHistory('${id}')" style="padding:0.35rem;color:var(--gray-500);">
             <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>
        </div>
      </div>
      <div style="padding:1rem;">
        ${invoiceHtml}
      </div>
    </div>
  `;
  container.dataset.viewType = 'invoice';
  
  container.style.display = 'block';
  container.style.overflow = 'hidden';
  container.style.maxHeight = '0px';
  container.style.opacity = '0';
  container.style.transform = 'translateY(-10px)';
  container.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  
  container.getBoundingClientRect();
  
  const fullHeight = container.scrollHeight;
  container.style.maxHeight = (fullHeight + 200) + 'px';
  container.style.opacity = '1';
  container.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';
  }, 350);
};
