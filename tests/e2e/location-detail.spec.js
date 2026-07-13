// tests/e2e/location-detail.spec.js
// Tests for the location detail page and the /api/locations/:id endpoint

const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3001';

test.describe('Location Detail', () => {
  /** @type {number} */
  let firstLocationId;

  test.beforeAll(async ({ request }) => {
    // Fetch the list of locations and grab the first ID for use across tests
    const res = await request.get(`${BASE}/api/locations`);
    const locations = await res.json();
    expect(locations.length).toBeGreaterThan(0);
    firstLocationId = locations[0].id;
  });

  // ─── API ─────────────────────────────────────────────────────────────────

  test('GET /api/locations/:id returns a single location', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations/${firstLocationId}`);
    expect(res.ok()).toBeTruthy();
    const loc = await res.json();
    expect(loc).toHaveProperty('id', firstLocationId);
    expect(loc).toHaveProperty('name');
    expect(loc).toHaveProperty('description');
    expect(loc).toHaveProperty('category');
    expect(loc).toHaveProperty('rating');
  });

  test('GET /api/locations/:id with invalid ID returns 404 or error', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations/999999`);
    expect([404, 400, 500]).toContain(res.status());
  });

  test('location object includes latitude and longitude', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations/${firstLocationId}`);
    const loc = await res.json();
    expect(loc).toHaveProperty('latitude');
    expect(loc).toHaveProperty('longitude');
    // Prisma Decimal may serialize as string or number — accept both
    expect(['number', 'string']).toContain(typeof loc.latitude);
    expect(['number', 'string']).toContain(typeof loc.longitude);
  });

  test('location object includes facilities array', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations/${firstLocationId}`);
    const loc = await res.json();
    expect(loc).toHaveProperty('facilities');
    expect(Array.isArray(loc.facilities)).toBeTruthy();
  });

  test('location object includes packages', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations/${firstLocationId}`);
    const loc = await res.json();
    // Package(s) are associated with each location
    expect(loc).toHaveProperty('packages');
  });

  // ─── UI ──────────────────────────────────────────────────────────────────

  test('location detail page renders for a valid location', async ({ page }) => {
    await page.goto(
      `${BASE}/#location-detail?id=${firstLocationId}`,
      { waitUntil: 'domcontentloaded' }
    );
    await page.waitForSelector('#app', { timeout: 10000 });
    const app = page.locator('#app');
    // The detail page should not be empty
    await expect(app).not.toBeEmpty();
  });

  test('location detail page shows location name', async ({ page }) => {
    // Get the name of the first location
    const res = await page.request.get(`${BASE}/api/locations/${firstLocationId}`);
    const loc = await res.json();

    await page.goto(
      `${BASE}/#location-detail?id=${firstLocationId}`,
      { waitUntil: 'domcontentloaded' }
    );
    await page.waitForSelector('#app', { timeout: 10000 });

    await page.waitForTimeout(1500);
    const app = page.locator('#app');
    await expect(app).toContainText(loc.name);
  });

  test('location detail page shows category badge', async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/locations/${firstLocationId}`);
    const loc = await res.json();

    await page.goto(
      `${BASE}/#location-detail?id=${firstLocationId}`,
      { waitUntil: 'domcontentloaded' }
    );
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(1500);

    const app = page.locator('#app');
    await expect(app).toContainText(loc.category);
  });

  test('location detail page shows rating', async ({ page }) => {
    await page.goto(
      `${BASE}/#location-detail?id=${firstLocationId}`,
      { waitUntil: 'domcontentloaded' }
    );
    await page.waitForSelector('#app', { timeout: 10000 });
    await page.waitForTimeout(1500);
    const app = page.locator('#app');
    // Rating is a number like "4.8" — check it appears somewhere
    const content = await app.textContent();
    expect(/[0-9]\.[0-9]/.test(content || '')).toBeTruthy();
  });
});
