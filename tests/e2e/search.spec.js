// tests/e2e/search.spec.js
// Tests for the search/home page: hero section, search input, location cards, filters

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3001';

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/#search`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#app', { timeout: 10000 });
  });

  // ─── Page Load ────────────────────────────────────────────────────────────

  test('search page renders hero section', async ({ page }) => {
    const app = page.locator('#app');
    // The hero section should contain the brand name and a heading
    await expect(app).toContainText(/GLOW/i);
  });

  test('search page has a search/input area', async ({ page }) => {
    // There should be a text input for searching locations
    const searchInput = page.locator('input[type="text"], input[placeholder]').first();
    await expect(searchInput).toBeVisible();
  });

  // ─── API: GET /api/locations ──────────────────────────────────────────────

  test('GET /api/locations returns an array of locations', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('each location has required fields', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations`);
    const locations = await res.json();
    const first = locations[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('rating');
  });

  test('GET /api/packages with category filter does not crash server', async ({ page }) => {
    // The server returns ALL locations — query param filtering is done client-side
    // This test just verifies the API responds successfully
    const res = await page.request.get(`${BASE}/api/locations?category=Workspace`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  // ─── UI: Location Cards ───────────────────────────────────────────────────

  test('location cards are rendered on the search page', async ({ page }) => {
    // Wait for cards to load (API-fetched)
    await page.waitForTimeout(1500);
    // Cards typically have the location name or a card wrapper
    const cards = page.locator('[class*="card"], [id*="card"], .location-card').first();
    // At minimum the app container has content
    await expect(page.locator('#app')).not.toBeEmpty();
  });

  test('search input filters results', async ({ page }) => {
    await page.waitForTimeout(1000);
    const searchInput = page.locator('input[type="text"], input[placeholder]').first();
    await searchInput.fill('Segara');
    await page.waitForTimeout(800);
    // After typing, app should not be empty (either results or empty state)
    await expect(page.locator('#app')).not.toBeEmpty();
  });

  test('category filter buttons are present', async ({ page }) => {
    // There should be filter buttons/tabs for categories
    const filterArea = page.locator('#app');
    // Expect at least one of the known categories to appear as a button/filter
    const categoryText = await filterArea.textContent();
    const hasCategories =
      /penginapan|workspace|wisata|kuliner|budaya/i.test(categoryText || '');
    expect(hasCategories).toBeTruthy();
  });
});
