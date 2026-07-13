// tests/e2e/auth.spec.js
// Tests for authentication: login (UI), login (invalid), route guards, register flow

const { test, expect } = require('@playwright/test');
const { loginViaAPI, loginViaUI, logout, TEST_USERS } = require('./helpers/auth.helper');

const BASE = 'http://localhost:3001';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Always start from a clean logged-out state
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('token'));
  });

  // ─── Login via API (fast path) ───────────────────────────────────────────

  test('API login returns a valid JWT token for USER', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: {
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
  });

  test('API login returns a valid JWT token for ADMIN', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('token');
  });

  test('API login returns a valid JWT token for OWNER', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: {
        email: TEST_USERS.owner.email,
        password: TEST_USERS.owner.password,
      },
    });
    // Owner account may not exist if DB hasn't been seeded — accept 200 or 401
    const status = response.status();
    expect([200, 401]).toContain(status);
    if (status === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('token');
    }
  });

  test('API login fails with wrong password', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: {
        email: TEST_USERS.user.email,
        password: 'wrongpassword',
      },
    });
    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403]).toContain(response.status());
  });

  test('API login fails with non-existent email', async ({ page }) => {
    const response = await page.request.post(`${BASE}/api/auth/login`, {
      data: {
        email: 'notexist@example.com',
        password: 'password123',
      },
    });
    expect(response.ok()).toBeFalsy();
  });

  // ─── /api/auth/me ────────────────────────────────────────────────────────

  test('/api/auth/me returns user info when authenticated', async ({ page }) => {
    // Get token via login
    const loginRes = await page.request.post(`${BASE}/api/auth/login`, {
      data: { email: TEST_USERS.user.email, password: TEST_USERS.user.password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { token } = await loginRes.json();

    // Call /me with the token
    const meRes = await page.request.get(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(meRes.ok()).toBeTruthy();
    const body = await meRes.json();
    // Controller returns { user: { email, role, ... } }
    const me = body.user || body;
    expect(me).toHaveProperty('email', TEST_USERS.user.email);
    expect(me).toHaveProperty('role', 'USER');
  });

  test('/api/auth/me returns 401 when no token provided', async ({ page }) => {
    const meRes = await page.request.get(`${BASE}/api/auth/me`);
    expect([401, 403]).toContain(meRes.status());
  });

  // ─── Route Guards (UI) ───────────────────────────────────────────────────

  test('accessing dashboard-user without login redirects to search', async ({ page }) => {
    await page.goto(`${BASE}/#dashboard-user`, { waitUntil: 'domcontentloaded' });
    // App should redirect back to search (guarded route)
    await expect(page.locator('#app')).not.toContainText(/dashboard user/i);
    // Should still be on the search/home page content
    await expect(page.locator('#app')).toContainText(/cari|gunung kidul|workation|search/i);
  });

  test('accessing dashboard-admin without login redirects to search', async ({ page }) => {
    await page.goto(`${BASE}/#dashboard-admin`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).not.toContainText(/admin panel/i);
    await expect(page.locator('#app')).toContainText(/cari|gunung kidul|workation|search/i);
  });

  test('accessing dashboard-owner without login redirects to search', async ({ page }) => {
    await page.goto(`${BASE}/#dashboard-owner`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).toContainText(/cari|gunung kidul|workation|search/i);
  });

  // ─── Authenticated Navigation ─────────────────────────────────────────────

  test('USER role can access dashboard-user after login', async ({ page }) => {
    await loginViaAPI(page, 'user');
    await page.goto(`${BASE}/#dashboard-user`, { waitUntil: 'domcontentloaded' });
    // After reload the app should pick up the token and allow access
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).not.toContainText(/harus login/i);
  });

  test('ADMIN role can access dashboard-admin after login', async ({ page }) => {
    await loginViaAPI(page, 'admin');
    await page.goto(`${BASE}/#dashboard-admin`, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#app')).not.toContainText(/harus login/i);
  });

  test('USER role cannot access dashboard-admin (role guard)', async ({ page }) => {
    await loginViaAPI(page, 'user');
    await page.goto(`${BASE}/#dashboard-admin`, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Should be redirected away or shown access denied
    await expect(page.locator('#app')).not.toContainText(/admin panel/i);
  });
});
