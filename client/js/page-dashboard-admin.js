function renderDashboardAdmin() {
  const container = el('div', 'dashboard-layout fade-in');
  
  const sidebar = el('div', 'dashboard-sidebar');
  sidebar.innerHTML = `
    <div style="margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--gray-200); text-align:center;">
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(State.user.fullName)}&background=10b981&color=fff&rounded=true&size=64" alt="Profile" style="width:64px;height:64px;border-radius:50%;margin-bottom:1rem;border:3px solid var(--green);box-shadow:0 4px 12px rgba(15,118,110,0.2)" />
      <div style="font-weight:800; font-size:1.1rem; color:var(--gray-900); margin-bottom:0.25rem;">${State.user.fullName}</div>
      <div style="font-size:0.75rem; font-weight:700; color:var(--green); display:inline-block; padding:4px 12px; border-radius:100px; background:rgba(15,118,110,0.1); border:1px solid rgba(15,118,110,0.2);">ROLE: ${State.user.role}</div>
    </div>
    <ul class="sidebar-nav" style="flex:1; display:flex; flex-direction:column;">
      <li><a class="sidebar-item active" id="nav-overview" onclick="renderAdminTab('overview')">Overview</a></li>
      <li><a class="sidebar-item" id="nav-approval" onclick="renderAdminTab('approval')">Persetujuan Mitra</a></li>
      <li><a class="sidebar-item" id="nav-users" onclick="renderAdminTab('users')">Kelola User</a></li>
      <li><a class="sidebar-item" id="nav-locations" onclick="renderAdminTab('locations')">Kelola Location</a></li>
      <li style="margin-top:auto; padding-top:2rem;"><a class="sidebar-item" style="color:#ef4444; background:rgba(239,68,68,0.1); border-radius:8px; text-align:center; font-weight:700; transition:all 0.2s; cursor:pointer;" onclick="AuthService.logout()" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444';">Logout</a></li>
    </ul>
  `;
  
  const content = el('div', 'dashboard-content');
  content.id = 'admin-content';
  
  container.appendChild(sidebar);
  container.appendChild(content);

  // Initial load
  setTimeout(() => renderAdminTab('overview'), 0);

  return container;
}

