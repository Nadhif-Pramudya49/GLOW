async function renderProfilePage() {
  if (!State.user) {
    navigate('search');
    showToast('Anda harus login terlebih dahulu.');
    return el('div', '');
  }

  const wrapper = el('div', 'container slide-in');
  wrapper.style.paddingTop = '2rem';
  wrapper.style.paddingBottom = '4rem';
  wrapper.style.maxWidth = '600px';

  let userProfile = {};
  try {
    const res = await UserService.getProfile();
    userProfile = res.profile || {};
  } catch(e) {
    console.error('Failed to get profile', e);
  }
  
  const savedBookingHTML = `
    <div class="card" style="padding:2rem;margin-bottom:2rem">
      <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">Data Pemesan Tersimpan</h3>
      <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:1.5rem;line-height:1.5">
        Data ini akan diisi secara otomatis saat Anda melakukan pemesanan (Booking) agar proses lebih cepat.
      </p>
      
      ${userProfile.phone ? `
        <div style="background:var(--gray-50);padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;border:1px solid var(--gray-200);">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)">
            <span style="color:var(--gray-500);font-size:0.9rem">Nama</span>
            <strong style="color:var(--gray-900);text-align:right">${State.user.fullName}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--gray-200)">
            <span style="color:var(--gray-500);font-size:0.9rem">Email</span>
            <strong style="color:var(--gray-900);text-align:right">${State.user.email}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:var(--gray-500);font-size:0.9rem">WhatsApp</span>
            <strong style="color:var(--gray-900);text-align:right">${userProfile.phone || '-'}</strong>
          </div>
        </div>
        <div style="display:flex;gap:1rem;">
          <button class="btn btn-primary" style="flex:1" onclick="editSavedBookingProfile('${userProfile.phone || ''}', '${userProfile.address || ''}')">Perbarui Data Profil Tambahan</button>
        </div>
      ` : `
        <div style="background:#fff7ed;color:#c2410c;padding:1rem 1.5rem;border-radius:12px;font-size:0.9rem;border:1px solid #fed7aa;text-align:center;line-height:1.5;margin-bottom:1.5rem;">
          Belum ada data nomor WhatsApp dan Alamat. Tambahkan agar mempermudah pesanan Anda.
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="editSavedBookingProfile('', '')">Tambah Data Profil Tambahan</button>
      `}
    </div>
  `;

  wrapper.innerHTML = `
    <button onclick="window.history.back()" style="background:rgba(15,118,110,0.1); color:var(--green); padding:0.6rem 1.2rem; border-radius:100px; border:none; font-weight:700; cursor:pointer; margin-bottom:2rem; display:inline-flex; align-items:center; gap:0.5rem; transition:all 0.3s ease;" onmouseover="this.style.transform='translateX(-5px)'; this.style.background='var(--green)'; this.style.color='white';" onmouseout="this.style.transform='translateX(0)'; this.style.background='rgba(15,118,110,0.1)'; this.style.color='var(--green)';">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      Kembali
    </button>

    <div style="text-align:center;margin-bottom:2rem">
      <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(State.user.fullName)}&background=10b981&color=fff&rounded=true&size=120" alt="Profile" style="border:4px solid var(--green);margin-bottom:1rem;box-shadow:0 8px 24px rgba(16,185,129,0.2)" />
      <h2 style="font-size:1.75rem;font-weight:800">${State.user.fullName}</h2>
      <div style="color:var(--gray-500);margin-bottom:0.5rem">${State.user.email}</div>
      <span class="chip" style="background:var(--gray-100);color:var(--gray-700)">Role: ${State.user.role}</span>
    </div>

    <div class="card" style="padding:2rem;margin-bottom:2rem">
      <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:1.5rem">Pengaturan Profil</h3>
      <form onsubmit="handleUpdateProfile(event)">
        <div style="margin-bottom:1rem">
          <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.5rem">Nama Lengkap</label>
          <input type="text" id="profile-name" value="${State.user.fullName}" required style="width:100%;padding:0.75rem 1rem;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit" />
        </div>
        <div style="margin-bottom:2rem">
          <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.5rem">Email (Tidak dapat diubah)</label>
          <input type="email" value="${State.user.email}" disabled style="width:100%;padding:0.75rem 1rem;border:1px solid var(--gray-200);border-radius:8px;font-family:inherit;background:var(--gray-50);color:var(--gray-500)" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%" id="btn-update-profile">Simpan Perubahan</button>
      </form>
    </div>
    
    <div class="card" style="padding:2rem;margin-bottom:2rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <div>
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.25rem">Paket Tersimpan</h3>
          <p style="color:var(--gray-500);font-size:0.9rem;">Anda memiliki paket workation yang tersimpan.</p>
        </div>
        <button class="btn btn-outline" style="display:flex;align-items:center;gap:0.5rem;" onclick="window.showSavedPackages()">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Buka Daftar Paket
        </button>
      </div>
    </div>

    ${savedBookingHTML}

    <button class="btn btn-secondary" style="width:100%;color:red;border-color:red" onclick="confirmLogout()">Keluar (Logout)</button>
  `;

  return wrapper;
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-update-profile');
  const nameInput = document.getElementById('profile-name').value;
  
  const oldText = btn.textContent;
  btn.textContent = 'Menyimpan...';
  btn.disabled = true;

  try {
    const res = await UserService.updateProfile({ fullName: nameInput });
    
    State.user.fullName = nameInput;
    showToast('Profil berhasil diperbarui!');
    renderApp(); // re-render to update navbar avatar
  } catch (err) {
    alert(err.message || 'Gagal menyimpan profil');
  } finally {
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

function confirmLogout() {
  if (confirm('Apakah Anda yakin ingin keluar?')) {
    AuthService.logout();
  }
}

window.editSavedBookingProfile = function(currentPhone = '', currentAddress = '') {
  const content = `
    <div style="padding:1rem;">
      <h3 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900)">Edit Data Profil Tambahan</h3>
      <div style="margin-bottom:1rem">
        <label style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.5rem;color:var(--gray-700)">WhatsApp</label>
        <input type="text" id="edit-booking-phone" value="${currentPhone}" class="form-input" style="width:100%;padding:0.875rem;border-radius:8px;border:1px solid var(--gray-200)"/>
      </div>
      <div style="margin-bottom:2rem">
        <label style="display:block;font-size:0.875rem;font-weight:700;margin-bottom:0.5rem;color:var(--gray-700)">Alamat</label>
        <textarea id="edit-booking-address" rows="3" class="form-input" style="width:100%;padding:0.875rem;border-radius:8px;border:1px solid var(--gray-200);font-family:inherit">${currentAddress}</textarea>
      </div>
      <div style="display:flex;gap:1rem;justify-content:flex-end">
        <button class="btn btn-outline" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="saveBookingProfile()">Simpan Data</button>
      </div>
    </div>
  `;
  showModal(content);
};

window.saveBookingProfile = async function() {
  const phone = document.getElementById('edit-booking-phone').value;
  const address = document.getElementById('edit-booking-address').value;
  
  try {
    await UserService.updateProfile({ phone, address });
    showToast('Data berhasil disimpan');
    closeModal();
    renderApp();
  } catch(e) {
    alert(e.message || 'Gagal menyimpan data tambahan');
  }
};
