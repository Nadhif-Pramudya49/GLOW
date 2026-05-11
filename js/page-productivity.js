// ===== PAGE: PRODUCTIVITY MODE =====

let prodState = {
  mood: null,
  pomodoroRunning: false,
  pomodoroTime: 25 * 60,
  pomodoroMax: 25 * 60,
  sessions: 3,
  pomodoroInterval: null,
  schedule: [
    { time:'06:00', label:'Sunrise di Bukit Panguk', type:'wisata', icon:'🌅' },
    { time:'08:00', label:'Sarapan @ Warung Kopi Nelayan', type:'makan', icon:'☕' },
    { time:'09:00', label:'Deep Work @ Kopi Kidul Workspace', type:'kerja', icon:'💻' },
    { time:'12:00', label:'Makan siang RM Gudeg Bu Tini', type:'makan', icon:'🍽️' },
    { time:'13:00', label:'Kerja lagi @ Kopi Kidul', type:'kerja', icon:'🎯' },
    { time:'15:30', label:'Pantai Indrayanti', type:'wisata', icon:'🏖️' },
    { time:'18:00', label:'Sunset + Seafood Depot Drini', type:'makan', icon:'🌅' },
    { time:'20:00', label:'Istirahat & Refleksi', type:'istirahat', icon:'🌙' },
  ],
  itemStatus: {},
};

const MOODS = [
  { id:'santai', emoji:'😴', label:'Butuh Santai', rec:'Warung Kopi Nelayan', recNote:'Tepi pantai, santai' },
  { id:'fokus', emoji:'🎯', label:'Fokus Total', rec:'Kopi Kidul Workspace', recNote:'Tenang, AC, WiFi 50Mbps' },
  { id:'sosial', emoji:'🤝', label:'Pengen Sosial', rec:'Rumah Kreatif GK', recNote:'Kolaboratif, ada event' },
  { id:'outdoor', emoji:'🌿', label:'Mau Outdoor', rec:'Hutan Pinus Cowork', recNote:'Outdoor, sejuk, alam' },
];

function renderProductivityPage() {
  const page = el('div', 'page fade-in');
  page.style.paddingBottom = '4rem';

  const header = el('div', '');
  header.style.cssText = 'background:linear-gradient(135deg,var(--green-dark),var(--green));padding:2.5rem 0 2rem;color:#fff';
  header.innerHTML = `
    <div class="container">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <div style="font-size:0.8rem;opacity:0.7;margin-bottom:4px">⚡ PRODUCTIVITY MODE</div>
          <h1 style="font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:800">Hari ke-2 Workation</h1>
          <div style="opacity:0.8;margin-top:2px">Rabu, 15 Januari 2025</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:2rem">☀️ 28°C</div>
          <div style="font-size:0.8rem;opacity:0.7">Cerah • Gunung Kidul</div>
          <div style="margin-top:8px">
            <div style="font-size:0.75rem;opacity:0.7;margin-bottom:4px">Progress Workation (2/3 hari)</div>
            <div class="progress-bar" style="background:rgba(255,255,255,0.2);width:180px"><div class="progress-fill" style="width:66%"></div></div>
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
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);margin-bottom:0.25rem">🌟 Mood Check-in Pagi</h3>
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
    <div style="background:var(--green);padding:1rem 1.5rem;color:#fff;display:flex;align-items:center;gap:0.5rem">
      <span style="font-size:1.25rem">${mood.emoji}</span>
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
        <button class="btn btn-primary btn-sm">🗺️ Navigasi</button>
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
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--gray-100);display:flex;justify-content:space-between;align-items:center">
      <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark)">📅 Jadwal Harian</h3>
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
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);margin-bottom:1.25rem">📡 Info Fasilitas Workspace Aktif</h3>
    <div style="display:flex;flex-wrap:wrap;gap:1rem">
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--gray-50);border-radius:12px">
        <div style="font-size:2rem;font-weight:800;color:var(--green)">87</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Mbps WiFi</div>
        <div style="width:50px;height:4px;background:var(--green);border-radius:2px;margin:4px auto"></div>
      </div>
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--gray-50);border-radius:12px">
        <div style="font-size:2rem">🔌</div><div style="font-size:0.75rem;color:var(--gray-400)">Colokan</div>
        <div style="font-size:0.8rem;font-weight:700;color:#16a34a">✓ Tersedia</div>
      </div>
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--gray-50);border-radius:12px">
        <div style="font-size:2rem">❄️</div><div style="font-size:0.75rem;color:var(--gray-400)">AC</div>
        <div style="font-size:0.8rem;font-weight:700;color:#16a34a">✓ Nyala</div>
      </div>
      <div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--gray-50);border-radius:12px">
        <div style="font-size:1.5rem;font-weight:800;color:var(--gold)">12</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Orang</div>
        <div style="font-size:0.8rem;color:var(--green)">🔇 Tenang</div>
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
    <h3 style="font-weight:800;font-size:1rem;color:var(--green-dark);text-align:center;margin-bottom:1.5rem">⏱️ Focus Timer (Pomodoro)</h3>
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
      <button class="btn ${prodState.pomodoroRunning?'btn-ghost':'btn-primary'}" onclick="${prodState.pomodoroRunning?'pausePomodoro()':'startPomodoro()'}">
        ${prodState.pomodoroRunning?'⏸ Pause':'▶ Mulai'}
      </button>
      <button class="btn btn-ghost" onclick="resetPomodoro()">↺ Reset</button>
    </div>
    <div style="text-align:center;margin-top:1.25rem;padding:0.875rem;background:var(--gray-50);border-radius:10px">
      <span style="font-size:1.5rem;font-weight:800;color:var(--green)">${prodState.sessions}</span>
      <span style="font-size:0.8rem;color:var(--gray-400);margin-left:6px">sesi hari ini 🔥</span>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.5rem;justify-content:center">
      <button class="btn btn-ghost btn-sm" onclick="setPomoDuration(25)">25 min</button>
      <button class="btn btn-ghost btn-sm" onclick="setPomoDuration(50)">50 min</button>
      <button class="btn btn-ghost btn-sm" onclick="setPomoDuration(5)">5 min 💤</button>
    </div>
  `;

  // Start card for itinerary
  const itinCard = el('div', 'card mt-4');
  itinCard.style.padding = '1.25rem';
  itinCard.innerHTML = `
    <div style="font-weight:700;font-size:0.875rem;color:var(--green-dark);margin-bottom:0.75rem">📍 Lokasi Saat Ini</div>
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
      <img src="${DATA.workspace[1].img}" style="width:56px;height:56px;object-fit:cover;border-radius:8px" onerror="this.src='https://picsum.photos/seed/loc/200/200'" />
      <div>
        <div style="font-weight:600;font-size:0.875rem">${DATA.workspace[1].name}</div>
        <div style="font-size:0.75rem;color:var(--gray-400)">Jl. Pantai Selatan KM 5, GK</div>
        <div style="font-size:0.75rem;color:#16a34a;font-weight:600">● Sudah check-in</div>
      </div>
    </div>
    <button class="btn btn-outline btn-full btn-sm" onclick="navigate('booking')">📅 Lihat Full Itinerary</button>
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
