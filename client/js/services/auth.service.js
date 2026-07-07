// API_URL removed in favor of CONFIG.API_BASE_URL

class AuthService {
  static getToken() {
    return localStorage.getItem('glow_token');
  }

  static setToken(token) {
    localStorage.setItem('glow_token', token);
  }

  static removeToken() {
    localStorage.removeItem('glow_token');
  }

  static async login(email, password) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.setToken(data.token);
    return data.user;
  }

  static async register(fullName, email, password, role = 'USER') {
    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    this.setToken(data.token);
    return data.user;
  }

  static async getMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Invalid token');
      return data.user;
    } catch (e) {
      this.removeToken();
      return null;
    }
  }

  static logout() {
    const content = document.createElement('div');
    content.style.padding = '1.5rem';
    content.style.textAlign = 'center';
    content.innerHTML = `
      <div style="margin-bottom:1rem;color:#ef4444">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </div>
      <h3 style="font-size:1.5rem;font-weight:800;margin-bottom:0.75rem;color:var(--gray-900)">Keluar dari Akun?</h3>
      <p style="color:var(--gray-600);margin-bottom:2rem;line-height:1.6">Sesi Anda akan diakhiri dan Anda perlu login kembali untuk mengakses dasbor.</p>
      <div style="display:flex;gap:1rem;justify-content:center">
        <button id="btn-cancel-logout" style="padding:0.75rem 1.5rem;border-radius:12px;border:1px solid var(--gray-200);background:#fff;font-weight:700;color:var(--gray-600);cursor:pointer;flex:1;transition:all 0.2s">Batal</button>
        <button id="btn-confirm-logout" style="padding:0.75rem 1.5rem;border-radius:12px;border:none;background:#ef4444;font-weight:700;color:#fff;cursor:pointer;flex:1;transition:all 0.2s;box-shadow:0 4px 12px rgba(239,68,68,0.2)">Ya, Logout</button>
      </div>
    `;
    
    showModal(content);
    
    content.querySelector('#btn-cancel-logout').onclick = () => closeModal();
    content.querySelector('#btn-confirm-logout').onclick = () => {
      closeModal();
      this.removeToken();
      if (typeof State !== 'undefined') {
        State.set('user', null);
        State.set('favorites', []);
        State.set('savedPackages', []);
        State.set('currentPage', 'search');
        State.saveAppState();
      }
      localStorage.removeItem('glow_savedBookingProfile');
      localStorage.removeItem('glow_packages');
      localStorage.removeItem('glow_mock_bookings');
      window.location.hash = '';
      window.location.reload();
    };
  }
}

window.AuthService = AuthService;
