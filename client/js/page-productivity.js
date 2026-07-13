// ===== PAGE: PRODUCTIVITY MODE =====

let prodState = {
  myBookings: null,
  selectedBookingId: null,
  activeBooking: null,
  
  mood: null,
  moodLogs: [],
  
  itineraries: [],
  
  pomodoroRunning: false,
  pomodoroTime: 25 * 60,
  pomodoroMax: 25 * 60,
  sessions: 0,
  sessions: 0,
  pomodoroInterval: null,
  itemStatus: {},
  
  audio: {
    isPlaying: false,
    trackId: 'rain'
  }
};

const AUDIO_TRACKS = [
  { id: 'rain', name: 'Rain in the Woods', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rain_in_the_city.ogg' },
  { id: 'cafe', name: 'Cafe Murmur', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Restaurant_ambience.ogg' },
  { id: 'lofi', name: 'Lo-Fi Beats', url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Chopin_Nocturne_Op._9%2C_No._2.ogg' },
  { id: 'nature', name: 'Forest Birds', url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Nature_sounds_-_birds.ogg' },
  { id: 'waves', name: 'Ocean Waves', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Ocean_Waves_Sound_Effect.ogg' },
  { id: 'fire', name: 'Campfire', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Fire_crackling_and_burning.ogg' }
];

// Ensure global audio element exists
let focusAudioEl = document.getElementById('focus-audio');
if (!focusAudioEl) {
  focusAudioEl = document.createElement('audio');
  focusAudioEl.id = 'focus-audio';
  focusAudioEl.loop = true;
  focusAudioEl.volume = 0.5;
  document.body.appendChild(focusAudioEl);
  // Set initial track
  focusAudioEl.src = AUDIO_TRACKS.find(t => t.id === 'rain').url;
}

const MOODS = [
  { id:'deepfocus', emoji:'🎧', label:'Deep Focus', desc:'Timer 50m • Lo-Fi', track:'lofi', timer:50, score:5, bg:'#f0fdf4', border:'#22c55e' },
  { id:'cafe', emoji:'☕', label:'Cafe Vibe', desc:'Timer 25m • Cafe', track:'cafe', timer:25, score:4, bg:'#fffbeb', border:'#f59e0b' },
  { id:'rainy', emoji:'🌧️', label:'Rainy Day', desc:'Timer 45m • Hujan', track:'rain', timer:45, score:4, bg:'#eff6ff', border:'#3b82f6' },
  { id:'nature', emoji:'🌲', label:'Nature Zen', desc:'Timer 30m • Hutan', track:'nature', timer:30, score:5, bg:'#f0fdfa', border:'#14b8a6' },
  { id:'ocean', emoji:'🌊', label:'Ocean Waves', desc:'Timer 30m • Pantai', track:'waves', timer:30, score:4, bg:'#ecfeff', border:'#06b6d4' },
  { id:'meditate', emoji:'🧘', label:'Meditasi', desc:'Tanpa Timer', track:'lofi', timer:0, score:5, bg:'#faf5ff', border:'#a855f7' },
  { id:'nightowl', emoji:'🦉', label:'Night Owl', desc:'Timer 60m • Lo-Fi', track:'lofi', timer:60, score:5, bg:'#f8fafc', border:'#64748b' },
  { id:'sprint', emoji:'⚡', label:'Power Sprint', desc:'Timer 15m • Cepat', track:'lofi', timer:15, score:4, bg:'#fef2f2', border:'#ef4444' },
  { id:'fire', emoji:'🔥', label:'Campfire', desc:'Timer 30m • Api', track:'fire', timer:30, score:4, bg:'#fff7ed', border:'#ea580c' },
];

function renderProductivityPage() {
  if (!State.user) {
    showToast('Anda harus login terlebih dahulu.');
    navigate('search');
    return el('div', '');
  }

  // Always sync with localStorage to prevent stale empty state if user just booked
  const localMockStr = localStorage.getItem('glow_mock_bookings');
  let localMocks = [];
  if (localMockStr) {
    localMocks = JSON.parse(localMockStr).filter(b => ['PENDING', 'CONFIRMED', 'PAID'].includes((b.status || '').toUpperCase()));
  }

  let isLoading = false;

  if (prodState.myBookings === null || (prodState.myBookings.length === 0 && localMocks.length > 0)) {
    isLoading = true;
    prodState.myBookings = localMocks;
    if (window.BookingService) {
      BookingService.getMyBookings().then(res => {
        let bookings = [];
        if (Array.isArray(res)) bookings = res;
        else if (res && Array.isArray(res.data)) bookings = res.data;
        
        bookings = bookings.concat(localMocks);
        bookings.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        prodState.myBookings = bookings.filter(b => ['PENDING', 'CONFIRMED', 'PAID'].includes((b.status || '').toUpperCase()));
        
        if (prodState.myBookings.length > 0 && !prodState.selectedBookingId) {
          selectProductivityBooking(prodState.myBookings[0].id);
        } else {
          renderApp();
        }
      }).catch(e => {
        console.warn('Failed to fetch productivity bookings', e);
        if (prodState.myBookings.length > 0 && !prodState.selectedBookingId) {
          selectProductivityBooking(prodState.myBookings[0].id);
        } else {
          renderApp();
        }
      });
    }
  } else {
    // If we already have myBookings loaded and it's not null, ensure we pick up any new localMocks
    localMocks.forEach(m => {
      if (!prodState.myBookings.find(x => x.id === m.id)) {
        prodState.myBookings.push(m);
      }
    });
    prodState.myBookings.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  if (isLoading || prodState.myBookings === null) {
    const page = el('div', 'page fade-in');
    page.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height:80vh; flex-direction:column; gap:1rem;">
        <div style="width:40px; height:40px; border:4px solid var(--gray-200); border-top-color:var(--green); border-radius:50%; animation:spin 1s linear infinite;"></div>
        <div style="color:var(--gray-500); font-weight:500;">Memuat productivity mode...</div>
      </div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;
    return page;
  }

  if (prodState.myBookings.length > 0 && !prodState.selectedBookingId) {
    selectProductivityBooking(prodState.myBookings[0].id);
    // Return empty div while it transitions to prevent flashing empty state
    return el('div', 'page');
  }

  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';
  
  if (prodState.myBookings.length === 0) {
    page.innerHTML = `
      <div class="container" style="padding-top:6rem;text-align:center;max-width:500px">
        <div style="width:80px;height:80px;background:var(--gray-100);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem">
          <svg style="width:40px;height:40px;color:var(--gray-400)" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 style="font-size:1.75rem;font-weight:800;color:var(--gray-900);margin-bottom:1rem">Belum Ada Agenda Aktif</h2>
        <p style="color:var(--gray-500);margin-bottom:2.5rem;line-height:1.6">Halaman Produktivitas akan terbuka secara otomatis setelah Anda memiliki pesanan Workation yang aktif. Mari mulai rencanakan perjalanan Anda!</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" style="padding:0.75rem 2rem;border-radius:99px" onclick="navigate('search')">Cari Workation</button>
          <button class="btn btn-outline" style="padding:0.75rem 2rem;border-radius:99px" onclick="navigate('dashboard-user'); setTimeout(()=>renderUserTab('bookings'), 100)">Riwayat Pesanan</button>
        </div>
      </div>
    `;
    return page;
  }
  
  if (!prodState.selectedBookingId) {
    // Tampilkan pemilih booking
    const container = el('div', 'container');
    container.style.paddingTop = '4rem';
    container.innerHTML = `
      <h2 style="margin-bottom:1.5rem">Pilih Workation Anda</h2>
      <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
        ${prodState.myBookings.map(b => `
          <div class="card" style="padding:1.5rem;cursor:pointer;border:2px solid transparent;transition:all 0.2s" onclick="selectProductivityBooking(${b.id})" onmouseover="this.style.borderColor='var(--green)'" onmouseout="this.style.borderColor='transparent'">
            <div style="font-weight:700;font-size:1.1rem;margin-bottom:0.5rem">${b.package?.packageName || 'Paket Workation'}</div>
            <div style="color:var(--gray-500);font-size:0.875rem">
              ${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    page.appendChild(container);
    return page;
  }

  // ==== ZEN MODE FULLSCREEN UI ====
  if (document.body.classList.contains('zen-mode')) {
    return renderZenModeUI();
  }

  let locName = 'Gunung Kidul';
  let locImg = 'assets/images/hero-aerial.png';
  if (prodState.activeBooking && prodState.activeBooking.package && prodState.activeBooking.package.location) {
    locName = prodState.activeBooking.package.location.name;
    if (prodState.activeBooking.package.location.img) {
      locImg = prodState.activeBooking.package.location.img;
    }
  }

  // Trigger real-time weather fetch and start clock after render
  setTimeout(() => {
    if (window.startRealtimeClock) window.startRealtimeClock();
    if (window.fetchRealtimeWeather) window.fetchRealtimeWeather(locName);
  }, 100);

  const header = el('div', '');
  header.style.cssText = 'position:relative;padding:3.5rem 0 3rem;color:#fff;overflow:hidden;';
  
  header.innerHTML = `
    <div class="prod-hero-bg" style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url('${locImg}');background-size:cover;background-position:center;z-index:0;transition:all 0.5s ease;"></div>
    <!-- Premium Gradient Overlay: Darker on the left for text readability, fading to transparent emerald on the right -->
    <div class="prod-hero-overlay" style="position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(to right, rgba(2, 6, 23, 0.8) 0%, rgba(4, 57, 39, 0.5) 100%);backdrop-filter:blur(6px);z-index:1;transition:all 0.5s ease;"></div>
    <div class="container" style="position:relative;z-index:2;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem">
        <div>
          <span style="display:inline-block;padding:6px 14px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:100px;font-size:0.7rem;font-weight:700;letter-spacing:1px;margin-bottom:12px;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,0.1)">Productivity Mode</span>
          <h1 onclick="resetProductivitySelection()" style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:800;margin-bottom:0.25rem;text-shadow:0 2px 10px rgba(0,0,0,0.3);cursor:pointer;display:flex;align-items:center;gap:12px;transition:opacity 0.2s" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
            ${locName}
            <svg style="width:28px;height:28px;opacity:0.7;margin-top:6px" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
          </h1>
          <div style="opacity:0.9;font-size:1.1rem;margin-top:4px;font-weight:500;text-shadow:0 1px 4px rgba(0,0,0,0.3)">
            ${new Date().toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}
            <span style="margin:0 8px;opacity:0.5">|</span>
            <span id="rt-clock" style="font-weight:700">--:--</span>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.25);box-shadow:0 10px 40px rgba(0,0,0,0.2);padding:1.25rem 1.5rem;border-radius:16px;display:flex;gap:1.5rem;align-items:center;animation:floatCard 6s ease-in-out infinite;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div id="weather-icon-container" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;transition:all 0.3s ease">
              <!-- Loading icon will be injected here -->
            </div>
            <div>
              <div id="rt-temp" style="font-size:1.85rem;font-weight:800;line-height:1;margin-bottom:4px;text-shadow:0 2px 8px rgba(0,0,0,0.2)">--°C</div>
              <div id="rt-cond" style="font-size:0.8rem;opacity:0.8;">Memuat...</div>
            </div>
          </div>
          <div style="width:1px;height:40px;background:rgba(255,255,255,0.2);margin:0 0.25rem"></div>
          <button style="padding:10px;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.1)" onclick="toggleZenMode()" title="Zen Mode" id="zen-btn" onmouseover="this.style.background='rgba(255,255,255,0.25)';this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(255,255,255,0.15)';this.style.transform='scale(1)'">
            ${document.body.classList.contains('zen-mode') 
              ? `<svg style="width:20px;height:20px;color:#fbbf24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>` 
              : `<svg style="width:20px;height:20px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`}
          </button>
        </div>
      </div>
    </div>
  `;
  page.appendChild(header);

  const main = el('div', 'container', '');
  main.style.paddingTop = '2rem';

  const grid = el('div', '');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 360px;gap:2rem;align-items:start';

  const left = el('div', '');

  // Mood Check-in
  left.appendChild(renderMoodCheckin());

  // Workspace recommendation
  if (prodState.mood) left.appendChild(renderWorkspaceRec());

  // Daily Schedule
  left.appendChild(renderDailySchedule());

  grid.appendChild(left);

  // Right: Pomodoro & Audio
  const right = el('div', '');
  right.appendChild(renderPomodoro());
  right.appendChild(renderAudioPlayer());
  grid.appendChild(right);

  main.appendChild(grid);
  page.appendChild(main);
  return page;
}

window.selectProductivityBooking = async (id) => {
  prodState.selectedBookingId = id;
  prodState.activeBooking = prodState.myBookings.find(b => b.id === id);
  prodState.itineraries = [];
  prodState.moodLogs = [];
  prodState.mood = null;
  
  if (window.ProductivityService) {
    try {
      const [itineraries, moods] = await Promise.all([
        ProductivityService.getItineraries(id),
        ProductivityService.getMoodLogs(id)
      ]);
      prodState.itineraries = itineraries || [];
      prodState.moodLogs = moods || [];
      if (moods && moods.length > 0) {
        // Find matching mood by score for the latest log
        const latestScore = moods[0].moodScore;
        const matchingMood = MOODS.find(m => m.score === latestScore);
        if (matchingMood) prodState.mood = matchingMood.id;
      }
    } catch (e) {
      console.warn('Tidak dapat memuat data produktivitas dari server. Menggunakan mode lokal/offline.', e);
      prodState.itineraries = [];
      prodState.moodLogs = [];
    }
  }
  renderApp();
};

window.resetProductivitySelection = () => {
  prodState.selectedBookingId = null;
  prodState.activeBooking = null;
  renderApp();
};

window.toggleZenMode = () => {
  const page = document.querySelector('.page');
  
  if (page) {
    page.style.transition = 'opacity 0.4s ease';
    page.style.opacity = '0';
    
    setTimeout(() => {
      document.body.classList.toggle('zen-mode');
      const isZen = document.body.classList.contains('zen-mode');
      
      if (isZen) {
        showToast('Zen Mode Aktif 🌙');
      } else {
        showToast('Zen Mode Nonaktif ☀️');
      }
      
      renderApp();
    }, 400);
  } else {
    document.body.classList.toggle('zen-mode');
    renderApp();
  }
};

window.toggleMoods = () => {
  prodState.showAllMoods = !prodState.showAllMoods;
  renderApp();
};

function renderMoodCheckin() {
  const visibleMoods = prodState.showAllMoods ? MOODS : MOODS.slice(0, 4);
  const card = el('div', 'card mb-4');
  card.style.padding = '1.5rem';
  card.innerHTML = `
    <h3 style="font-weight:800;font-size:1.1rem;color:var(--green-dark);margin-bottom:0.25rem"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Lingkungan Fokus & Suasana</h3>
    <p style="font-size:0.875rem;color:var(--gray-400);margin-bottom:1.25rem">Pilih suasana kerja yang paling cocok untuk target produktivitas Anda sekarang.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:1rem;">
      ${visibleMoods.map(m => `
        <div onclick="setMood('${m.id}')" style="cursor:pointer;background:${prodState.mood===m.id?m.bg:'var(--white)'};border:1.5px solid ${prodState.mood===m.id?m.border:'var(--gray-100)'};border-radius:20px;padding:1.5rem 1rem;text-align:center;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:${prodState.mood===m.id?'0 12px 24px rgba(0,0,0,0.08)':'0 2px 8px rgba(0,0,0,0.02)'};transform:${prodState.mood===m.id?'translateY(-6px)':'none'}">
          <div style="font-size:3rem;margin-bottom:1rem;filter:${prodState.mood===m.id?'drop-shadow(0 8px 12px rgba(0,0,0,0.15))':'grayscale(0.6) opacity(0.8)'};transition:all 0.3s;transform:${prodState.mood===m.id?'scale(1.1)':'scale(1)'}">${m.emoji}</div>
          <div style="font-weight:800;font-size:0.95rem;color:${prodState.mood===m.id?m.border:'var(--gray-700)'};margin-bottom:0.4rem;transition:all 0.3s">${m.label}</div>
          <div style="font-size:0.75rem;color:${prodState.mood===m.id?m.border:'var(--gray-400)'};font-weight:600;letter-spacing:0.2px;transition:all 0.3s;opacity:${prodState.mood===m.id?'0.8':'1'}">${m.desc}</div>
        </div>
      `).join('')}
      <div onclick="toggleMoods()" style="cursor:pointer;background:var(--gray-50);border:1.5px dashed var(--gray-300);border-radius:20px;padding:1.5rem 1rem;text-align:center;transition:all 0.3s;display:flex;flex-direction:column;align-items:center;justify-content:center" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background='var(--gray-50)'">
        <div style="font-size:2rem;margin-bottom:0.5rem;color:var(--gray-500)">${prodState.showAllMoods ? '🔼' : '➕'}</div>
        <div style="font-weight:700;font-size:0.9rem;color:var(--gray-600)">${prodState.showAllMoods ? 'Lebih Sedikit' : 'Lainnya'}</div>
      </div>
    </div>
  `;
  return card;
}

window.setMood = async (id) => {
  prodState.mood = id;
  const mood = MOODS.find(m => m.id === id);
  
  if (mood) {
    // 1. Set Audio Automation
    changeAudioTrack(mood.track, true); 
    
    // 2. Set Timer Automation
    if (mood.timer > 0) {
      setPomoDuration(mood.timer);
      startPomodoro();
      showToast(`Mode ${mood.label} Aktif: Timer ${mood.timer} menit & Musik berjalan 🚀`);
    } else {
      pausePomodoro();
      showToast(`Mode ${mood.label} Aktif: Musik santai tanpa timer 🧘`);
    }
  }
  
  renderApp(); // optimistically update UI
  
  if (window.ProductivityService && prodState.selectedBookingId && mood) {
    try {
      await ProductivityService.logMood(prodState.selectedBookingId, {
        moodScore: mood.score,
        note: mood.label
      });
    } catch (e) {
      console.error(e);
    }
  }
};

function renderWorkspaceRec() {
  const mood = MOODS.find(m=>m.id===prodState.mood);
  const card = el('div', 'card mb-4');
  card.innerHTML = `
    <div style="background:var(--green);padding:1rem 1.5rem;color:#fff;display:flex;align-items:center;gap:0.75rem;border-radius:16px 16px 0 0;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;">${mood.emoji}</span>
      <span style="font-weight:700">Saran Aktivitas: "${mood.label}"</span>
    </div>
    <div style="padding:1.25rem;display:flex;gap:1rem;align-items:center">
      <div style="flex:1">
        <div style="font-weight:700;font-size:1rem">${mood.rec}</div>
        <div style="font-size:0.8rem;color:var(--gray-500);margin:4px 0">${mood.recNote}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.5rem">
        <button class="btn btn-ghost btn-sm" onclick="navigate('search')">Jelajahi</button>
      </div>
    </div>
  `;
  return card;
}

function renderDailySchedule() {
  const card = el('div', 'card mb-4');
  
  let listHtml = '';
  if (prodState.itineraries.length === 0) {
    listHtml = `<div style="text-align:center;color:var(--gray-400);padding:2rem">Belum ada jadwal. Tambahkan jadwal harian Anda.</div>`;
  } else {
    listHtml = prodState.itineraries.map((s, i) => {
      const timeStr = new Date(s.timeSlot).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const done = prodState.itemStatus[s.id] === 'done';
      return `
        <div id="itin-block-${s.id}" class="time-block" style="opacity:${done?0.6:1};transition:all 0.3s ease;display:flex;align-items:center;margin-bottom:0.75rem;padding:0.75rem;background:#fff;border:1px solid var(--gray-200);border-radius:12px">
          <label class="dopamine-checkbox" style="margin-bottom:0">
            <input type="checkbox" onchange="toggleItinStatus(${s.id}, this)" ${done ? 'checked' : ''}>
            <span class="checkmark"></span>
          </label>
          <div style="font-weight:700;color:var(--gray-500);width:50px;margin-left:4px">${timeStr}</div>
          <div id="itin-text-${s.id}" style="flex:1;font-weight:600;transition:all 0.3s ease;${done?'text-decoration:line-through;color:var(--gray-400)':''}">${s.activityName}</div>
          <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteItin(${s.id})">Hapus</button>
        </div>
      `;
    }).join('');
  }

  card.innerHTML = `
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;align-items:center;background:#FAF9F6;border-radius:16px 16px 0 0;">
      <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark)"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Jadwal Harian (Itinerary)</h3>
    </div>
    <div style="padding:1.25rem;display:flex;flex-direction:column;">
      ${listHtml}
      
      <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px dashed var(--gray-200)">
        <h4 style="margin-bottom:1rem;font-size:0.875rem">Tambah Jadwal Baru</h4>
        <div style="display:flex;gap:0.5rem">
          <input type="time" id="new-itin-time" style="padding:0.5rem;border:1px solid var(--gray-300);border-radius:8px" required />
          <input type="text" id="new-itin-name" placeholder="Nama aktivitas..." style="flex:1;padding:0.5rem;border:1px solid var(--gray-300);border-radius:8px" required />
          <button class="btn btn-primary" onclick="submitNewItin()">Tambah</button>
        </div>
      </div>
    </div>
  `;
  return card;
}

window.submitNewItin = async () => {
  const time = document.getElementById('new-itin-time').value;
  const name = document.getElementById('new-itin-name').value;
  
  if (!time || !name) return showToast('Harap isi waktu dan nama aktivitas');
  
  try {
    const res = await ProductivityService.addItinerary(prodState.selectedBookingId, {
      dayNumber: 1,
      activityName: name,
      timeSlot: time,
      isProductivity: true
    });
    prodState.itineraries.push(res);
    prodState.itineraries.sort((a,b) => new Date(a.timeSlot) - new Date(b.timeSlot));
    renderApp();
  } catch (e) {
    showToast('Gagal menambah jadwal');
  }
};

window.deleteItin = async (id) => {
  try {
    await ProductivityService.deleteItinerary(id);
    prodState.itineraries = prodState.itineraries.filter(i => i.id !== id);
    renderApp();
  } catch(e) {
    showToast('Gagal menghapus jadwal');
  }
};

window.toggleItinStatus = (id, el) => {
  const checked = el.checked;
  prodState.itemStatus[id] = checked ? 'done' : 'pending';
  
  const textEl = document.getElementById('itin-text-' + id);
  const blockEl = document.getElementById('itin-block-' + id);
  
  if (checked) {
    // Play dopamine sound (Tingsha bell / chime)
    const chime = new Audio('https://upload.wikimedia.org/wikipedia/commons/b/b5/Radio_chime.ogg');
    chime.volume = 0.5;
    chime.play().catch(e => console.log("Audio play failed"));
    
    if (textEl) {
      textEl.style.textDecoration = 'line-through';
      textEl.style.color = 'var(--gray-400)';
    }
    if (blockEl) blockEl.style.opacity = '0.6';
  } else {
    if (textEl) {
      textEl.style.textDecoration = 'none';
      textEl.style.color = 'inherit'; // Will inherit from the row
    }
    if (blockEl) blockEl.style.opacity = '1';
  }
};

function renderPomodoro() {
  const mode = prodState.pomodoroMode || 'focus';
  const ringColor = mode === 'rest' ? '#3b82f6' : 'var(--green)';
  const ringBg = mode === 'rest' ? '#eff6ff' : 'var(--gray-100)';
  const textColor = mode === 'rest' ? '#1d4ed8' : 'var(--green-dark)';
  
  const timeLeft = prodState.pomodoroTime;
  const mins = String(Math.floor(timeLeft/60)).padStart(2,'0');
  const secs = String(timeLeft%60).padStart(2,'0');
  const progress = 1 - (timeLeft / prodState.pomodoroMax);
  const circumference = 2 * Math.PI * 80;
  const dashOffset = circumference * (1 - progress);
  
  const isPaused = !prodState.pomodoroRunning && timeLeft < prodState.pomodoroMax;
  const btnLabel = prodState.pomodoroRunning ? '⏸ Pause' : (isPaused ? '▶ Lanjutkan' : '▶ Mulai');
  const btnBg = prodState.pomodoroRunning ? '#fef2f2' : ringColor;
  const btnColor = prodState.pomodoroRunning ? '#ef4444' : '#ffffff';
  const btnShadow = prodState.pomodoroRunning ? 'none' : `0 8px 16px ${ringColor}40`;

  const card = el('div', 'card');
  card.style.padding = '2rem 1.5rem';
  card.style.borderRadius = '24px';
  card.style.border = '1px solid var(--gray-100)';
  card.style.boxShadow = '0 4px 24px rgba(0,0,0,0.02)';
  card.innerHTML = `
    <h3 style="font-weight:800;font-size:1.1rem;color:${textColor};text-align:center;margin-bottom:2rem;display:flex;align-items:center;justify-content:center;gap:8px">
      <svg style="width:24px;height:24px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
      ${mode === 'rest' ? 'Waktu Istirahat' : 'Focus Timer'}
    </h3>
    
    <div class="pomodoro-ring" style="position:relative; width:220px; height:220px; margin: 0 auto;">
      <svg width="220" height="220" viewBox="0 0 220 220" style="transform: rotate(-90deg); filter:drop-shadow(0 12px 24px rgba(0,0,0,0.05))">
        <circle cx="110" cy="110" r="90" fill="none" stroke="${ringBg}" stroke-width="12"/>
        <circle id="pomo-ring" cx="110" cy="110" r="90" fill="none" stroke="${ringColor}" stroke-width="12"
          stroke-dasharray="${circumference * (90/80)}" stroke-dashoffset="${dashOffset * (90/80)}"
          stroke-linecap="round" style="transition:stroke-dashoffset 1s linear"/>
      </svg>
      <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <div class="pomodoro-time" id="pomo-time" style="font-size:3.5rem; font-weight:800; color:${textColor}; line-height:1; letter-spacing:-1px">${mins}:${secs}</div>
        <div id="pomo-status" style="font-size:0.9rem; color:var(--gray-500); font-weight:700; margin-top:8px; text-transform:uppercase; letter-spacing:1px">${prodState.pomodoroRunning?(mode==='rest'?'Santai..':'Fokus!'):'Siap?'}</div>
      </div>
    </div>
    
    <div style="display:flex;gap:1rem;justify-content:center;margin-top:2.5rem">
      <button class="btn" style="flex:1; background:${btnBg}; color:${btnColor}; border:none; padding:1rem; border-radius:16px; font-weight:800; font-size:1rem; transition:all 0.3s; box-shadow:${btnShadow}" onclick="${prodState.pomodoroRunning?'pausePomodoro()':'startPomodoro()'}">
        ${btnLabel}
      </button>
      <button class="btn" style="flex:1; background:var(--gray-50); color:var(--gray-600); border:1px solid var(--gray-200); padding:1rem; border-radius:16px; font-weight:700; font-size:1rem; transition:all 0.3s" onclick="resetPomodoro()" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background='var(--gray-50)'">
        Reset
      </button>
    </div>
    
    <div style="text-align:center;margin-top:2rem;padding:1.25rem;background:linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);border:1px solid #d1fae5;border-radius:20px;position:relative">
      <span style="font-size:2rem;font-weight:900;color:var(--green)">${prodState.sessions}</span>
      <span style="font-size:0.95rem;color:var(--green-dark);font-weight:700;margin-left:8px">Sesi Fokus Selesai</span>
      ${prodState.sessions > 0 ? `
        <button style="position:absolute;top:50%;right:1rem;transform:translateY(-50%);background:var(--red-light);color:var(--red);border:none;width:32px;height:32px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s" onclick="resetSessions()" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='var(--red-light)'" title="Reset Sesi">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      ` : ''}
    </div>
    
    <div style="margin-top:1.5rem;display:flex;gap:0.5rem;justify-content:center;background:var(--gray-50);padding:0.5rem;border-radius:100px;border:1px solid var(--gray-200);flex-wrap:wrap">
      <button style="flex:1; min-width:55px; border:none; background:${prodState.pomodoroMax===5*60&&mode==='rest'?'var(--white)':'transparent'}; box-shadow:${prodState.pomodoroMax===5*60&&mode==='rest'?'0 2px 8px rgba(0,0,0,0.08)':'none'}; border-radius:100px; padding:0.6rem 0.25rem; font-weight:700; font-size:0.75rem; color:${prodState.pomodoroMax===5*60&&mode==='rest'?'#2563eb':'var(--gray-500)'}; cursor:pointer; transition:all 0.3s" onclick="setPomoDuration(5, 'rest')">5m Rest</button>
      <button style="flex:1; min-width:55px; border:none; background:${prodState.pomodoroMax===15*60&&mode==='rest'?'var(--white)':'transparent'}; box-shadow:${prodState.pomodoroMax===15*60&&mode==='rest'?'0 2px 8px rgba(0,0,0,0.08)':'none'}; border-radius:100px; padding:0.6rem 0.25rem; font-weight:700; font-size:0.75rem; color:${prodState.pomodoroMax===15*60&&mode==='rest'?'#2563eb':'var(--gray-500)'}; cursor:pointer; transition:all 0.3s" onclick="setPomoDuration(15, 'rest')">15m Rest</button>
      <button style="flex:1; min-width:55px; border:none; background:${prodState.pomodoroMax===25*60&&mode==='focus'?'var(--white)':'transparent'}; box-shadow:${prodState.pomodoroMax===25*60&&mode==='focus'?'0 2px 8px rgba(0,0,0,0.08)':'none'}; border-radius:100px; padding:0.6rem 0.25rem; font-weight:700; font-size:0.75rem; color:${prodState.pomodoroMax===25*60&&mode==='focus'?'var(--green-dark)':'var(--gray-500)'}; cursor:pointer; transition:all 0.3s" onclick="setPomoDuration(25, 'focus')">25m Fokus</button>
      <button style="flex:1; min-width:55px; border:none; background:${prodState.pomodoroMax===50*60&&mode==='focus'?'var(--white)':'transparent'}; box-shadow:${prodState.pomodoroMax===50*60&&mode==='focus'?'0 2px 8px rgba(0,0,0,0.08)':'none'}; border-radius:100px; padding:0.6rem 0.25rem; font-weight:700; font-size:0.75rem; color:${prodState.pomodoroMax===50*60&&mode==='focus'?'var(--green-dark)':'var(--gray-500)'}; cursor:pointer; transition:all 0.3s" onclick="setPomoDuration(50, 'focus')">50m Fokus</button>
    </div>
    
    ${prodState.showCustomForm ? `
      <div style="margin-top:1rem;padding:1.25rem;background:#fff;border:1px solid var(--gray-200);border-radius:16px;box-shadow:0 12px 24px rgba(0,0,0,0.04);animation: fadeIn 0.2s ease-out">
        <h4 style="font-size:0.9rem;font-weight:800;color:var(--gray-700);margin-bottom:1rem;text-align:center">Atur Waktu Kustom</h4>
        <div style="display:flex;gap:1rem;margin-bottom:1rem">
          <div style="flex:1">
            <label style="display:block;font-size:0.75rem;font-weight:700;color:var(--gray-500);margin-bottom:6px">Fokus (menit)</label>
            <input type="number" id="custom-focus-input" value="${(prodState.pomoConfig&&prodState.pomoConfig.focus)||25}" min="1" onkeydown="return false;" oninput="if(this.value !== '' && this.value < 1) this.value = 1;" style="width:100%;padding:0.75rem;border:2px solid var(--gray-200);border-radius:12px;font-size:1.1rem;font-weight:800;color:var(--green-dark);outline:none;text-align:center;transition:border 0.3s;caret-color:transparent" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--gray-200)'" />
          </div>
          <div style="flex:1">
            <label style="display:block;font-size:0.75rem;font-weight:700;color:var(--gray-500);margin-bottom:6px">Istirahat (menit)</label>
            <input type="number" id="custom-rest-input" value="${(prodState.pomoConfig&&prodState.pomoConfig.rest)||5}" min="1" onkeydown="return false;" oninput="if(this.value !== '' && this.value < 1) this.value = 1;" style="width:100%;padding:0.75rem;border:2px solid var(--gray-200);border-radius:12px;font-size:1.1rem;font-weight:800;color:var(--blue-dark);outline:none;text-align:center;transition:border 0.3s;caret-color:transparent" onfocus="this.style.borderColor='var(--blue)'" onblur="this.style.borderColor='var(--gray-200)'" />
          </div>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button style="flex:1;background:var(--green);color:#fff;border:none;padding:0.75rem;border-radius:12px;font-weight:800;cursor:pointer;transition:all 0.2s" onclick="submitCustomPomo()" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Simpan & Mulai</button>
          <button style="background:var(--gray-100);color:var(--gray-600);border:none;padding:0.75rem 1rem;border-radius:12px;font-weight:700;cursor:pointer;transition:all 0.2s" onclick="toggleCustomForm()" onmouseover="this.style.background='var(--gray-200)'" onmouseout="this.style.background='var(--gray-100)'">Batal</button>
        </div>
      </div>
    ` : `
      <div style="text-align:center;margin-top:1rem">
        <button style="background:transparent;border:none;color:var(--gray-400);font-weight:600;font-size:0.875rem;cursor:pointer;text-decoration:underline;text-underline-offset:4px;transition:all 0.2s" onclick="toggleCustomForm()" onmouseover="this.style.color='var(--green)'" onmouseout="this.style.color='var(--gray-400)'">Atur Waktu Kustom Lainnya...</button>
      </div>
    `}
  `;

  return card;
}

// Pomodoro handlers
window.startPomodoro = () => {
  if (!prodState.pomodoroMode) prodState.pomodoroMode = 'focus';
  prodState.pomodoroRunning = true;
  renderApp();
  prodState.pomodoroInterval = setInterval(() => {
    if (prodState.pomodoroTime <= 0) {
      clearInterval(prodState.pomodoroInterval);
      prodState.pomodoroRunning = false;
      
      if (prodState.pomodoroMode === 'focus') {
        prodState.sessions++;
        const restDur = (prodState.pomoConfig && prodState.pomoConfig.rest) || 5;
        showToast(`🎉 Sesi Fokus Selesai! Waktunya Istirahat ${restDur} Menit.`);
        prodState.pomodoroMode = 'rest';
        prodState.pomodoroMax = restDur * 60;
        prodState.pomodoroTime = restDur * 60;
      } else {
        const focusDur = (prodState.pomoConfig && prodState.pomoConfig.focus) || 25;
        showToast(`⏰ Waktu Istirahat Habis! Mari kembali fokus.`);
        prodState.pomodoroMode = 'focus';
        prodState.pomodoroMax = focusDur * 60;
        prodState.pomodoroTime = focusDur * 60;
      }
      
      renderApp();
    } else {
      prodState.pomodoroTime--;
      const el_time = document.getElementById('pomo-time');
      const el_ring = document.getElementById('pomo-ring');
      
      if (el_time) {
        const m = String(Math.floor(prodState.pomodoroTime/60)).padStart(2,'0');
        const s = String(prodState.pomodoroTime%60).padStart(2,'0');
        el_time.textContent = `${m}:${s}`;
      }
      if (el_ring) {
        const circumference = 2 * Math.PI * 90; // r=90 now
        const progress = 1 - (prodState.pomodoroTime / prodState.pomodoroMax);
        const dashOffset = circumference * (1 - progress);
        el_ring.style.strokeDashoffset = dashOffset;
      }
      
      const zen_time = document.getElementById('zen-pomo-time');
      if (zen_time) {
        const m = String(Math.floor(prodState.pomodoroTime/60)).padStart(2,'0');
        const s = String(prodState.pomodoroTime%60).padStart(2,'0');
        zen_time.textContent = `${m}:${s}`;
      }
    }
  }, 1000);
};

window.pausePomodoro = () => {
  clearInterval(prodState.pomodoroInterval);
  prodState.pomodoroRunning = false;
  renderApp();
};

window.resetPomodoro = () => {
  clearInterval(prodState.pomodoroInterval);
  prodState.pomodoroRunning = false;
  prodState.pomodoroTime = prodState.pomodoroMax;
  renderApp();
};

window.resetSessions = () => {
  prodState.sessions = 0;
  renderApp();
};

window.setPomoDuration = (mins, mode = 'focus') => {
  clearInterval(prodState.pomodoroInterval);
  prodState.pomodoroRunning = false;
  prodState.pomodoroMax = mins * 60;
  prodState.pomodoroTime = mins * 60;
  prodState.pomodoroMode = mode;
  if (!prodState.pomoConfig) prodState.pomoConfig = { focus: 25, rest: 5 };
  if (mode === 'focus') prodState.pomoConfig.focus = mins;
  if (mode === 'rest') prodState.pomoConfig.rest = mins;
  renderApp();
};

window.toggleCustomForm = () => {
  prodState.showCustomForm = !prodState.showCustomForm;
  renderApp();
};

window.submitCustomPomo = () => {
  const focusInput = document.getElementById('custom-focus-input');
  const restInput = document.getElementById('custom-rest-input');
  
  if (!focusInput || !restInput) return;
  
  const focusTime = parseInt(focusInput.value);
  const restTime = parseInt(restInput.value);
  
  if (isNaN(focusTime) || isNaN(restTime) || focusTime <= 0 || restTime <= 0) {
    showToast('Harap masukkan angka (menit) yang valid');
    return;
  }
  
  if (!prodState.pomoConfig) prodState.pomoConfig = { focus: 25, rest: 5 };
  prodState.pomoConfig.focus = focusTime;
  prodState.pomoConfig.rest = restTime;
  prodState.showCustomForm = false;
  
  setPomoDuration(focusTime, 'focus');
  startPomodoro();
};

function renderAudioPlayer() {
  const currentTrack = AUDIO_TRACKS.find(t => t.id === prodState.audio.trackId);
  const card = el('div', 'card');
  card.style.marginTop = '1.5rem';
  card.style.padding = '1.5rem';
  card.style.background = 'rgba(255,255,255,0.85)';
  card.style.backdropFilter = 'blur(10px)';
  
  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:8px">
        <svg style="width:20px;height:20px;color:var(--green)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
        <span style="font-weight:700;font-size:1rem;color:var(--gray-900)">Focus Audio</span>
      </div>
      <div style="font-size:0.75rem;color:var(--gray-500);font-weight:600;padding:4px 8px;background:var(--gray-100);border-radius:100px">
        ${prodState.audio.isPlaying ? 'Mendengarkan' : 'Jeda'}
      </div>
    </div>
    
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
      <button onclick="toggleAudio()" style="width:48px;height:48px;border-radius:50%;border:none;background:var(--green);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(15,118,110,0.3);flex-shrink:0;transition:all 0.2s">
        ${prodState.audio.isPlaying 
          ? `<svg style="width:24px;height:24px" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`
          : `<svg style="width:24px;height:24px" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>`
        }
      </button>
      
      <div style="flex:1">
        <select onchange="changeAudioTrack(this.value)" style="width:100%;padding:0.6rem 0.75rem;border-radius:8px;border:1px solid var(--gray-200);background:#fff;color:var(--gray-700);font-size:0.875rem;font-weight:600;cursor:pointer;outline:none">
          ${AUDIO_TRACKS.map(t => `
            <option value="${t.id}" ${t.id === prodState.audio.trackId ? 'selected' : ''}>${t.name}</option>
          `).join('')}
        </select>
      </div>
    </div>
    
    <div style="display:flex;align-items:center;gap:0.75rem">
      <svg style="width:16px;height:16px;color:var(--gray-400)" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8.5 8.5 0 010 11.9m-9.193-4.143l-3.267-3.267A2 2 0 004.07 10H3a1 1 0 00-1 1v2a1 1 0 001 1h1.071a2 2 0 001.42-.586l3.267-3.267z"></path></svg>
      <input type="range" id="audio-volume-slider" min="0" max="100" value="${focusAudioEl ? focusAudioEl.volume * 100 : 50}" onchange="changeAudioVolume(this.value)" style="flex:1;accent-color:var(--green);height:4px;border-radius:2px;cursor:pointer" />
    </div>
  `;
  
  return card;
}

window.toggleAudio = () => {
  if (!focusAudioEl) return;
  if (prodState.audio.isPlaying) {
    focusAudioEl.pause();
    prodState.audio.isPlaying = false;
  } else {
    // If src is empty, set it
    if (!focusAudioEl.src || focusAudioEl.src.includes('undefined')) {
      focusAudioEl.src = AUDIO_TRACKS.find(t => t.id === prodState.audio.trackId).url;
    }
    focusAudioEl.play().catch(e => console.error("Audio play failed:", e));
    prodState.audio.isPlaying = true;
  }
  renderApp();
};

window.changeAudioTrack = (trackId, autoFadeIn = false) => {
  if (!focusAudioEl) return;
  prodState.audio.trackId = trackId;
  const track = AUDIO_TRACKS.find(t => t.id === trackId);
  focusAudioEl.src = track.url;
  
  if (autoFadeIn) {
    focusAudioEl.volume = 0;
    focusAudioEl.play().catch(e => console.error("Audio play failed:", e));
    prodState.audio.isPlaying = true;
    
    let vol = 0;
    const fadeInterval = setInterval(() => {
      vol += 0.05;
      if (vol >= 0.5) {
        clearInterval(fadeInterval);
        focusAudioEl.volume = 0.5;
      } else {
        focusAudioEl.volume = vol;
      }
      // Sync slider if visible
      const slider = document.getElementById('audio-volume-slider');
      if (slider) slider.value = focusAudioEl.volume * 100;
    }, 200);
  } else {
    if (prodState.audio.isPlaying) {
      focusAudioEl.play().catch(e => console.error("Audio play failed:", e));
    }
  }
  renderApp();
};

window.changeAudioVolume = (val) => {
  if (focusAudioEl) focusAudioEl.volume = val / 100;
};

// ==========================================
// REALTIME WEATHER & CLOCK
// ==========================================

const WX_ICONS = {
  sun: `<svg style="width:40px;height:40px;color:#fbbf24;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));animation:spinSun 12s linear infinite;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
  moon: `<svg style="width:40px;height:40px;color:#e2e8f0;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));animation:floatCard 6s ease-in-out infinite;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`,
  cloud: `<svg style="width:40px;height:40px;color:#e2e8f0;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));animation:floatCard 4s ease-in-out infinite;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>`,
  rain: `<svg style="width:40px;height:40px;color:#93c5fd;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));animation:floatCard 3s ease-in-out infinite;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-1.5 4.5M15 15l-1.5 4.5M11 16l-1.5 4.5M7 17l-1.5 4.5M21 10a5.002 5.002 0 00-9.78-2.096 5 5 0 10-8.12 4.096H21z"></path></svg>`
};

let weatherLoaderInterval;
let clockInterval;

window.startRealtimeClock = () => {
  const clockEl = document.getElementById('rt-clock');
  if (!clockEl) return;
  if (clockInterval) clearInterval(clockInterval);
  
  const updateClock = () => {
    if (!document.getElementById('rt-clock')) return;
    const now = new Date();
    document.getElementById('rt-clock').innerText = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
};

window.fetchRealtimeWeather = async (locName) => {
  const iconContainer = document.getElementById('weather-icon-container');
  if (!iconContainer) return;
  
  // Start loading animation (cycling icons)
  const icons = ['sun', 'cloud', 'rain'];
  let idx = 0;
  iconContainer.innerHTML = WX_ICONS[icons[idx]];
  weatherLoaderInterval = setInterval(() => {
    idx = (idx + 1) % icons.length;
    iconContainer.innerHTML = WX_ICONS[icons[idx]];
    
    // Animate text ellipsis
    const condEl = document.getElementById('rt-cond');
    if(condEl && condEl.innerText.includes('Memuat')) {
      const dots = condEl.innerText.match(/\./g)?.length || 0;
      condEl.innerText = 'Memuat' + '.'.repeat((dots + 1) % 4);
    }
  }, 800);

  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(locName)}?format=j1&lang=id`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    
    clearInterval(weatherLoaderInterval); // Stop loading animation
    
    const temp = data.current_condition[0].temp_C;
    let cond = data.current_condition[0].weatherDesc[0].value;
    if (data.current_condition[0].lang_id && data.current_condition[0].lang_id[0]) {
      cond = data.current_condition[0].lang_id[0].value;
    }
    
    const tempEl = document.getElementById('rt-temp');
    const condEl = document.getElementById('rt-cond');
    if (tempEl) tempEl.innerText = temp + '°C';
    if (condEl) condEl.innerText = cond + ' • ' + locName;
    
    // Set dynamic icon based on condition
    const lowerCond = cond.toLowerCase();
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;
    
    let finalIcon = isNight ? 'moon' : 'sun';
    
    if (lowerCond.includes('hujan') || lowerCond.includes('rain') || lowerCond.includes('drizzle')) {
      finalIcon = 'rain';
    } else if (lowerCond.includes('awan') || lowerCond.includes('mendung') || lowerCond.includes('cloud') || lowerCond.includes('overcast') || lowerCond.includes('kabut') || lowerCond.includes('fog')) {
      finalIcon = 'cloud';
    }
    iconContainer.innerHTML = WX_ICONS[finalIcon];
    
  } catch (e) {
    console.error('Realtime weather fetch failed:', e);
    clearInterval(weatherLoaderInterval);
    // Fallback to sun if failed
    if(iconContainer) iconContainer.innerHTML = WX_ICONS['sun'];
    const tempEl = document.getElementById('rt-temp');
    if(tempEl && tempEl.innerText === '--°C') tempEl.innerText = '28°C';
    const condEl = document.getElementById('rt-cond');
    if(condEl && condEl.innerText.includes('Memuat')) condEl.innerText = 'Cerah (Offline) • ' + locName;
  }
};

function renderZenModeUI() {
  const page = el('div', 'page fade-in');
  
  let locImg = 'assets/images/hero-aerial.png';
  if (prodState.activeBooking && prodState.activeBooking.package && prodState.activeBooking.package.location) {
    if (prodState.activeBooking.package.location.img) {
      locImg = prodState.activeBooking.package.location.img;
    }
  }

  const timeLeft = prodState.pomodoroTime;
  const mins = String(Math.floor(timeLeft/60)).padStart(2,'0');
  const secs = String(timeLeft%60).padStart(2,'0');

  const currentTrack = AUDIO_TRACKS.find(t => t.id === prodState.audio.trackId);
  const audioMini = `
    <div style="position:fixed;bottom:2rem;left:2rem;z-index:100;background:rgba(0,0,0,0.6);backdrop-filter:blur(20px);padding:0.75rem 1.25rem;border-radius:100px;display:flex;align-items:center;gap:1rem;color:#fff;box-shadow:0 10px 40px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1)">
      <button onclick="toggleAudio()" style="background:transparent;border:none;color:#fff;cursor:pointer;padding:0;">
        ${prodState.audio.isPlaying 
          ? `<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`
          : `<svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>`
        }
      </button>
      <select onchange="changeAudioTrack(this.value)" style="background:transparent;color:#fff;border:none;font-size:0.9rem;font-weight:600;outline:none;cursor:pointer;-webkit-appearance:none;padding-right:1rem;">
        ${AUDIO_TRACKS.map(t => `<option style="color:#000" value="${t.id}" ${t.id === prodState.audio.trackId ? 'selected' : ''}>${t.name}</option>`).join('')}
      </select>
    </div>
  `;

  page.innerHTML = `
    <!-- Background Image -->
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background-image:url('${locImg}');background-size:cover;background-position:center;z-index:0;"></div>
    <!-- Deep dark overlay -->
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(2, 6, 23, 0.7);backdrop-filter:blur(8px);z-index:1;"></div>
    
    <!-- Content Center -->
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;">
      <div style="font-size:1.5rem;font-weight:600;margin-bottom:2rem;text-shadow:0 2px 10px rgba(0,0,0,0.5);opacity:0.9">
        Apa fokus kamu sekarang? ✏️
      </div>
      
      <div style="display:flex;gap:1rem;margin-bottom:4rem;">
        <button onclick="setPomoDuration(25)" style="padding:10px 24px;border-radius:100px;font-weight:700;font-size:1rem;cursor:pointer;transition:all 0.2s;background:${prodState.pomodoroMax===25*60?'rgba(139, 92, 246, 1)':'rgba(255,255,255,0.1)'};color:#fff;border:1px solid rgba(255,255,255,0.2)">Pomodoro</button>
        <button onclick="setPomoDuration(5)" style="padding:10px 24px;border-radius:100px;font-weight:700;font-size:1rem;cursor:pointer;transition:all 0.2s;background:${prodState.pomodoroMax===5*60?'rgba(139, 92, 246, 1)':'rgba(255,255,255,0.1)'};color:#fff;border:1px solid rgba(255,255,255,0.2)">Short Break</button>
        <button onclick="setPomoDuration(15)" style="padding:10px 24px;border-radius:100px;font-weight:700;font-size:1rem;cursor:pointer;transition:all 0.2s;background:${prodState.pomodoroMax===15*60?'rgba(139, 92, 246, 1)':'rgba(255,255,255,0.1)'};color:#fff;border:1px solid rgba(255,255,255,0.2)">Long Break</button>
      </div>

      <div id="zen-pomo-time" style="font-size:12rem;font-weight:900;line-height:1;margin-bottom:3rem;text-shadow:0 10px 30px rgba(0,0,0,0.3);letter-spacing:-0.03em;">
        ${mins}:${secs}
      </div>

      <div style="display:flex;align-items:center;gap:1.5rem">
        <button onclick="${prodState.pomodoroRunning?'pausePomodoro()':'startPomodoro()'}" style="background:rgba(139, 92, 246, 1);color:#fff;border:none;padding:16px 64px;border-radius:100px;font-size:1.5rem;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(139, 92, 246, 0.4);transition:transform 0.2s" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
          ${prodState.pomodoroRunning ? 'PAUSE' : 'START'}
        </button>
        
        <button onclick="resetPomodoro()" style="background:transparent;border:none;color:#fff;cursor:pointer;padding:8px;opacity:0.8;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
      </div>
    </div>

    ${audioMini}

    <!-- Exit button bottom right -->
    <div style="position:fixed;bottom:2rem;right:2rem;z-index:100;">
      <button onclick="toggleZenMode()" title="Keluar dari Zen Mode" style="background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:12px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
      </button>
    </div>
  `;
  
  return page;
}
