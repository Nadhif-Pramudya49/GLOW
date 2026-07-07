async function renderLocationDetail(locationId) {
  const container = el('div', 'fade-in');
  container.style.maxWidth = '1200px';
  container.style.margin = '0 auto';
  container.style.padding = '2rem';
  container.style.marginTop = '70px'; // clear navbar
  
  container.innerHTML = `<div style="text-align:center;padding:5rem;color:var(--gray-400)">Memuat detail lokasi...</div>`;

  try {
    const [loc, reviewsRes] = await Promise.all([
      LocationService.getLocationById(locationId),
      window.ReviewService ? ReviewService.getReviewsByLocation(locationId) : Promise.resolve({ data: [] })
    ]);
    
    // Normalize reviews
    const reviews = reviewsRes?.data || (Array.isArray(reviewsRes) ? reviewsRes : []);
    
    // Convert facilities string to array if it's not already
    let facilities = loc.facilities || [];
    if (typeof facilities === 'string') {
      facilities = facilities.split(',').map(f => f.trim());
    }
    
    const imageUrl = loc.img ? (loc.img.startsWith('http') || loc.img.startsWith('assets/') ? loc.img : `https://picsum.photos/seed/${loc.id}/1200/600`) : `https://picsum.photos/seed/${loc.id}/1200/600`;

    container.innerHTML = `
      <button onclick="window.history.back()" style="background:rgba(15,118,110,0.1); color:var(--green); padding:0.6rem 1.2rem; border-radius:100px; border:none; font-weight:700; cursor:pointer; margin-bottom:1.5rem; display:inline-flex; align-items:center; gap:0.5rem; transition:all 0.3s ease;" onmouseover="this.style.transform='translateX(-5px)'; this.style.background='var(--green)'; this.style.color='white';" onmouseout="this.style.transform='translateX(0)'; this.style.background='rgba(15,118,110,0.1)'; this.style.color='var(--green)';">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Kembali
      </button>

      <h1 style="font-size:2.5rem;font-weight:900;color:var(--gray-900);margin-bottom:0.5rem;letter-spacing:-0.02em">${loc.name}</h1>
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;color:var(--gray-500);font-size:0.95rem">
        <span>⭐ ${loc.rating} (${loc.reviews} ulasan)</span>
        <span>•</span>
        <span>${loc.category}</span>
        <span>•</span>
        <span style="text-decoration:underline">${loc.address}</span>
      </div>

      <div style="width:100%;height:500px;border-radius:24px;overflow:hidden;margin-bottom:3rem;box-shadow:0 12px 30px rgba(0,0,0,0.08);background:#f3f4f6">
        <img src="${imageUrl}" alt="${loc.name}" onerror="this.onerror=null; this.src='https://placehold.co/1200x600?text=Gambar+Tidak+Tersedia'" style="width:100%;height:100%;object-fit:cover" />
      </div>

      <div style="display:flex;gap:4rem;">
        <div style="flex:2">
          <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1rem;color:var(--gray-900)">Tentang tempat ini</h2>
          <p style="color:var(--gray-600);line-height:1.8;margin-bottom:2.5rem;font-size:1.1rem">${loc.description || 'Tidak ada deskripsi.'}</p>
          
          <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900)">Fasilitas</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2.5rem">
            ${facilities.map(f => `
              <div style="display:flex;align-items:center;gap:1rem;color:var(--gray-700);font-size:1.1rem">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:var(--gray-100);border-radius:8px;color:var(--green)">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </span>
                ${f}
              </div>
            `).join('')}
            <div style="display:flex;align-items:center;gap:1rem;color:var(--gray-700);font-size:1.1rem">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:var(--gray-100);border-radius:8px;color:var(--green)">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
              </span>
              WiFi ${loc.wifiSpeed || 0} Mbps
            </div>
          </div>
          
          <!-- Peta Lokasi -->
          <div style="margin-top: 3rem; margin-bottom: 3rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
              <h2 style="font-size:1.5rem;font-weight:800;color:var(--gray-900); margin:0;">Lokasi Peta</h2>
              <a href="https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}" target="_blank" style="display:inline-flex;align-items:center;gap:0.5rem;background:#fff;border:1px solid var(--gray-200);color:var(--gray-700);padding:0.6rem 1rem;border-radius:10px;font-size:0.9rem;font-weight:600;text-decoration:none;transition:all 0.2s;box-shadow:0 2px 4px rgba(0,0,0,0.02)" onmouseover="this.style.borderColor='var(--green)';this.style.color='var(--green-dark)'" onmouseout="this.style.borderColor='var(--gray-200)';this.style.color='var(--gray-700)'">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Buka di Google Maps
              </a>
            </div>
            <div style="width:100%;height:300px;border-radius:20px;overflow:hidden;border:1px solid var(--gray-200);box-shadow:0 4px 12px rgba(0,0,0,0.05);position:relative;z-index:1;">
              <iframe src="https://maps.google.com/maps?q=${loc.lat},${loc.lng}&hl=id&z=15&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
          
          <!-- Ulasan Google -->
          <div id="google-reviews-container" style="margin-top: 3rem;">
            <div style="display:flex; justify-content:center; align-items:center; padding: 2rem;">
              <div class="spinner" style="width:30px; height:30px; border:3px solid var(--gray-200); border-top-color:var(--green); border-radius:50%; animation:spin 1s linear infinite;"></div>
              <span style="margin-left:1rem; color:var(--gray-500); font-weight:600;">Memuat Ulasan Google Maps...</span>
            </div>
            <style>
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </div>

          <!-- Ulasan -->
          <div id="location-reviews-container" style="margin-top: 3rem;">
            <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900)">Ulasan Pengguna</h2>
            ${reviews.length > 0 ? reviews.map(r => `
              <div style="background:#fff;border:1px solid rgba(0,0,0,0.05);border-radius:16px;padding:1.5rem;margin-bottom:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.02)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
                  <div style="display:flex;align-items:center;gap:1rem">
                    <div style="width:40px;height:40px;border-radius:50%;background:var(--green-light);color:var(--green-dark);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem">
                      ${r.booking?.user?.fullName ? r.booking.user.fullName.substring(0,2).toUpperCase() : 'AN'}
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:1rem;color:var(--gray-900)">${r.booking?.user?.fullName || 'Anonim'}</div>
                      <div style="font-size:0.8rem;color:var(--gray-500)">${new Date(r.createdAt).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</div>
                    </div>
                  </div>
                  <div style="color:var(--gold);font-size:1.1rem;font-weight:700">
                    ${'★'.repeat(Math.round(r.rating))}${'☆'.repeat(5 - Math.round(r.rating))}
                  </div>
                </div>
                <p style="color:var(--gray-700);line-height:1.6;font-size:0.95rem">${r.comment || '<i>Tidak ada komentar.</i>'}</p>
              </div>
            `).join('') : `
              <div style="padding:2rem;text-align:center;background:var(--gray-50);border-radius:16px;color:var(--gray-500)">
                Belum ada ulasan untuk lokasi ini.
              </div>
            `}
          </div>
        </div>

        <div style="flex:1;">
          <div style="background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:24px;padding:2rem;box-shadow:0 20px 40px rgba(0,0,0,0.08)">
            <h3 style="font-size:1.25rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900)">Pilih Paket</h3>
            
            ${(loc.packages && loc.packages.length > 0) ? `
              <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem;">
                ${loc.packages.map((pkg, idx) => `
                  <label class="pkg-radio" style="display:flex;align-items:flex-start;gap:1rem;padding:1rem;border:2px solid ${idx===0?'var(--green)':'var(--gray-200)'};border-radius:12px;cursor:pointer;background:${idx===0?'#f0fdf4':'#fff'};transition:all 0.2s ease" onclick="document.querySelectorAll('.pkg-radio').forEach(el=>{el.style.borderColor='var(--gray-200)';el.style.background='#fff'});this.style.borderColor='var(--green)';this.style.background='#f0fdf4'">
                    <input type="radio" name="loc-package" value="${pkg.id}" ${idx===0?'checked':''} style="margin-top:4px;accent-color:var(--green)">
                    <div style="flex:1">
                      <div style="font-weight:700;color:var(--gray-900);font-size:1.05rem;margin-bottom:4px">${pkg.packageName}</div>
                      <div style="color:var(--green-dark);font-weight:800;font-size:1.1rem">Rp ${parseFloat(pkg.pricePerDay).toLocaleString('id-ID')}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
              <button onclick="handleAddToPackageWithSelection(${loc.id})" style="width:100%;background:var(--green);color:#fff;border:none;padding:1rem;border-radius:12px;font-size:1.1rem;font-weight:700;cursor:pointer;transition:all 0.2s ease;box-shadow:0 8px 20px rgba(23,63,53,0.2)">
                Tambahkan ke Paket
              </button>
            ` : `
              <div style="padding:1.5rem;background:var(--gray-100);border-radius:12px;text-align:center;color:var(--gray-500);margin-bottom:1.5rem">
                Belum ada paket tersedia
              </div>
              <button disabled style="width:100%;background:var(--gray-300);color:var(--gray-500);border:none;padding:1rem;border-radius:12px;font-size:1.1rem;font-weight:700;cursor:not-allowed">
                Tidak Tersedia
              </button>
            `}
            
            <p style="text-align:center;color:var(--gray-400);font-size:0.85rem;margin-top:1rem">Anda belum dikenakan biaya apa pun</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div style="text-align:center;padding:5rem;color:var(--red);font-weight:600">Gagal memuat detail lokasi.</div>`;
  }
    // Fetch Google Reviews asynchronously
    setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/locations/${locationId}/google-reviews`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        const gContainer = document.getElementById('google-reviews-container');
        if (!gContainer) return;
        
        let reviews = [];
        if (data.mock && data.result.reviews) {
           reviews = data.result.reviews;
        } else if (data.result && data.result.reviews) {
           reviews = data.result.reviews;
        }

        if (reviews.length === 0) {
          gContainer.innerHTML = `
            <div style="padding:2rem;text-align:center;background:var(--gray-50);border-radius:16px;color:var(--gray-500)">
              Belum ada ulasan Google Maps untuk lokasi ini.
            </div>
          `;
          return;
        }

        let html = `<h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem;color:var(--gray-900);display:flex;align-items:center;gap:10px">
          <svg width="24" height="24" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Ulasan dari Google
        </h2>`;

        html += reviews.slice(0, 5).map(r => `
          <div style="background:#fff;border:1px solid rgba(0,0,0,0.05);border-radius:16px;padding:1.5rem;margin-bottom:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.02)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
              <div style="display:flex;align-items:center;gap:1rem">
                <img src="${r.profile_photo_url}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(r.author_name)}&background=random'" alt="${r.author_name}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">
                <div>
                  <div style="font-weight:700;font-size:1rem;color:var(--gray-900)">${r.author_name}</div>
                  <div style="font-size:0.8rem;color:var(--gray-500)">${r.relative_time_description}</div>
                </div>
              </div>
              <div style="color:#fbbc04;font-size:1.1rem;font-weight:700">
                ${'★'.repeat(Math.round(r.rating))}${'☆'.repeat(5 - Math.round(r.rating))}
              </div>
            </div>
            <p style="color:var(--gray-700);line-height:1.6;font-size:0.95rem">${r.text || '<i>Tidak ada komentar.</i>'}</p>
          </div>
        `).join('');
        
        gContainer.innerHTML = html;
      } catch (err) {
        console.error('Failed to fetch google reviews:', err);
        const gContainer = document.getElementById('google-reviews-container');
        if (gContainer) gContainer.innerHTML = '';
      }
    }, 100);

  return container;
}

