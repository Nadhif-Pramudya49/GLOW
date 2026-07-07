function renderDashboardOwner() {
  const container = el('div', 'dashboard-layout fade-in');
  
  const sidebar = el('div', 'dashboard-sidebar');
  sidebar.innerHTML = `
    <div style="margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--gray-200); text-align:center;">
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(State.user.fullName)}&background=10b981&color=fff&rounded=true&size=64" alt="Profile" style="width:64px;height:64px;border-radius:50%;margin-bottom:1rem;border:3px solid var(--green);box-shadow:0 4px 12px rgba(15,118,110,0.2)" />
      <div style="font-weight:800; font-size:1.1rem; color:var(--gray-900); margin-bottom:0.25rem;">${State.user.fullName}</div>
      <div style="font-size:0.75rem; font-weight:700; color:var(--green); display:inline-block; padding:4px 12px; border-radius:100px; background:rgba(15,118,110,0.1); border:1px solid rgba(15,118,110,0.2);">ROLE: ${State.user.role}</div>
    </div>
    <ul class="sidebar-nav" style="flex:1; display:flex; flex-direction:column;">
      <li><a class="sidebar-item active" onclick="renderOwnerTab('locations'); document.querySelectorAll('.sidebar-item').forEach(e=>e.classList.remove('active')); this.classList.add('active');">Lokasi Saya</a></li>
      <li><a class="sidebar-item" onclick="renderOwnerTab('bookings'); document.querySelectorAll('.sidebar-item').forEach(e=>e.classList.remove('active')); this.classList.add('active');">Booking</a></li>
      <li><a class="sidebar-item" onclick="renderOwnerTab('stats'); document.querySelectorAll('.sidebar-item').forEach(e=>e.classList.remove('active')); this.classList.add('active');">Statistik</a></li>
      <li><a class="sidebar-item" onclick="renderOwnerTab('reviews'); document.querySelectorAll('.sidebar-item').forEach(e=>e.classList.remove('active')); this.classList.add('active');">Ulasan</a></li>
      <li style="margin-top:auto; padding-top:2rem;"><a class="sidebar-item" style="color:#ef4444; background:rgba(239,68,68,0.1); border-radius:8px; text-align:center; font-weight:700; transition:all 0.2s; cursor:pointer;" onclick="AuthService.logout()" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239,68,68,0.1)'; this.style.color='#ef4444';">Logout</a></li>
    </ul>
  `;
  
  const content = el('div', 'dashboard-content');
  content.id = 'owner-content';
  
  container.appendChild(sidebar);
  container.appendChild(content);

  // Initial load
  setTimeout(() => renderOwnerTab('locations'), 0);

  return container;
}

