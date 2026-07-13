// ===== PAGE: REVIEW =====

let reviewState = {
  selectedBookingId: null,
  myBookings: null, // null means not loaded yet
  ratings: { wifi:0, kenyamanan:0, fasilitas:0, suasana:0, value:0 },
  overallRating: 0,
  reviewText: '',
  tags: [],
  submitted: false,
  previewCard: null,
  recentReviews: null, // null means not loaded yet
};

const REVIEW_TAGS = ['Recommended','Bakal Balik Lagi','Untuk Solo','Untuk Tim','Budget-Friendly','Premium'];

function renderReviewPage() {
  if (reviewState.myBookings === null) {
    reviewState.myBookings = [];
    if (window.BookingService) {
      BookingService.getMyBookings().then(res => {
        if (Array.isArray(res)) {
          // Filter only completed bookings for review
          reviewState.myBookings = res.filter(b => b.status === 'COMPLETED' || new Date(b.endDate) < new Date());
        }
        renderApp();
      });
    }
  }

  if (reviewState.recentReviews === null) {
    reviewState.recentReviews = [];
    if (window.ReviewService && window.ReviewService.getRecentReviews) {
      ReviewService.getRecentReviews().then(res => {
        if (Array.isArray(res)) {
          reviewState.recentReviews = res;
        }
        renderApp();
      });
    }
  }

  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '');
  header.style.cssText = 'position:relative;padding:5rem 0 4rem;color:#fff;overflow:hidden;text-align:center;';
  header.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url('assets/images/hero-culture.png');background-size:cover;background-position:center;z-index:0;"></div>
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(17, 24, 39, 0.7);z-index:1;"></div>
    <div class="container" style="position:relative;z-index:2;">
      <h1 style="font-size:2.5rem;font-weight:800;margin-bottom:0.5rem;letter-spacing:-0.02em;">Ulasan & Pengalaman</h1>
      <p style="opacity:0.9;font-size:1.1rem;max-width:500px;margin:0 auto;">Bagikan pendapat jujurmu untuk membantu workationer lain menemukan tempat terbaik.</p>
    </div>
  `;
  page.appendChild(header);

  const main = el('div', 'container', '');
  main.style.paddingTop = '2rem';
  const layout = el('div', '');
  layout.style.cssText = 'display:grid;grid-template-columns:1fr 400px;gap:2rem;align-items:start';

  const left = el('div', '');
  if (reviewState.submitted && reviewState.previewCard) {
    left.appendChild(renderSubmittedPreview());
  } else {
    left.appendChild(renderReviewForm());
  }
  layout.appendChild(left);

  // Right: existing reviews
  const right = el('div', '');
  right.appendChild(renderExistingReviews());
  layout.appendChild(right);

  main.appendChild(layout);
  page.appendChild(main);
  return page;
}

function renderReviewForm() {
  const card = el('div', 'card');
  card.style.padding = '2rem';

  const RATING_CATS = [
    { key:'wifi', label:'WiFi & Koneksi' },
    { key:'kenyamanan', label:'Kenyamanan Kerja' },
    { key:'fasilitas', label:'Fasilitas' },
    { key:'suasana', label:'Suasana & Lingkungan' },
    { key:'value', label:'Harga & Value' },
  ];

  if (!State.user) {
    card.innerHTML = `
      <h2 style="font-size:1.25rem;font-weight:800;color:var(--green-dark);margin-bottom:1rem"><svg style="width:24px;height:24px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Tulis Ulasan</h2>
      <div style="padding:2rem;text-align:center;background:var(--gray-50);border-radius:12px;border:1px dashed var(--gray-300);">
        <p style="color:var(--gray-600);margin-bottom:1rem;">Anda harus login terlebih dahulu untuk menulis ulasan.</p>
        <button class="btn btn-primary" onclick="showAuthModal('login')">Masuk / Daftar</button>
      </div>
    `;
    return card;
  }

  card.innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:800;color:var(--green-dark);margin-bottom:1.5rem"><svg style="width:24px;height:24px;display:inline-block;vertical-align:bottom;margin-right:8px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Tulis Ulasan</h2>

    <div class="form-group">
      <label class="form-label">Booking yang Dikunjungi</label>
      <select class="form-input" onchange="reviewState.selectedBookingId=this.value;renderApp()">
        <option value="">-- Pilih Booking --</option>
        ${reviewState.myBookings.map(b=>`<option value="${b.id}" ${reviewState.selectedBookingId==b.id?'selected':''}>${b.package?.location?.name || 'Lokasi'} - ${new Date(b.startDate).toLocaleDateString()}</option>`).join('')}
      </select>
    </div>

    <div style="margin-bottom:1.5rem">
      <label class="form-label">Rating Keseluruhan</label>
      <div class="star-input" id="overall-stars">
        ${[1,2,3,4,5].map(n=>`<span class="${n<=reviewState.overallRating?'active':''}" onclick="setOverallRating(${n})">★</span>`).join('')}
      </div>
    </div>

    <div style="margin-bottom:1.5rem">
      <label class="form-label">Rating per Kategori</label>
      ${RATING_CATS.map(cat=>`
        <div style="margin-bottom:0.875rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.875rem">
            <span style="font-weight:500">${cat.label}</span>
            <span style="font-weight:700;color:var(--green)">${reviewState.ratings[cat.key]||0}/5</span>
          </div>
          <div class="star-input" style="font-size:1.5rem; gap:4px">
            ${[1,2,3,4,5].map(n=>`<span class="${n<=(reviewState.ratings[cat.key]||0)?'active':''}" onclick="reviewState.ratings['${cat.key}']=${n};renderApp()">★</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="form-group">
      <label class="form-label">Teks Ulasan</label>
      <textarea class="form-input form-textarea" placeholder="Ceritakan pengalamanmu di sini..." oninput="reviewState.reviewText=this.value">${reviewState.reviewText}</textarea>
    </div>

    <div class="form-group">
      <label class="form-label">Upload Foto</label>
      <input type="file" class="form-input" accept="image/*" multiple onchange="handlePhotoUpload(this)" />
      <div id="photo-preview" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"></div>
    </div>

    <div class="form-group">
      <label class="form-label">Tags</label>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        ${REVIEW_TAGS.map(t=>`
          <span class="chip ${reviewState.tags.includes(t)?'active':''}" onclick="toggleReviewTag('${t}')">${t}</span>
        `).join('')}
      </div>
    </div>

    <div style="display:flex;gap:1rem;margin-top:1.5rem">
      <button class="btn btn-ghost btn-lg" style="flex:1" onclick="previewReview()"><svg style="width:18px;height:18px;display:inline-block;vertical-align:bottom;margin-right:6px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Preview</button>
      <button class="btn btn-primary btn-lg" style="flex:1" onclick="submitReview()">Kirim Ulasan</button>
    </div>
  `;
  return card;
}

function renderSubmittedPreview() {
  const wrap = el('div', 'slide-up');
  wrap.innerHTML = `
    <div style="background:#FAF9F6;border:1px solid #d1fae5;border-radius:16px;padding:2rem;text-align:center;margin-bottom:1.5rem">
      <div style="margin-bottom:1rem;color:var(--green);"><svg style="width:64px;height:64px;display:inline-block;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
      <h2 style="font-weight:800;color:#065f46;margin-bottom:0.5rem">Ulasan Terkirim!</h2>
      <p style="color:#059669;font-size:0.875rem">Terima kasih sudah berbagi pengalamanmu</p>
    </div>
    <div style="font-weight:700;margin-bottom:1rem;color:var(--gray-700)">Preview Ulasan Kamu:</div>
  `;

  const preview = renderReviewCard(reviewState.previewCard, true);
  wrap.appendChild(preview);

  const btn = el('button', 'btn btn-secondary btn-full mt-4');
  btn.textContent = '+ Tulis Ulasan Lagi';
  btn.onclick = () => { reviewState.submitted = false; reviewState.previewCard = null; renderApp(); };
  wrap.appendChild(btn);
  return wrap;
}

function renderExistingReviews() {
  const wrap = el('div', '');
  const reviewsData = reviewState.recentReviews || [];

  // Hitung rata-rata nyata
  let avgOverall = 0, avgWifi = 0, avgKenyamanan = 0, avgFasilitas = 0, avgSuasana = 0, avgValue = 0;
  if (reviewsData.length > 0) {
    avgOverall = (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1);
    avgWifi = (reviewsData.reduce((acc, r) => acc + (r.wifiRating||r.rating), 0) / reviewsData.length).toFixed(1);
    avgKenyamanan = (reviewsData.reduce((acc, r) => acc + (r.workspaceRating||r.rating), 0) / reviewsData.length).toFixed(1);
    avgFasilitas = avgOverall; // Fallback jika tidak ada spesifik
    avgSuasana = (reviewsData.reduce((acc, r) => acc + (r.ambienceRating||r.rating), 0) / reviewsData.length).toFixed(1);
    avgValue = avgOverall; // Fallback
  }

  // Aggregated stats
  const statsCard = el('div', 'card mb-4');
  statsCard.style.padding = '1.5rem';
  statsCard.innerHTML = `
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);margin-bottom:1.25rem"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> Statistik Ulasan (Global)</h3>
    <div style="text-align:center;margin-bottom:1rem">
      <div style="font-size:3rem;font-weight:900;color:var(--green)">${avgOverall}</div>
      <div class="stars" style="font-size:1.5rem">${'★'.repeat(Math.round(avgOverall))}</div>
      <div style="font-size:0.8rem;color:var(--gray-400)">dari ${reviewsData.length} ulasan</div>
    </div>
    ${['WiFi','Kenyamanan','Fasilitas','Suasana','Value'].map((cat,i)=>{
      const score = [avgWifi, avgKenyamanan, avgFasilitas, avgSuasana, avgValue][i];
      return `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.625rem;font-size:0.8rem">
          <span style="width:80px;flex-shrink:0">${cat}</span>
          <div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:${(score/5)*100}%"></div></div>
          <span style="font-weight:700;width:28px">${score}</span>
        </div>
      `;
    }).join('')}
  `;
  wrap.appendChild(statsCard);

  const reviews = el('div', '');
  const title = el('div', 'fw-700 mb-3');
  title.style.color = 'var(--gray-700)';
  title.innerHTML = '<svg style="width:18px;height:18px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg> Ulasan Pengguna Terbaru';
  wrap.appendChild(title);

  if (reviewsData.length === 0) {
    const empty = el('div', 'text-center p-4');
    empty.style.color = 'var(--gray-500)';
    empty.textContent = 'Belum ada ulasan.';
    wrap.appendChild(empty);
  } else {
    reviewsData.forEach(r => {
      // Map format dari backend ke format UI
      const colors = ['#dc2626','#7c3aed','#059669','#ea580c','#2563eb'];
      const cardData = {
        name: r.userName || 'Pengguna',
        avatar: (r.userName||'P').substring(0,2).toUpperCase(),
        color: colors[r.id % colors.length],
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}),
        text: r.comment || '-',
        tags: r.tags || [],
        locationName: r.locationName
      };
      wrap.appendChild(renderReviewCard(cardData, false));
    });
  }

  return wrap;
}