window.handleAddToPackage = async (locationId) => {
  try {
    const loc = await LocationService.getLocationById(locationId);
    addToPackage(loc); // Calls global addToPackage from components.js or data.js
    
    const userWantsToProceed = await showConfirmModal('Berhasil Ditambahkan', `<b>${loc.name}</b> berhasil ditambahkan ke rencana perjalanan Anda.`);
    if (userWantsToProceed) {
      State.set('currentPage', 'package');
      renderApp();
    }
  } catch (error) {
    showToast('Gagal menambahkan ke paket.');
  }
};

window.handleAddToPackageWithSelection = async (locationId) => {
  const selectedRadio = document.querySelector('input[name="loc-package"]:checked');
  if (!selectedRadio) {
    showToast('Silakan pilih paket terlebih dahulu.');
    return;
  }
  const packageId = parseInt(selectedRadio.value);
  
  try {
    const loc = await LocationService.getLocationById(locationId);
    const selectedPkg = loc.packages.find(p => p.id === packageId);
    
    if (selectedPkg) {
      // Create a modified copy of loc that represents the selected package
      const locWithPackage = {
        ...loc,
        price: selectedPkg.pricePerDay,
        selectedPackage: selectedPkg
      };
      
      addToPackage(locWithPackage);
      
      const userWantsToProceed = await showConfirmModal('Berhasil Ditambahkan', `Paket <b>${selectedPkg.packageName}</b> di <b>${loc.name}</b> berhasil ditambahkan ke rencana perjalanan Anda.`);
      if (userWantsToProceed) {
        State.set('currentPage', 'package');
        renderApp();
      }
    }
  } catch (error) {
    console.error(error);
    showToast('Gagal menambahkan ke paket.');
  }
};