async function renderOwnerTab(tab) {
  const content = document.getElementById('owner-content');
  if (!content) return;

  if (tab === 'locations') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Lokasi Saya</h1>
        <p>Kelola properti dan lokasi bisnis Anda.</p>
      </div>
      <div id="owner-status-alert"></div>
      <div id="owner-actions" style="margin-bottom:1rem;display:none">
        <button onclick="showAddLocationForm()" style="background:var(--green);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer">+ Tambah Lokasi Baru</button>
      </div>
      <div id="add-location-form-container" style="display:none;margin-bottom:2rem"></div>
      <div id="locations-list" class="grid-3">Memuat lokasi...</div>
    `;

    try {
      const data = await OwnerService.getMyLocations();
      window.ownerLocations = data.locations;
      
      if (data.businessStatus === 'PENDING') {
        document.getElementById('owner-status-alert').innerHTML = `
          <div style="background:var(--gold);color:#fff;padding:1rem;border-radius:8px;margin-bottom:2rem;font-weight:600">
            Akun bisnis Anda sedang menunggu persetujuan Admin. Anda belum bisa menambahkan lokasi baru.
          </div>
        `;
      } else if (data.businessStatus === 'REJECTED') {
        document.getElementById('owner-status-alert').innerHTML = `
          <div style="background:var(--red);color:#fff;padding:1rem;border-radius:8px;margin-bottom:2rem;font-weight:600">
            Pendaftaran bisnis Anda ditolak. Silakan hubungi dukungan.
          </div>
        `;
      } else {
        document.getElementById('owner-actions').style.display = 'block';
      }

      const list = document.getElementById('locations-list');
      if (data.locations.length === 0) {
        list.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;background:#fff;border-radius:8px">Anda belum memiliki lokasi yang terdaftar.</div>`;
      } else {
        list.innerHTML = data.locations.map(loc => `
          <div class="dashboard-card" style="padding:1rem">
            <img src="${loc.img ? 'http://localhost:3001' + loc.img : 'https://placehold.co/400x300'}" alt="${loc.name}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;margin-bottom:1rem">
            <h3 style="font-weight:700;margin-bottom:0.25rem;font-size:1.1rem">${loc.name}</h3>
            <p style="font-size:0.875rem;color:var(--text-sec);margin-bottom:0.5rem">${loc.category}</p>
            <div style="display:flex;gap:0.5rem;margin-top:1rem">
              <button onclick="editLocation(${loc.id})" style="flex:1;background:var(--gray-200);color:var(--gray-800);border:none;padding:6px;border-radius:4px;font-weight:600;cursor:pointer">Edit</button>
              <button onclick="deleteLocation(${loc.id})" style="flex:1;background:#fee2e2;color:#ef4444;border:none;padding:6px;border-radius:4px;font-weight:600;cursor:pointer">Hapus</button>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      document.getElementById('locations-list').innerHTML = `<div style="color:var(--red)">Gagal memuat data.</div>`;
    }
  } else if (tab === 'bookings') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Riwayat Booking</h1>
        <p>Daftar pelanggan yang menyewa lokasi Anda.</p>
      </div>
      <div id="bookings-list">Memuat data...</div>
    `;
    try {
      const bookings = await OwnerService.getOwnerBookings();
      const list = document.getElementById('bookings-list');
      if (bookings.length === 0) {
        list.innerHTML = `<div class="dashboard-card" style="padding:2rem;text-align:center">Belum ada booking.</div>`;
      } else {
        list.innerHTML = bookings.map(b => `
          <div class="dashboard-card" style="padding:1rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center">
            <div>
              <h3 style="font-weight:700;margin-bottom:4px">${b.package.location.name} (${b.package.packageName})</h3>
              <p style="font-size:0.875rem;color:var(--gray-600)">Pemesan: ${b.user.fullName} | Tanggal: ${new Date(b.startDate).toLocaleDateString()}</p>
              ${b.status === 'PENDING' ? `
                <div style="margin-top:0.5rem;display:flex;gap:0.5rem">
                  <button onclick="updateBookingStatus(${b.id}, 'CONFIRMED')" style="background:var(--green);color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;cursor:pointer">Konfirmasi</button>
                  <button onclick="updateBookingStatus(${b.id}, 'CANCELLED')" style="background:#fee2e2;color:#ef4444;border:none;padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;cursor:pointer">Tolak</button>
                </div>
              ` : b.status === 'CONFIRMED' ? `
                <div style="margin-top:0.5rem;display:flex;gap:0.5rem">
                  <button onclick="updateBookingStatus(${b.id}, 'COMPLETED')" style="background:#3b82f6;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;cursor:pointer">Tandai Selesai</button>
                </div>
              ` : ''}
            </div>
            <div style="text-align:right">
              <span style="display:inline-block;padding:4px 8px;border-radius:4px;background:#d1fae5;color:#065f46;font-size:0.75rem;font-weight:700;margin-bottom:4px">${b.status}</span>
              <div style="font-weight:700;color:var(--green)">Rp ${parseFloat(b.totalPrice).toLocaleString('id-ID')}</div>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      document.getElementById('bookings-list').innerHTML = `<div style="color:var(--red)">Gagal memuat booking.</div>`;
    }
  } else if (tab === 'stats') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Statistik Pendapatan</h1>
        <p>Ringkasan performa bisnis Anda.</p>
      </div>
      <div id="stats-content">Memuat data...</div>
    `;
    try {
      const stats = await OwnerService.getOwnerStats();
      document.getElementById('stats-content').innerHTML = `
        <div class="grid-3">
          <div class="dashboard-card" style="padding:2rem;text-align:center">
            <h3 style="color:var(--gray-500);font-size:0.875rem;margin-bottom:0.5rem">Total Lokasi</h3>
            <div style="font-size:2.5rem;font-weight:800;color:var(--green-dark)">${stats.locations}</div>
          </div>
          <div class="dashboard-card" style="padding:2rem;text-align:center">
            <h3 style="color:var(--gray-500);font-size:0.875rem;margin-bottom:0.5rem">Total Booking</h3>
            <div style="font-size:2.5rem;font-weight:800;color:var(--green-dark)">${stats.totalBookings}</div>
          </div>
          <div class="dashboard-card" style="padding:2rem;text-align:center">
            <h3 style="color:var(--gray-500);font-size:0.875rem;margin-bottom:0.5rem">Total Pendapatan</h3>
            <div style="font-size:1.5rem;font-weight:800;color:var(--gold)">Rp ${stats.totalRevenue.toLocaleString('id-ID')}</div>
          </div>
        </div>
      `;
    } catch (error) {
      document.getElementById('stats-content').innerHTML = `<div style="color:var(--red)">Gagal memuat statistik.</div>`;
    }
  } else if (tab === 'reviews') {
    content.innerHTML = `
      <div class="dashboard-header">
        <h1>Ulasan Pelanggan</h1>
        <p>Lihat tanggapan dari pelanggan yang telah berkunjung.</p>
      </div>
      <div id="reviews-list">Memuat ulasan...</div>
    `;
    try {
      const reviews = await OwnerService.getOwnerReviews();
      const list = document.getElementById('reviews-list');
      if (reviews.length === 0) {
        list.innerHTML = `<div class="dashboard-card" style="padding:2rem;text-align:center">Belum ada ulasan.</div>`;
      } else {
        list.innerHTML = reviews.map(r => `
          <div class="dashboard-card" style="padding:1rem;margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
              <h4 style="font-weight:700">${r.booking.user.fullName} <span style="font-weight:400;color:var(--gray-500);font-size:0.875rem">(${r.booking.user.email})</span></h4>
              <span style="color:var(--gold);font-weight:700">★ ${((r.wifiRating + r.workspaceRating + r.ambienceRating) / 3).toFixed(1)}</span>
            </div>
            <p style="font-size:0.875rem;color:var(--green);font-weight:600;margin-bottom:0.5rem">📍 ${r.booking.package.location.name}</p>
            <p style="color:var(--gray-800);line-height:1.5">${r.comment || 'Tidak ada komentar tertulis.'}</p>
            <div style="margin-top:1rem;font-size:0.75rem;color:var(--gray-500);display:flex;gap:1rem">
              <span>WiFi: ${r.wifiRating}/5</span>
              <span>Workspace: ${r.workspaceRating}/5</span>
              <span>Suasana: ${r.ambienceRating}/5</span>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      document.getElementById('reviews-list').innerHTML = `<div style="color:var(--red)">Gagal memuat ulasan.</div>`;
    }
  }
}

window.showAddLocationForm = () => {
  const container = document.getElementById('add-location-form-container');
  container.style.display = 'block';
  container.innerHTML = `
    <div class="dashboard-card" style="padding:2rem">
      <h3 style="margin-bottom:1rem;font-weight:700">Tambah Lokasi Baru</h3>
      <form id="form-add-location" onsubmit="submitNewLocation(event)">
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Nama Lokasi</label>
          <input type="text" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px" placeholder="Contoh: Villa Pantai Indrayanti">
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Kategori</label>
          <select name="category" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
            <option value="Penginapan">Penginapan</option>
            <option value="Workspace">Workspace</option>
            <option value="Kafe/Resto">Kafe/Resto</option>
          </select>
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Deskripsi Lokasi</label>
          <textarea name="description" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px" rows="3" placeholder="Ceritakan kelebihan tempat Anda..."></textarea>
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Unggah Foto Fisik</label>
          <input type="file" name="image" accept="image/*" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Fasilitas (Pisahkan dengan koma)</label>
          <input type="text" name="facilities" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px" placeholder="Contoh: AC, WiFi Cepat, Parkir">
        </div>
        <hr style="margin:2rem 0;border:0;border-top:1px solid #eee">
        <h4 style="margin-bottom:1rem;font-weight:700">Daftar Paket Harga</h4>
        <div id="packages-container">
          <div class="package-item" style="display:flex;gap:1rem;margin-bottom:1rem">
            <input type="text" class="pkg-name" placeholder="Nama Paket (cth: Harian)" required style="flex:1;padding:10px;border:1px solid #ddd;border-radius:4px">
            <input type="number" class="pkg-price" placeholder="Harga (Rp)" required style="flex:1;padding:10px;border:1px solid #ddd;border-radius:4px">
          </div>
        </div>
        <button type="button" onclick="addPackageField()" style="background:none;border:1px dashed var(--green);color:var(--green);padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:600;width:100%">+ Tambah Paket Lain</button>

        <div style="display:flex;gap:1rem;margin-top:2rem">
          <button type="submit" style="background:var(--green);color:#fff;border:none;padding:10px 20px;border-radius:4px;font-weight:700;cursor:pointer">Simpan Lokasi</button>
          <button type="button" onclick="document.getElementById('add-location-form-container').style.display='none'" style="background:var(--gray-200);color:var(--text-main);border:none;padding:10px 20px;border-radius:4px;font-weight:700;cursor:pointer">Batal</button>
        </div>
      </form>
    </div>
  `;
};

window.addPackageField = () => {
  const container = document.getElementById('packages-container');
  const div = document.createElement('div');
  div.className = 'package-item';
  div.style.cssText = 'display:flex;gap:1rem;margin-bottom:1rem';
  div.innerHTML = `
    <input type="text" class="pkg-name" placeholder="Nama Paket" required style="flex:1;padding:10px;border:1px solid #ddd;border-radius:4px">
    <input type="number" class="pkg-price" placeholder="Harga (Rp)" required style="flex:1;padding:10px;border:1px solid #ddd;border-radius:4px">
    <button type="button" onclick="this.parentElement.remove()" style="background:var(--red);color:#fff;border:none;padding:0 15px;border-radius:4px;cursor:pointer">X</button>
  `;
  container.appendChild(div);
};

window.submitNewLocation = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  // Ambil data packages
  const packages = [];
  form.querySelectorAll('.package-item').forEach(item => {
    packages.push({
      packageName: item.querySelector('.pkg-name').value,
      pricePerDay: parseFloat(item.querySelector('.pkg-price').value)
    });
  });
  formData.append('packages', JSON.stringify(packages));
  
  try {
    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.innerText = 'Menyimpan...';
    btn.disabled = true;

    await OwnerService.createLocation(formData);
    
    showToast('Lokasi berhasil ditambahkan!');
    renderOwnerTab('locations');
  } catch (error) {
    showToast(error.message);
    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = 'Simpan Lokasi';
    btn.disabled = false;
  }
};

window.editLocation = async (id) => {
  const loc = window.ownerLocations.find(l => l.id === id);
  if (!loc) return showToast('Data lokasi tidak ditemukan');

  const container = document.getElementById('add-location-form-container');
  container.style.display = 'block';
  
  // Convert boolean to string for toggle
  const isPublishedVal = loc.isPublished ? 'true' : 'false';
  const hasPowerVal = loc.hasPowerOutlet ? 'true' : 'false';
  
  container.innerHTML = `
    <div class="dashboard-card" style="padding:2rem">
      <h3 style="margin-bottom:1rem;font-weight:700">Edit Lokasi: ${loc.name}</h3>
      <form id="form-edit-location" onsubmit="submitEditLocation(event, ${loc.id})">
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Nama Lokasi</label>
          <input type="text" name="name" value="${loc.name}" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Kategori</label>
          <select name="category" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
            <option value="Penginapan" ${loc.category === 'Penginapan' ? 'selected' : ''}>Penginapan</option>
            <option value="Workspace" ${loc.category === 'Workspace' ? 'selected' : ''}>Workspace</option>
            <option value="Kafe/Resto" ${loc.category === 'Kafe/Resto' ? 'selected' : ''}>Kafe/Resto</option>
            <option value="Wisata" ${loc.category === 'Wisata' ? 'selected' : ''}>Wisata</option>
          </select>
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Deskripsi Lokasi</label>
          <textarea name="description" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px" rows="3">${loc.description || ''}</textarea>
        </div>
        <div style="margin-bottom:1rem;display:flex;gap:1rem">
          <div style="flex:1">
            <label style="display:block;margin-bottom:0.5rem;font-weight:600">Kecepatan WiFi (Mbps)</label>
            <input type="number" name="wifiSpeed" value="${loc.wifiSpeed || 0}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
          </div>
          <div style="flex:1">
            <label style="display:block;margin-bottom:0.5rem;font-weight:600">Stop Kontak</label>
            <select name="hasPowerOutlet" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
              <option value="true" ${hasPowerVal === 'true' ? 'selected' : ''}>Ada</option>
              <option value="false" ${hasPowerVal === 'false' ? 'selected' : ''}>Tidak Ada</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Fasilitas (Pisahkan dengan koma)</label>
          <input type="text" name="facilities" value="${(loc.facilities || []).join(', ')}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Suasana (Pisahkan dengan koma)</label>
          <input type="text" name="suasana" value="${(loc.suasana || []).join(', ')}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Status Publikasi</label>
          <select name="isPublished" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
            <option value="true" ${isPublishedVal === 'true' ? 'selected' : ''}>Publikasikan (Tampil)</option>
            <option value="false" ${isPublishedVal === 'false' ? 'selected' : ''}>Sembunyikan</option>
          </select>
        </div>
        <div style="margin-bottom:1rem">
          <label style="display:block;margin-bottom:0.5rem;font-weight:600">Ubah Foto (Kosongkan jika tidak ingin mengubah)</label>
          <input type="file" name="image" accept="image/*" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px">
          ${loc.img ? `<img src="http://localhost:3001${loc.img}" style="height:60px;margin-top:0.5rem;border-radius:4px">` : ''}
        </div>
        
        <div style="display:flex;gap:1rem;margin-top:2rem">
          <button type="submit" style="background:var(--green);color:#fff;border:none;padding:10px 20px;border-radius:4px;font-weight:700;cursor:pointer">Simpan Perubahan</button>
          <button type="button" onclick="document.getElementById('add-location-form-container').style.display='none'" style="background:var(--gray-200);color:var(--text-main);border:none;padding:10px 20px;border-radius:4px;font-weight:700;cursor:pointer">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  // Scroll to form
  container.scrollIntoView({ behavior: 'smooth' });
};

window.submitEditLocation = async (e, id) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  try {
    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = 'Menyimpan...';
    btn.disabled = true;

    await OwnerService.updateLocation(id, formData);
    
    showToast('Lokasi berhasil diubah!');
    renderOwnerTab('locations');
  } catch (error) {
    showToast(error.message);
    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = 'Simpan Perubahan';
    btn.disabled = false;
  }
};

window.deleteLocation = async (id) => {
  if (confirm("Apakah Anda yakin ingin menghapus lokasi ini? Data yang dihapus tidak bisa dikembalikan.")) {
    try {
      await OwnerService.deleteLocation(id);
      showToast('Lokasi berhasil dihapus!');
      renderOwnerTab('locations');
    } catch (error) {
      showToast(error.message);
    }
  }
};

window.updateBookingStatus = async (id, status) => {
  if (confirm(`Ubah status booking ini menjadi ${status}?`)) {
    try {
      await OwnerService.updateBookingStatus(id, status);
      showToast(`Status booking berhasil diubah menjadi ${status}`);
      renderOwnerTab('bookings');
    } catch (error) {
      showToast(error.message);
    }
  }
};
