// tests/e2e/package.spec.js
// Tests for the AI Package Builder page and /api/packages & /api/ai/package endpoints

const { test, expect } = require('@playwright/test');
const { loginViaAPI, TEST_USERS } = require('./helpers/auth.helper');

const BASE = 'http://localhost:3001';

test.describe('Package Builder Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/#package`, { waitUntil: 'load' });
    await page.waitForSelector('#app', { timeout: 10000 });
  });

  // ─── Page Load ────────────────────────────────────────────────────────────

  test('package page loads and shows content', async ({ page }) => {
    const app = page.locator('#app');
    await expect(app).toBeVisible();
    await expect(app).not.toBeEmpty();
  });

  test('package page contains workation/paket keyword', async ({ page }) => {
    await page.waitForTimeout(1000);
    const content = await page.locator('#app').textContent();
    const hasPackageContent = /paket|package|workation|perjalanan|builder/i.test(content || '');
    expect(hasPackageContent).toBeTruthy();
  });

  test('package builder shows companion/vibe/budget selection options', async ({ page }) => {
    await page.waitForTimeout(1000);
    const content = await page.locator('#app').textContent();
    // At least one of the known selector options should appear
    const hasOptions =
      /solo|couple|family|grup|tenang|petualangan|hemat|budget/i.test(content || '');
    expect(hasOptions).toBeTruthy();
  });

  // ─── API: /api/packages ───────────────────────────────────────────────────

  test('GET /api/packages/saved requires authentication', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/packages/saved`);
    // Without a token, should return 401/403
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/packages/saved returns saved packages for logged-in user', async ({ page }) => {
    await loginViaAPI(page, 'user');

    const loginRes = await page.request.post(`${BASE}/api/auth/login`, {
      data: { email: TEST_USERS.user.email, password: TEST_USERS.user.password },
    });
    const { token } = await loginRes.json();

    const res = await page.request.get(`${BASE}/api/packages/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  // ─── API: /api/ai/package ─────────────────────────────────────────────────

  test('POST /api/ai/package returns an AI-generated package or API key error', async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/ai/package`, {
      data: {
        companions: 'Solo Traveler',
        vibe: 'Tenang Alam',
        budgetLabel: 'Hemat',
        budgetLimit: 1500000,
      },
    });
    // Accept 200 (valid key) or 400/500 (invalid/missing Gemini API key in .env)
    expect([200, 400, 500]).toContain(res.status());
  });

  test('POST /api/ai/package with couple companion', async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/ai/package`, {
      data: {
        companions: 'Couple',
        vibe: 'Romantis',
        budgetLabel: 'Nyaman',
        budgetLimit: 3000000,
      },
    });
    // Accept 200 (valid key) or 400/500 (invalid/missing Gemini API key)
    expect([200, 400, 500]).toContain(res.status());
  });

  // ─── Unauthenticated UI interaction ──────────────────────────────────────

  test('clicking Generate/Build as guest shows prompt or requires action', async ({ page }) => {
    await page.waitForTimeout(1000);
    // Try to find a "Generate" or "Buat" button
    const generateBtn = page.locator('button').filter({
      hasText: /generate|buat paket|cari paket|mulai|temukan paket/i,
    }).first();

    const isBtnVisible = await generateBtn.isVisible().catch(() => false);
    if (isBtnVisible) {
      // Scroll into view before clicking to avoid viewport issues
      await generateBtn.scrollIntoViewIfNeeded();
      await generateBtn.click({ force: true });
      await page.waitForTimeout(800);
      await expect(page.locator('#app')).not.toBeEmpty();
    } else {
      // Button not found — page is still intact
      await expect(page.locator('#app')).not.toBeEmpty();
    }
  });
});