window.renderAdminTab = async (tab, data = null) => {
  const content = document.getElementById('admin-content');
  if (!content) return;

  // Update active state in sidebar
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  // user-detail doesn't have its own nav button, we keep 'users' active
  const activeTabId = tab === 'user-detail' ? 'users' : tab;
  const activeNav = document.getElementById('nav-' + activeTabId);
  if (activeNav) activeNav.classList.add('active');

  if (tab === 'overview') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Overview</h1>
        <p>Ringkasan performa platform GLOW.</p>
      </div>
      <div id="admin-stats-container">Memuat data...</div>
    `;
    try {
      const stats = await AdminService.getStats();
      document.getElementById('admin-stats-container').innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
          <div class="dashboard-card" style="text-align:center">
            <div style="font-size:2.5rem;font-weight:800;color:var(--green)">${stats.totalUsers}</div>
            <div style="color:var(--gray-500);font-size:0.875rem">Total User</div>
          </div>
          <div class="dashboard-card" style="text-align:center">
            <div style="font-size:2.5rem;font-weight:800;color:var(--green)">${stats.totalOwners}</div>
            <div style="color:var(--gray-500);font-size:0.875rem">Total Mitra (Owner)</div>
          </div>
          <div class="dashboard-card" style="text-align:center">
            <div style="font-size:2.5rem;font-weight:800;color:var(--green)">${stats.totalLocations}</div>
            <div style="color:var(--gray-500);font-size:0.875rem">Total Lokasi</div>
          </div>
          <div class="dashboard-card" style="text-align:center">
            <div style="font-size:2.5rem;font-weight:800;color:var(--green)">${stats.totalBookings}</div>
            <div style="color:var(--gray-500);font-size:0.875rem">Total Transaksi</div>
          </div>
        </div>
        <div class="dashboard-card" style="text-align:center; padding:3rem 2rem;">
          <h2 style="font-size:1.25rem;color:var(--gray-600);margin-bottom:0.5rem">Total Pendapatan</h2>
          <div style="font-size:3rem;font-weight:800;color:var(--gray-900)">Rp ${parseFloat(stats.revenue).toLocaleString('id-ID')}</div>
        </div>
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-top: 2rem;">
          <div class="dashboard-card" style="padding: 1.5rem">
            <h3 style="font-weight:700; margin-bottom:1rem; color:var(--gray-800)">Pendapatan Platform Keseluruhan (${new Date().getFullYear()})</h3>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas id="adminMonthlyChart"></canvas>
            </div>
          </div>
          <div class="dashboard-card" style="padding: 1.5rem">
            <h3 style="font-weight:700; margin-bottom:1rem; color:var(--gray-800)">Distribusi Status Transaksi</h3>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas id="adminStatusChart"></canvas>
            </div>
          </div>
        </div>
      `;

      // Render Charts
      setTimeout(() => {
        const ctxMonthly = document.getElementById('adminMonthlyChart');
        if (ctxMonthly && stats.monthlyRevenue) {
          new Chart(ctxMonthly, {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
              datasets: [{
                label: 'Total Transaksi Platform (Rp)',
                data: stats.monthlyRevenue,
                borderColor: '#0f766e',
                backgroundColor: 'rgba(15, 118, 110, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
          });
        }

        const ctxStatus = document.getElementById('adminStatusChart');
        if (ctxStatus && stats.bookingsByStatus) {
          const s = stats.bookingsByStatus;
          new Chart(ctxStatus, {
            type: 'pie',
            data: {
              labels: ['Selesai', 'Dikonfirmasi', 'Menunggu', 'Dibatalkan'],
              datasets: [{
                data: [s.COMPLETED, s.CONFIRMED, s.PENDING, s.CANCELLED],
                backgroundColor: ['#10b981', '#3b82f6', '#fbbf24', '#ef4444'],
                borderWidth: 0
              }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
          });
        }
      }, 100);
    } catch(e) {
      document.getElementById('admin-stats-container').innerHTML = `<div style="color:red">Gagal memuat statistik.</div>`;
    }
  } else if (tab === 'approval') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Persetujuan Mitra</h1>
        <p>Kelola permintaan pendaftaran mitra baru GLOW.</p>
      </div>
      <div id="approval-list">Memuat data...</div>
    `;

    try {
      const businesses = await AdminService.getPendingBusinesses();
      const list = document.getElementById('approval-list');
      
      if (businesses.length === 0) {
        list.innerHTML = `<div class="dashboard-card" style="text-align:center;padding:3rem">Tidak ada permintaan menunggu persetujuan.</div>`;
        return;
      }

      list.innerHTML = businesses.map(b => `
        <div class="dashboard-card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <div>
            <h3 style="font-weight:700;margin-bottom:0.25rem">${b.businessName}</h3>
            <p style="font-size:0.875rem;color:var(--gray-500)">Pemilik: ${b.user.fullName} (${b.user.email})</p>
          </div>
          <div style="display:flex;gap:0.5rem">
            <button onclick="handleApproval(${b.id}, 'VERIFIED')" style="background:var(--green);color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:600">Terima</button>
            <button onclick="handleApproval(${b.id}, 'REJECTED')" style="background:var(--red);color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:600">Tolak</button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      document.getElementById('approval-list').innerHTML = `<div style="color:var(--red)">Gagal memuat data.</div>`;
    }
  } else if (tab === 'users') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Kelola User</h1>
        <p>Manajemen pengguna dan mitra platform GLOW.</p>
      </div>

      <!-- Tabel Daftar Mitra (OWNER) -->
      <h3 style="margin-bottom:1rem; color:var(--gray-700)">Daftar Mitra (Owner)</h3>
      <div class="dashboard-card" style="margin-bottom:2rem">
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--gray-200); text-align:left;">
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem;">NAMA</th>
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem;">EMAIL</th>
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem;">ROLE</th>
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem; text-align:right">AKSI</th>
              </tr>
            </thead>
            <tbody id="admin-owners-tbody">
              <tr><td colspan="4" style="padding:2rem; text-align:center;">Memuat data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabel Daftar User Biasa -->
      <h3 style="margin-bottom:1rem; color:var(--gray-700)">Daftar Pengguna Biasa</h3>
      <div class="dashboard-card">
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--gray-200); text-align:left;">
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem;">NAMA</th>
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem;">EMAIL</th>
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem;">ROLE</th>
                <th style="padding:1rem; color:var(--gray-500); font-size:0.875rem; text-align:right">AKSI</th>
              </tr>
            </thead>
            <tbody id="admin-users-tbody">
              <tr><td colspan="4" style="padding:2rem; text-align:center;">Memuat data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    try {
      const users = await AdminService.getUsers();
      
      const owners = users.filter(u => u.role === 'OWNER');
      const regularUsers = users.filter(u => u.role === 'USER');

      const tbodyOwners = document.getElementById('admin-owners-tbody');
      tbodyOwners.innerHTML = owners.map(u => `
        <tr style="border-bottom:1px solid var(--gray-100)">
          <td style="padding:1rem; font-weight:600;">${u.fullName}</td>
          <td style="padding:1rem; color:var(--gray-600);">${u.email}</td>
          <td style="padding:1rem;"><span style="font-weight:700; color:var(--green); background:rgba(15,118,110,0.1); padding:4px 8px; border-radius:4px; font-size:0.75rem;">MITRA</span></td>
          <td style="padding:1rem; text-align:right;">
            <button onclick="renderAdminTab('user-detail', ${u.id})" style="background:var(--gray-100); color:var(--gray-700); border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600; margin-right:4px;">Detail</button>
            <button onclick="deleteUser(${u.id})" style="background:#fee2e2; color:var(--red); border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600;">Hapus</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="4" style="padding:2rem; text-align:center; color:var(--gray-500)">Tidak ada Mitra terdaftar.</td></tr>';

      const tbodyUsers = document.getElementById('admin-users-tbody');
      tbodyUsers.innerHTML = regularUsers.map(u => `
        <tr style="border-bottom:1px solid var(--gray-100)">
          <td style="padding:1rem; font-weight:600;">${u.fullName}</td>
          <td style="padding:1rem; color:var(--gray-600);">${u.email}</td>
          <td style="padding:1rem;">
            <span style="font-weight:600; color:var(--gray-600); background:var(--gray-100); padding:4px 8px; border-radius:4px; font-size:0.75rem;">USER</span>
          </td>
          <td style="padding:1rem; text-align:right;">
            <button onclick="renderAdminTab('user-detail', ${u.id})" style="background:var(--gray-100); color:var(--gray-700); border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600; margin-right:4px;">Detail</button>
            <button onclick="deleteUser(${u.id})" style="background:#fee2e2; color:var(--red); border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:600;">Hapus</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="4" style="padding:2rem; text-align:center; color:var(--gray-500)">Tidak ada Pengguna terdaftar.</td></tr>';

    } catch(e) {
      console.error(e);
      fetch((window.API_BASE_URL || 'http://localhost:3001/api') + '/log', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ error: e.message, stack: e.stack }) }).catch(()=>{});
      document.getElementById('admin-owners-tbody').innerHTML = `<tr><td colspan="4" style="padding:2rem; text-align:center; color:red;">Gagal memuat pengguna: ${e.message}</td></tr>`;
      document.getElementById('admin-users-tbody').innerHTML = `<tr><td colspan="4" style="padding:2rem; text-align:center; color:red;">Gagal memuat pengguna.</td></tr>`;
    }
  } else if (tab === 'user-detail') {
    const id = data;
    content.innerHTML = `
      <div class="dashboard-header" style="display:flex; align-items:center; gap:1rem;">
        <button onclick="renderAdminTab('users')" style="background:var(--gray-100); color:var(--gray-600); border:none; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:0.5rem;">
          ← Kembali
        </button>
        <div>
          <h1 style="margin:0;">Detail Pengguna</h1>
          <p style="margin:0;">Informasi komprehensif profil dan aktivitas pengguna.</p>
        </div>
      </div>
      <div id="user-detail-container" style="padding:2rem; text-align:center; color:var(--gray-500);">Memuat data pengguna...</div>
    `;

    try {
      const response = await AdminService.getUserDetails(id);
      const user = response.user;
      const ownerStats = response.ownerStats;
      const container = document.getElementById('user-detail-container');
      if (!container) return;

      // Inject local mocks for demo consistency
      const localMockStr = localStorage.getItem('glow_mock_bookings');
      if (localMockStr) {
        let localMocks = JSON.parse(localMockStr);
        let userMocks = localMocks.filter(m => String(m.userId) === String(user.id) || !m.userId);
        if (!user.bookings) user.bookings = [];
        user.bookings = user.bookings.concat(userMocks);
      }

      const joinDate = new Date(user.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
      
      container.style.padding = '0';
      container.style.textAlign = 'left';

      if (user.role === 'OWNER' && ownerStats) {
        // --- TAMPILAN MITRA (OWNER) ---
        
        const locRows = ownerStats.locationStats.map(loc => `
          <tr style="border-bottom:1px solid var(--gray-100)">
            <td style="padding:1rem; font-weight:600;">${loc.name}</td>
            <td style="padding:1rem; color:var(--gray-500);">${loc.category}</td>
            <td style="padding:1rem; text-align:center;"><span style="background:var(--gray-100); padding:4px 8px; border-radius:4px; font-weight:600; font-size:0.8rem;">${loc.bookingsCount}</span></td>
            <td style="padding:1rem; text-align:right; font-weight:700; color:var(--green);">Rp ${loc.revenue.toLocaleString('id-ID')}</td>
          </tr>
        `).join('') || '<tr><td colspan="4" style="padding:1rem; text-align:center; color:var(--gray-500);">Belum ada lokasi atau pesanan.</td></tr>';

        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:2rem;">
            <!-- Profil Singkat & Summary Cards -->
            <div style="display:grid; grid-template-columns: 1fr 2fr; gap:2rem;">
              
              <div class="dashboard-card" style="margin:0; display:flex; flex-direction:column; align-items:center; text-align:center; justify-content:center;">
                <div style="width:80px; height:80px; background:var(--green); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:700; margin-bottom:1rem;">
                  ${user.fullName.charAt(0).toUpperCase()}
                </div>
                <h3 style="margin:0; font-size:1.2rem; font-weight:700; color:var(--gray-800);">${user.fullName}</h3>
                <div style="color:var(--gray-500); font-size:0.9rem; margin-bottom:0.5rem;">${user.email}</div>
                <span style="font-weight:700; padding:4px 10px; border-radius:6px; font-size:0.75rem; background:rgba(15,118,110,0.1); color:var(--green);">MITRA</span>
                <div style="margin-top:1rem; font-size:0.8rem; color:var(--gray-500);">Bergabung: ${joinDate}</div>
              </div>
              
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem;">
                <div class="dashboard-card" style="margin:0; background:linear-gradient(135deg, var(--green), #0d9488); color:white;">
                  <div style="font-size:0.9rem; opacity:0.9; margin-bottom:0.5rem;">Total Pendapatan Bersih</div>
                  <div style="font-size:1.8rem; font-weight:800;">Rp ${ownerStats.totalRevenue.toLocaleString('id-ID')}</div>
                </div>
                <div class="dashboard-card" style="margin:0;">
                  <div style="font-size:0.9rem; color:var(--gray-500); margin-bottom:0.5rem;">Total Pesanan Selesai</div>
                  <div style="font-size:1.8rem; font-weight:800; color:var(--gray-800);">${ownerStats.totalBookings}</div>
                </div>
                <div class="dashboard-card" style="margin:0;">
                  <div style="font-size:0.9rem; color:var(--gray-500); margin-bottom:0.5rem;">Total Lokasi Dikelola</div>
                  <div style="font-size:1.8rem; font-weight:800; color:var(--gray-800);">${ownerStats.totalLocations}</div>
                </div>
              </div>
              
            </div>

            <!-- Grafik Tren Pendapatan -->
            <div class="dashboard-card" style="margin:0;">
              <h3 style="font-size:1.1rem; font-weight:700; color:var(--gray-800); margin-bottom:1.5rem;">Tren Pendapatan Bulanan</h3>
              <div style="width:100%; height:300px;">
                <canvas id="mitraRevenueChart"></canvas>
              </div>
            </div>
            
            <!-- Tabel Kinerja Lokasi -->
            <div class="dashboard-card" style="margin:0;">
              <h3 style="font-size:1.1rem; font-weight:700; color:var(--gray-800); margin-bottom:1.5rem;">Kinerja Per Lokasi</h3>
              <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                  <thead>
                    <tr style="background:var(--gray-50); color:var(--gray-500); text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; text-align:left;">
                      <th style="padding:1rem; font-weight:600;">Nama Lokasi</th>
                      <th style="padding:1rem; font-weight:600;">Kategori</th>
                      <th style="padding:1rem; font-weight:600; text-align:center;">Pesanan Selesai</th>
                      <th style="padding:1rem; font-weight:600; text-align:right;">Pendapatan (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${locRows}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;

        // Render Grafik dengan Chart.js
        setTimeout(() => {
          const ctx = document.getElementById('mitraRevenueChart');
          if (ctx && window.Chart) {
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [{
                  label: 'Pendapatan Bersih (Rp)',
                  data: ownerStats.monthlyRevenue,
                  borderColor: '#0f766e',
                  backgroundColor: 'rgba(15,118,110,0.1)',
                  borderWidth: 2,
                  pointBackgroundColor: '#0f766e',
                  pointRadius: 4,
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'Rp ' + (value/1000) + 'K';
                      }
                    }
                  }
                }
              }
            });
          }
        }, 100);

      } else {
        // --- TAMPILAN USER BIASA ---
        
        const bookingRows = (user.bookings && user.bookings.length > 0) ? user.bookings.map(b => `
          <div style="padding:1rem; border:1px solid var(--gray-200); border-radius:8px; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; background:white;">
            <div>
              <div style="font-weight:700; margin-bottom:0.25rem; font-size:1rem;">${b.package?.name || b.package?.packageName || 'Paket Workation'}</div>
              <div style="font-size:0.875rem; color:var(--gray-500);">${(b.location && b.location.name) ? b.location.name : (b.package?.location?.name || 'GLOW Network')} • ${new Date(b.createdAt || b.startDate).toLocaleDateString('id-ID')}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:700; color:var(--green); margin-bottom:0.25rem; font-size:1rem;">Rp ${Number(b.totalPrice).toLocaleString('id-ID')}</div>
              <span style="font-size:0.75rem; font-weight:600; padding:4px 8px; border-radius:4px; background:${b.status==='COMPLETED'||b.status==='PAID'?'rgba(15,118,110,0.1)':'var(--gray-100)'}; color:${b.status==='COMPLETED'||b.status==='PAID'?'var(--green)':'var(--gray-600)'};">${b.status}</span>
            </div>
          </div>
        `).join('') : '<div style="color:var(--gray-500); font-size:0.875rem; padding:1.5rem; text-align:center; background:var(--gray-50); border-radius:8px; border:1px dashed var(--gray-300);">Belum ada riwayat booking.</div>';
        
        const savedRows = (user.savedPackages && user.savedPackages.length > 0) ? user.savedPackages.map(p => `
          <div style="padding:1rem; border:1px solid var(--gray-200); border-radius:8px; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center; background:white;">
            <span style="font-weight:600; font-size:0.875rem;">${p.name}</span>
            <span style="font-size:0.75rem; color:var(--gray-500);">${new Date(p.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
        `).join('') : '<div style="color:var(--gray-500); font-size:0.875rem; text-align:center; padding:1.5rem; border:1px dashed var(--gray-300); border-radius:8px; background:var(--gray-50);">Tidak ada paket tersimpan.</div>';

        container.innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem; align-items:start;">
            
            <div style="display:flex; flex-direction:column; gap:2rem;">
              <div class="dashboard-card" style="margin:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gray-100); padding-bottom:1rem; margin-bottom:1.5rem;">
                  <h3 style="font-size:1.1rem; font-weight:700; color:var(--gray-800); margin:0;">Informasi Dasar</h3>
                  <span style="font-size:0.75rem; color:var(--gray-500);">Bergabung sejak ${joinDate}</span>
                </div>
                <div style="display:grid; grid-template-columns: 100px 1fr; gap:1rem; font-size:0.9rem;">
                  <div style="color:var(--gray-500);">Nama</div>
                  <div style="font-weight:600; color:var(--gray-800);">${user.fullName}</div>
                  <div style="color:var(--gray-500);">Email</div>
                  <div style="font-weight:600; color:var(--gray-800);">${user.email}</div>
                  <div style="color:var(--gray-500);">Role</div>
                  <div>
                    <span style="font-weight:700; padding:4px 10px; border-radius:6px; font-size:0.75rem; background:var(--gray-100); color:var(--gray-600);">${user.role}</span>
                  </div>
                </div>
              </div>
              
              ${user.userProfile ? `
              <div class="dashboard-card" style="margin:0;">
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--gray-800); margin-bottom:1.5rem; border-bottom:1px solid var(--gray-100); padding-bottom:1rem;">Profil Lengkap</h3>
                <div style="display:grid; grid-template-columns: 120px 1fr; gap:1rem; font-size:0.9rem;">
                  <div style="color:var(--gray-500);">Telepon</div>
                  <div style="font-weight:600; color:var(--gray-800);">${user.userProfile.phoneNumber || '-'}</div>
                  <div style="color:var(--gray-500);">Alamat</div>
                  <div style="font-weight:600; color:var(--gray-800); line-height:1.5;">${user.userProfile.address || '-'}</div>
                  <div style="color:var(--gray-500);">Identitas</div>
                  <div style="font-weight:600; color:var(--gray-800);">${user.userProfile.identityNumber || '-'}</div>
                  <div style="color:var(--gray-500);">Kontak Darurat</div>
                  <div style="font-weight:600; color:var(--gray-800);">${user.userProfile.emergencyContact || '-'}</div>
                </div>
              </div>
              ` : ''}

              <div class="dashboard-card" style="margin:0;">
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--gray-800); margin-bottom:1.5rem; border-bottom:1px solid var(--gray-100); padding-bottom:1rem;">Paket Kustom Tersimpan</h3>
                <div style="display:flex; flex-direction:column;">
                  ${savedRows}
                </div>
              </div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:2rem;">
              <div class="dashboard-card" style="margin:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gray-100); padding-bottom:1rem; margin-bottom:1.5rem;">
                  <h3 style="font-size:1.1rem; font-weight:700; color:var(--gray-800); margin:0;">Riwayat Booking</h3>
                  <span style="font-weight:700; color:var(--green); background:rgba(15,118,110,0.1); padding:4px 10px; border-radius:6px; font-size:0.8rem;">${user.bookings ? user.bookings.length : 0} Total</span>
                </div>
                <div style="display:flex; flex-direction:column; max-height:600px; overflow-y:auto; padding-right:0.5rem;" class="custom-scrollbar">
                  ${bookingRows}
                </div>
              </div>
            </div>
            
          </div>
        `;
      }
    } catch (error) {
      console.error(error);
      const container = document.getElementById('user-detail-container');
      if (container) container.innerHTML = `<div style="padding:2rem; text-align:center; color:red;">Gagal mengambil data detail pengguna: ${error.message}</div>`;
    }
  } else if (tab === 'locations') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Kelola Location</h1>
        <p>Awasi dan kelola semua lokasi wisata / penginapan.</p>
      </div>
      <div id="admin-locations-container">Memuat data...</div>
    `;
    try {
      const locations = await AdminService.getAllLocations();
      const cont = document.getElementById('admin-locations-container');
      if(locations.length === 0) {
        cont.innerHTML = `<div class="dashboard-card" style="text-align:center;padding:3rem">Belum ada lokasi terdaftar.</div>`;
        return;
      }
      cont.innerHTML = locations.map(l => `
        <div class="dashboard-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; opacity:${l.isPublished?1:0.6}">
          <div style="display:flex; gap:1.5rem; align-items:center;">
            <img src="${(l.img && l.img.startsWith('/uploads/')) ? (window.API_BASE_URL ? window.API_BASE_URL.replace('/api','') : 'http://localhost:3001') + l.img : (l.img || 'https://via.placeholder.com/100')}" onerror="this.src='https://via.placeholder.com/100?text=No+Image'" style="width:100px; height:100px; object-fit:cover; border-radius:8px;" />
            <div>
              <h3 style="font-weight:700; margin-bottom:0.25rem;">${l.name}</h3>
              <div style="font-size:0.875rem; color:var(--gray-500); margin-bottom:0.25rem;">${l.category || 'Location'} • ${l.business?.user?.fullName || 'Unknown Owner'}</div>
              <div style="font-size:0.75rem; font-weight:700; color:${l.isPublished ? 'var(--green)' : 'var(--gray-500)'}">${l.isPublished ? 'PUBLISHED' : 'HIDDEN'}</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.5rem; text-align:right;">
            <button onclick="toggleLocationPublish(${l.id})" class="btn btn-outline" style="padding:0.5rem; font-size:0.75rem;">
              ${l.isPublished ? 'Sembunyikan' : 'Tampilkan'}
            </button>
            <button onclick="deleteLocation(${l.id})" class="btn btn-ghost" style="padding:0.5rem; font-size:0.75rem; color:var(--red);">Hapus Lokasi</button>
          </div>
        </div>
      `).join('');
    } catch(e) {
      document.getElementById('admin-locations-container').innerHTML = `<div style="color:red">Gagal memuat lokasi.</div>`;
    }
  }
};

