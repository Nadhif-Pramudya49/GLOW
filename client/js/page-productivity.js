// ===== PAGE: PRODUCTIVITY MODE =====

let prodState = {
  mood: null,
  pomodoroRunning: false,
  pomodoroTime: 25 * 60,
  pomodoroMax: 25 * 60,
  sessions: 3,
  pomodoroInterval: null,
  schedule: [
    { time:'06:00', label:'Sunrise di Bukit Panguk', type:'wisata', icon:'' },
    { time:'08:00', label:'Sarapan @ Warung Kopi Nelayan', type:'makan', icon:'' },
    { time:'09:00', label:'Deep Work @ Kopi Kidul Workspace', type:'kerja', icon:'' },
    { time:'12:00', label:'Makan siang RM Gudeg Bu Tini', type:'makan', icon:'' },
    { time:'13:00', label:'Kerja lagi @ Kopi Kidul', type:'kerja', icon:'' },
    { time:'15:30', label:'Pantai Indrayanti', type:'wisata', icon:'' },
    { time:'18:00', label:'Sunset + Seafood Depot Drini', type:'makan', icon:'' },
    { time:'20:00', label:'Istirahat & Refleksi', type:'istirahat', icon:'' },
  ],
  itemStatus: {},
};

const MOODS = [
  { id:'santai', emoji:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#f59e0b"><path d="M20 8h-3V4H3v13a4 4 0 004 4h9a4 4 0 004-4v-1h2a2 2 0 002-2V10a2 2 0 00-2-2z"></path></svg>', label:'Butuh Santai', rec:'Warung Kopi Nelayan', recNote:'Tepi pantai, santai' },
  { id:'fokus', emoji:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ef4444"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>', label:'Fokus Total', rec:'Kopi Kidul Workspace', recNote:'Tenang, AC, WiFi 50Mbps' },
  { id:'sosial', emoji:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#3b82f6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>', label:'Pengen Sosial', rec:'Rumah Kreatif GK', recNote:'Kolaboratif, ada event' },
  { id:'outdoor', emoji:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#10b981"><path d="M14 22v-4a2 2 0 10-4 0v4"></path><path d="M18 10h-2"></path><path d="M8 10H6"></path><path d="M12 2L2 22h20L12 2z"></path></svg>', label:'Mau Outdoor', rec:'Hutan Pinus Cowork', recNote:'Outdoor, sejuk, alam' },
];

function renderProductivityPage() {
  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '');
  header.style.cssText = 'position:relative;padding:3.5rem 0 3rem;color:#fff;overflow:hidden;';
  header.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url('assets/images/hero-aerial.png');background-size:cover;background-position:center;z-index:0;"></div>
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(15, 118, 110, 0.85);backdrop-filter:blur(4px);z-index:1;"></div>
    <div class="container" style="position:relative;z-index:2;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:2rem">
        <div>
          <span style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.1);border-radius:100px;font-size:0.7rem;font-weight:700;letter-spacing:1px;margin-bottom:12px;text-transform:uppercase;">Productivity Mode</span>
          <h1 style="font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:800;margin-bottom:0.25rem;">Hari ke-2 Workation</h1>
          <div style="opacity:0.9;font-size:1rem;margin-top:4px;">Rabu, 15 Januari 2025</div>
        </div>
        <div style="background:rgba(0,0,0,0.15);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);padding:1.25rem 1.5rem;border-radius:16px;display:flex;gap:1.5rem;align-items:center;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <svg style="width:36px;height:36px;color:#fbbf24;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <div>
              <div style="font-size:1.75rem;font-weight:800;line-height:1;margin-bottom:4px;">28°C</div>
              <div style="font-size:0.8rem;opacity:0.8;">Cerah • Gunung Kidul</div>
            </div>
          </div>
          <div style="width:1px;height:40px;background:rgba(255,255,255,0.2);"></div>
          <div>
            <div style="font-size:0.8rem;opacity:0.8;margin-bottom:6px;display:flex;justify-content:space-between;gap:1rem;"><span>Progress Workation</span><span style="font-weight:700;">Hari 2 dari 3</span></div>
            <div style="background:rgba(255,255,255,0.2);width:160px;height:6px;border-radius:100px;overflow:hidden;">
              <div style="background:#fff;width:66%;height:100%;border-radius:100px;box-shadow:0 0 8px rgba(255,255,255,0.5);"></div>
            </div>
          </div>
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

  // Facility Info
  left.appendChild(renderFacilityInfo());

  grid.appendChild(left);

  // Right: Pomodoro
  const right = el('div', '');
  right.appendChild(renderPomodoro());
  grid.appendChild(right);

  main.appendChild(grid);
  page.appendChild(main);
  return page;
}

function renderMoodCheckin() {
  const card = el('div', 'card mb-4');
  card.style.padding = '1.5rem';
  card.innerHTML = `
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);margin-bottom:0.25rem"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Mood Check-in Pagi</h3>
    <p style="font-size:0.875rem;color:var(--gray-400);margin-bottom:1.25rem">Bagaimana mood kerja kamu hari ini?</p>
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
      ${MOODS.map(m => `
        <div class="mood-option ${prodState.mood===m.id?'selected':''}" onclick="setMood('${m.id}')">
          <span class="mood-emoji">${m.emoji}</span>
          <span class="mood-label">${m.label}</span>
        </div>
      `).join('')}
    </div>
  `;
  return card;
}

function renderWorkspaceRec() {
  const mood = MOODS.find(m=>m.id===prodState.mood);
  const ws = DATA.workspace.find(w=>w.name.includes(mood.rec.split(' ')[0])) || DATA.workspace[1];
  const card = el('div', 'card mb-4');
  card.innerHTML = `
    <div style="background:var(--green);padding:1rem 1.5rem;color:#fff;display:flex;align-items:center;gap:0.75rem;border-radius:16px 16px 0 0;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;">${mood.emoji}</span>
      <span style="font-weight:700">Rekomendasi Workspace untuk "${mood.label}"</span>
    </div>
    <div style="padding:1.25rem;display:flex;gap:1rem;align-items:center">
      <img src="${ws.img}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;flex-shrink:0" onerror="this.src='https://picsum.photos/seed/${ws.id}r/200/200'" />
      <div style="flex:1">
        <div style="font-weight:700;font-size:1rem">${ws.name}</div>
        <div style="font-size:0.8rem;color:var(--gray-400);margin:4px 0">📶 ${ws.wifi} Mbps · ${mood.recNote}</div>
        <div class="rating"><span class="stars">⭐</span><span class="rating-score">${ws.rating}</span><span style="color:#16a34a;font-size:0.8rem;margin-left:8px">● 5 kursi tersedia</span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.5rem">
        <button class="btn btn-primary btn-sm"><svg style="width:16px;height:16px;display:inline-block;vertical-align:bottom;margin-right:4px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Navigasi</button>
        <button class="btn btn-ghost btn-sm" onclick="navigate('search')">Cari Lain</button>
      </div>
    </div>
  `;
  return card;
}

function renderDailySchedule() {
  const typeColor = { kerja:'slot-kerja', makan:'slot-makan', wisata:'slot-wisata', istirahat:'slot-istirahat' };
  const card = el('div', 'card mb-4');
  card.innerHTML = `
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;align-items:center;background:#FAF9F6;border-radius:16px 16px 0 0;">
      <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark)"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Jadwal Harian</h3>
      <div style="display:flex;gap:0.5rem;font-size:0.7rem">
        <span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:100px">🔵 Kerja</span>
        <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:100px">🟡 Istirahat</span>
        <span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:100px">🟢 Wisata</span>
        <span style="background:#ede9fe;color:#5b21b6;padding:2px 8px;border-radius:100px">🟣 Makan</span>
      </div>
    </div>
    <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.5rem">
      ${prodState.schedule.map((s,i) => {
        const status = prodState.itemStatus[i];
        const done = status === 'done';
        const active = status === 'active';
        return `
          <div class="time-block" style="opacity:${done?0.6:1}">
            <div class="time-label">${s.time}</div>
            <div class="time-slot ${typeColor[s.type]||'slot-kerja'}" style="${done?'text-decoration:line-through;opacity:0.7;':''} ${active?'box-shadow:0 0 0 2px var(--green);':''} display:flex;align-items:center;gap:8px">
              <span>${s.icon}</span>
              <span style="flex:1">${s.label}</span>
              ${done ? '<span>✓</span>' : ''}
            </div>
            <button style="flex-shrink:0;padding:4px 10px;border:none;border-radius:8px;cursor:pointer;font-size:0.75rem;background:${done?'#d1fae5':'var(--gray-100)'};color:${done?'#065f46':'var(--gray-500)'}" onclick="toggleScheduleItem(${i})">
              ${done ? '✓ Selesai' : 'Tandai'}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  return card;
}

function renderFacilityInfo() {
  const card = el('div', 'card mb-4');
  card.style.padding = '1.5rem';
  card.innerHTML = `
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);margin-bottom:1.25rem"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg> Info Fasilitas Workspace Aktif</h3>
    <div style="display:flex;flex-wrap:wrap;gap:1rem">
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:#FAF9F6;border-radius:12px">
        <div style="font-size:2rem;font-weight:800;color:var(--green)">87</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Mbps WiFi</div>
        <div style="width:50px;height:4px;background:var(--green);border-radius:2px;margin:4px auto"></div>
      </div>
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:#FAF9F6;border-radius:12px">
        <div style="color:var(--green);margin-bottom:4px;"><svg style="width:32px;height:32px;display:inline-block;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Colokan</div>
        <div style="font-size:0.8rem;font-weight:700;color:#16a34a">✓ Tersedia</div>
      </div>
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:#FAF9F6;border-radius:12px">
        <div style="color:var(--green);margin-bottom:4px;"><svg style="width:32px;height:32px;display:inline-block;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg></div>
        <div style="font-size:0.75rem;color:var(--gray-400)">AC</div>
        <div style="font-size:0.8rem;font-weight:700;color:#16a34a">✓ Nyala</div>
      </div>
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:#FAF9F6;border-radius:12px">
        <div style="font-size:1.5rem;font-weight:800;color:var(--gold);margin-bottom:4px;">12</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Orang</div>
        <div style="font-size:0.8rem;color:var(--green)">Tenang</div>
      </div>
    </div>
  `;
  return card;
}

function renderPomodoro() {
  const timeLeft = prodState.pomodoroTime;
  const mins = String(Math.floor(timeLeft/60)).padStart(2,'0');
  const secs = String(timeLeft%60).padStart(2,'0');
  const progress = 1 - (timeLeft / prodState.pomodoroMax);
  const circumference = 2 * Math.PI * 80;
  const dashOffset = circumference * (1 - progress);

  const card = el('div', 'card');
  card.style.padding = '1.5rem';
  card.innerHTML = `
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);text-align:center;margin-bottom:1.5rem"><svg style="width:20px;height:20px;display:inline-block;vertical-align:bottom;margin-right:6px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Focus Timer</h3>
    <div class="pomodoro-ring">
      <svg width="196" height="196" viewBox="0 0 196 196">
        <circle cx="98" cy="98" r="80" fill="none" stroke="var(--gray-200)" stroke-width="8"/>
        <circle cx="98" cy="98" r="80" fill="none" stroke="var(--green)" stroke-width="8"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
          stroke-linecap="round" style="transition:stroke-dashoffset 1s linear"/>
      </svg>
      <div style="text-align:center">
        <div class="pomodoro-time" id="pomo-time">${mins}:${secs}</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">${prodState.pomodoroRunning?'Fokus!':'Siap?'}</div>
      </div>
    </div>
    <div style="display:flex;gap:0.75rem;justify-content:center;margin-top:1.5rem">
      <button class="btn ${prodState.pomodoroRunning?'btn-ghost':'btn-primary'}" style="display:inline-flex;align-items:center;gap:4px;" onclick="${prodState.pomodoroRunning?'pausePomodoro()':'startPomodoro()'}">
        ${prodState.pomodoroRunning?'<svg style="width:16px;height:16px" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> Pause':'<svg style="width:16px;height:16px" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg> Mulai'}
      </button>
      <button class="btn btn-ghost" style="display:inline-flex;align-items:center;gap:4px;" onclick="resetPomodoro()">
        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reset
      </button>
    </div>
    <div style="text-align:center;margin-top:1.25rem;padding:0.875rem;background:var(--gray-50);border-radius:10px">
      <span style="font-size:1.5rem;font-weight:800;color:var(--green)">${prodState.sessions}</span>
      <span style="font-size:0.8rem;color:var(--gray-400);margin-left:6px">sesi hari ini</span>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.5rem;justify-content:center">
      <button class="btn btn-ghost btn-sm" onclick="setPomoDuration(25)">25 min</button>
      <button class="btn btn-ghost btn-sm" onclick="setPomoDuration(50)">50 min</button>
      <button class="btn btn-ghost btn-sm" onclick="setPomoDuration(5)">5 min Rest</button>
    </div>
  `;

  // Start card for itinerary
  const itinCard = el('div', 'card mt-4');
  itinCard.style.padding = '1.25rem';
  itinCard.innerHTML = `
    <div style="font-weight:700;font-size:0.875rem;color:var(--green-dark);margin-bottom:0.75rem"><svg style="width:16px;height:16px;display:inline-block;vertical-align:bottom;margin-right:4px;color:var(--green);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Lokasi Saat Ini</div>
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
      <img src="${DATA.workspace[1].img}" style="width:56px;height:56px;object-fit:cover;border-radius:8px" onerror="this.src='https://picsum.photos/seed/loc/200/200'" />
      <div>
        <div style="font-weight:600;font-size:0.875rem">${DATA.workspace[1].name}</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Jl. Pantai Selatan KM 5, GK</div>
        <div style="font-size:0.75rem;color:#16a34a;font-weight:600">● Sudah check-in</div>
      </div>
    </div>
    <button class="btn btn-outline btn-full btn-sm" style="display:flex;align-items:center;justify-content:center;gap:6px;" onclick="navigate('booking')"><svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Lihat Full Itinerary</button>
  `;

  const wrap = el('div', '');
  wrap.appendChild(card);
  wrap.appendChild(itinCard);
  return wrap;
}

// Productivity handlers
function setMood(id) { prodState.mood = id; renderApp(); }

function toggleScheduleItem(i) {
  const current = prodState.itemStatus[i];
  prodState.itemStatus[i] = current === 'done' ? null : 'done';
  renderApp();
}

function startPomodoro() {
  prodState.pomodoroRunning = true;
  renderApp();
  prodState.pomodoroInterval = setInterval(() => {
    if (prodState.pomodoroTime <= 0) {
      clearInterval(prodState.pomodoroInterval);
      prodState.pomodoroRunning = false;
      prodState.sessions++;
      prodState.pomodoroTime = prodState.pomodoroMax;
      renderApp();
      showToast('🎉 Sesi selesai! Istirahat sebentar.');
    } else {
      prodState.pomodoroTime--;
      // Update display without full re-render
      const el_time = document.getElementById('pomo-time');
      if (el_time) {
        const m = String(Math.floor(prodState.pomodoroTime/60)).padStart(2,'0');
        const s = String(prodState.pomodoroTime%60).padStart(2,'0');
        el_time.textContent = `${m}:${s}`;
      }
    }
  }, 1000);
}

function pausePomodoro() {
  clearInterval(prodState.pomodoroInterval);
  prodState.pomodoroRunning = false;
  renderApp();
}

function resetPomodoro() {
  clearInterval(prodState.pomodoroInterval);
  prodState.pomodoroRunning = false;
  prodState.pomodoroTime = prodState.pomodoroMax;
  renderApp();
}

function setPomoDuration(mins) {
  clearInterval(prodState.pomodoroInterval);
  prodState.pomodoroRunning = false;
  prodState.pomodoroMax = mins * 60;
  prodState.pomodoroTime = mins * 60;
  renderApp();
}