function renderReviewCard(r, isOwn) {
  const card = el('div', 'review-card mb-3');
  const tagsHtml = (r.tags||[]).map(t=>`<span class="chip" style="font-size:0.65rem;padding:2px 8px">${t}</span>`).join('');
  card.innerHTML = `
    <div style="display:flex;gap:0.75rem;align-items:flex-start;margin-bottom:0.875rem">
      <div class="review-avatar" style="background:${r.color}">${r.avatar}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
          <span style="font-weight:700;font-size:0.875rem">${r.name}</span>
          ${isOwn?'<span style="font-size:0.7rem;background:var(--green);color:#fff;padding:2px 8px;border-radius:100px">Anda</span>':''}
          <span style="font-size:0.7rem;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:100px">Verified Stay</span>
        </div>
        <div style="font-size:0.75rem;color:var(--gray-400)">${r.date} ${r.locationName ? `di <b>${r.locationName}</b>` : ''}</div>
      </div>
      <div class="stars">${'★'.repeat(r.rating)}</div>
    </div>
    <p style="font-size:0.875rem;color:var(--gray-600);line-height:1.6;margin-bottom:0.75rem">${r.text}</p>
    ${tagsHtml ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:0.75rem">${tagsHtml}</div>` : ''}
    <div style="display:flex;align-items:center;gap:1rem">
      <button class="btn btn-ghost btn-sm" onclick="likeReview(this)">Helpful (${Math.floor(Math.random()*20)+1})</button>
    </div>
  `;
  return card;
}

// Review handlers
function toggleReviewTag(tag) {
  const idx = reviewState.tags.indexOf(tag);
  if (idx >= 0) reviewState.tags.splice(idx,1); else reviewState.tags.push(tag);
  renderApp();
}

function setOverallRating(n) { reviewState.overallRating = n; renderApp(); }

function handlePhotoUpload(input) {
  const preview = document.getElementById('photo-preview');
  if (!preview) return;
  preview.innerHTML = '';
  Array.from(input.files).slice(0,3).forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url; img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px';
    preview.appendChild(img);
  });
}

function previewReview() {
  if (!reviewState.overallRating) { showToast('⚠️ Berikan rating keseluruhan dulu!'); return; }
  const card = {
    name: 'Kamu',
    avatar: 'KM',
    color: '#1a4a3a',
    rating: reviewState.overallRating,
    date: new Date().toLocaleDateString('id-ID'),
    text: reviewState.reviewText || 'Pengalaman workation yang luar biasa!',
    tags: reviewState.tags,
  };
  showModal(`
    <div class="modal-header">
      <h3 style="font-weight:700">Preview Ulasan</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">${renderReviewCard(card, true).outerHTML}</div>
  `);
}

async function submitReview() {
  if (!reviewState.selectedBookingId) { showToast('⚠️ Pilih booking terlebih dahulu!'); return; }
  if (!reviewState.overallRating) { showToast('⚠️ Berikan rating keseluruhan dulu!'); return; }
  
  const payload = {
    bookingId: reviewState.selectedBookingId,
    rating: reviewState.overallRating,
    wifiRating: reviewState.ratings.wifi || reviewState.overallRating,
    workspaceRating: reviewState.ratings.kenyamanan || reviewState.overallRating,
    ambienceRating: reviewState.ratings.suasana || reviewState.overallRating,
    comment: reviewState.reviewText,
    tags: reviewState.tags
  };

  try {
    await window.ReviewService.submitReview(payload);
    reviewState.previewCard = {
      name: State.user ? State.user.fullName : 'Kamu',
      avatar: State.user ? State.user.fullName.substring(0,2).toUpperCase() : 'KM',
      color: '#1a4a3a',
      rating: reviewState.overallRating,
      date: new Date().toLocaleDateString('id-ID'),
      text: reviewState.reviewText || 'Pengalaman workation yang luar biasa!',
      tags: reviewState.tags,
    };
    reviewState.submitted = true;
    showToast('✅ Ulasan berhasil dikirim!');
    renderApp();
  } catch (error) {
    showToast('❌ Gagal mengirim ulasan.');
  }
}

function likeReview(btn) {
  btn.style.color = 'var(--green)';
  btn.style.borderColor = 'var(--green)';
}