window.handleApproval = async (businessId, status) => {
  if (!confirm(`Apakah Anda yakin ingin ${status === 'VERIFIED' ? 'menerima' : 'menolak'} mitra ini?`)) return;
  try {
    await AdminService.updateBusinessStatus(businessId, status);
    showToast(`Mitra berhasil ${status === 'VERIFIED' ? 'diterima' : 'ditolak'}.`);
    renderAdminTab('approval');
  } catch (error) {
    showToast(error.message);
  }
};

window.changeUserRole = async (userId, newRole) => {
  if (!confirm(`Ubah role pengguna ini menjadi ${newRole}?`)) {
    renderAdminTab('users');
    return;
  }
  try {
    await AdminService.updateUserRole(userId, newRole);
    showToast('Role berhasil diubah.');
    renderAdminTab('users');
  } catch (error) {
    showToast(error.message);
  }
};

window.deleteUser = async (userId) => {
  if (!confirm('Peringatan: Menghapus pengguna ini akan menghapus semua data terkait. Lanjutkan?')) return;
  try {
    await AdminService.deleteUser(userId);
    showToast('Pengguna berhasil dihapus.');
    renderAdminTab('users');
  } catch (error) {
    showToast(error.message);
  }
};

window.toggleLocationPublish = async (locId) => {
  try {
    await AdminService.toggleLocationPublish(locId);
    renderAdminTab('locations');
  } catch (error) {
    showToast(error.message);
  }
};

window.deleteLocation = async (locId) => {
  if (!confirm('Peringatan: Lokasi akan dihapus permanen. Lanjutkan?')) return;
  try {
    await AdminService.deleteLocation(locId);
    showToast('Lokasi berhasil dihapus.');
    renderAdminTab('locations');
  } catch (error) {
    showToast(error.message);
  }
};
