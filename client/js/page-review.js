// ===== PAGE: REVIEW =====

let reviewState = {
  selectedPlace: null,
  ratings: { wifi:0, kenyamanan:0, fasilitas:0, suasana:0, value:0 },
  overallRating: 0,
  reviewText: '',
  tags: [],
  submitted: false,
  previewCard: null,
};

const REVIEW_TAGS = ['Recommended','Bakal Balik Lagi','Untuk Solo','Untuk Tim','Budget-Friendly','Premium'];

function renderReviewPage() {
  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '');
  header.style.cssText = 'background:linear-gradient(135deg,var(--green-dark),var(--green));padding:3rem 0 2rem;color:#fff';
  header.innerHTML = `
    <div class="container">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,166,35,0.2);border:1px solid rgba(245,166,35,0.4);border-radius:100px;padding:6px 16px;margin-bottom:1rem;font-size:0.875rem;color:var(--gold)">⭐ Review & Share</div>
      <h1 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:800;margin-bottom:0.5rem">Bagikan Pengalamanmu</h1>
      <p style="opacity:0.8">Rating detail per kategori untuk membantu workationer lainnya</p>
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
  const allPlaces = [...DATA.penginapan, ...DATA.workspace];
  const card = el('div', 'card');
  card.style.padding = '2rem';

  const RATING_CATS = [
    { key:'wifi', label:'📶 WiFi & Koneksi' },
    { key:'kenyamanan', label:'🛋️ Kenyamanan Kerja' },
    { key:'fasilitas', label:'🔌 Fasilitas' },
    { key:'suasana', label:'🌿 Suasana & Lingkungan' },
    { key:'value', label:'💰 Harga & Value' },
  ];

  card.innerHTML = `
    <h2 style="font-size:1.25rem;font-weight:800;color:var(--green-dark);margin-bottom:1.5rem">✍️ Tulis Ulasan</h2>

    <div class="form-group">
      <label class="form-label">Tempat yang Dikunjungi</label>
      <select class="form-input" onchange="reviewState.selectedPlace=this.value;renderApp()">
        <option value="">-- Pilih tempat --</option>
        ${allPlaces.map(p=>`<option value="${p.id}" ${reviewState.selectedPlace===p.id?'selected':''}>${p.name}</option>`).join('')}
      </select>
    </div>

    <div style="margin-bottom:1.5rem">
      <label class="form-label">⭐ Rating Keseluruhan</label>
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
            <span style="font-weight:700;color:var(--green)">${reviewState.ratings[cat.key]||'-'}</span>
          </div>
          <input type="range" class="range-slider" min="1" max="5" step="0.5" value="${reviewState.ratings[cat.key]||3}"
            oninput="reviewState.ratings['${cat.key}']=+this.value;document.getElementById('rv-${cat.key}').textContent=this.value" />
          <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--gray-400)"><span>Buruk</span><span>Excellent</span></div>
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
      <button class="btn btn-ghost btn-lg" style="flex:1" onclick="previewReview()">👁️ Preview</button>
      <button class="btn btn-primary btn-lg" style="flex:1" onclick="submitReview()">✅ Kirim Ulasan</button>
    </div>
  `;
  return card;
}

function renderSubmittedPreview() {
  const wrap = el('div', 'slide-up');
  wrap.innerHTML = `
    <div style="background:#d1fae5;border-radius:16px;padding:2rem;text-align:center;margin-bottom:1.5rem">
      <div style="font-size:3rem;margin-bottom:0.5rem">🎉</div>
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

  // Aggregated stats
  const statsCard = el('div', 'card mb-4');
  statsCard.style.padding = '1.5rem';
  statsCard.innerHTML = `
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);margin-bottom:1.25rem">📊 Statistik Ulasan</h3>
    <div style="text-align:center;margin-bottom:1rem">
      <div style="font-size:3rem;font-weight:900;color:var(--green)">4.7</div>
      <div class="stars" style="font-size:1.5rem">⭐⭐⭐⭐⭐</div>
      <div style="font-size:0.8rem;color:var(--gray-400)">dari 124 ulasan</div>
    </div>
    ${['📶 WiFi','🛋️ Kenyamanan','🔌 Fasilitas','🌿 Suasana','💰 Value'].map((cat,i)=>{
      const score = [4.8,4.6,4.5,4.9,4.5][i];
      return `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.625rem;font-size:0.8rem">
          <span style="width:80px;flex-shrink:0">${cat}</span>
          <div class="progress-bar" style="flex:1;height:6px"><div class="progress-fill" style="width:${score/5*100}%"></div></div>
          <span style="font-weight:700;width:28px">${score}</span>
        </div>
      `;
    }).join('')}
  `;
  wrap.appendChild(statsCard);

  const reviews = el('div', '');
  const title = el('div', 'fw-700 mb-3');
  title.style.color = 'var(--gray-700)';
  title.textContent = '💬 Ulasan Pengguna';
  wrap.appendChild(title);

  const extendedReviews = [
    ...DUMMY_REVIEWS,
    { name:'Sinta Dewi', avatar:'SD', color:'#dc2626', rating:5, date:'2 Jan 2025', text:'Workation terbaik yang pernah saya lakukan! Pantai + WiFi kencang = surga remote work.' },
    { name:'Budi Santoso', avatar:'BS', color:'#7c3aed', rating:4, date:'20 Des 2024', text:'Suasana tenang, bikin fokus. Sate klathaknya juga enak banget!' },
  ];

  extendedReviews.forEach(r => wrap.appendChild(renderReviewCard(r, false)));
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
          <span style="font-size:0.7rem;background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:100px">✓ Verified Stay</span>
        </div>
        <div style="font-size:0.75rem;color:var(--gray-400)">${r.date}</div>
      </div>
      <div class="stars">${'⭐'.repeat(r.rating)}</div>
    </div>
    <p style="font-size:0.875rem;color:var(--gray-600);line-height:1.6;margin-bottom:0.75rem">${r.text}</p>
    ${tagsHtml ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:0.75rem">${tagsHtml}</div>` : ''}
    <div style="display:flex;align-items:center;gap:1rem">
      <button class="btn btn-ghost btn-sm" onclick="likeReview(this)">👍 Helpful (${Math.floor(Math.random()*20)+1})</button>
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

function submitReview() {
  if (!reviewState.overallRating) { showToast('⚠️ Berikan rating keseluruhan dulu!'); return; }
  reviewState.previewCard = {
    name: 'Kamu',
    avatar: 'KM',
    color: '#1a4a3a',
    rating: reviewState.overallRating,
    date: new Date().toLocaleDateString('id-ID'),
    text: reviewState.reviewText || 'Pengalaman workation yang luar biasa!',
    tags: reviewState.tags,
  };
  reviewState.submitted = true;
  renderApp();
}

function likeReview(btn) {
  btn.style.color = 'var(--green)';
  btn.style.borderColor = 'var(--green)';
}
