// tests/e2e/navigation.spec.js
// Tests for global navigation: navbar, hash routing, footer, mobile drawer

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3001';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Use 'domcontentloaded' — the page loads CDN resources (Leaflet, Fonts, Chart.js)
    // that slow down 'load'/'networkidle'. HTML + SPA mount is sufficient.
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#app', { timeout: 10000 });
  });

  test('homepage loads and renders the app shell', async ({ page }) => {
    await expect(page).toHaveTitle(/GLOW/i);
    // The SPA root element exists
    await expect(page.locator('#app')).toBeVisible();
  });

  test('navbar is rendered with GLOW brand', async ({ page }) => {
    // The brand/logo text "GLOW" is visible in the navbar
    const brand = page.locator('nav, header').filter({ hasText: /GLOW/i }).first();
    await expect(brand).toBeVisible();
  });

  test('navbar contains "Masuk" (login) button when not logged in', async ({ page }) => {
    // Wait a bit for the SPA to fully render navbar
    await page.waitForTimeout(1000);
    const content = await page.locator('#app').textContent();
    // Navbar should have a login trigger ("Masuk" or "Login" in Indonesian UI)
    const hasLoginTrigger = /masuk|login/i.test(content || '');
    expect(hasLoginTrigger).toBeTruthy();
  });

  test('clicking nav link changes the hash route', async ({ page }) => {
    // Navigate to the Package page via hash
    await page.goto(`${BASE}/#package`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/#package/);
    // Some content from the package page should appear
    await expect(page.locator('#app')).toContainText(/package|paket|workation/i);
  });

  test('footer is visible on public pages', async ({ page }) => {
    await page.goto(`${BASE}/#search`, { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/GLOW/i);
  });

  test('footer has copyright text', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText(/2026/);
  });

  test('hash routing: navigating back and forward works', async ({ page }) => {
    await page.goto(`${BASE}/#search`, { waitUntil: 'domcontentloaded' });
    await page.goto(`${BASE}/#package`, { waitUntil: 'domcontentloaded' });

    await page.goBack();
    await expect(page).toHaveURL(/#search/);

    await page.goForward();
    await expect(page).toHaveURL(/#package/);
  });

  test('default route (no hash) renders search page', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const app = page.locator('#app');
    await expect(app).toBeVisible();
    // Search page has a search bar
    await expect(app).toContainText(/cari|search|gunung kidul/i);
  });
});
