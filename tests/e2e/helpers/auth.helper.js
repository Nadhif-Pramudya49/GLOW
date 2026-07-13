// tests/e2e/helpers/auth.helper.js
// Reusable authentication helpers for Playwright tests

const TEST_USERS = {
  user: {
    email: 'budi@example.com',
    password: 'password123',
    fullName: 'Budi Nomad',
    role: 'USER',
  },
  admin: {
    email: 'admin@glow.com',
    password: 'password123',
    fullName: 'Admin GLOW',
    role: 'ADMIN',
  },
  owner: {
    email: 'owner@glow.com',
    password: 'password123',
    fullName: 'Mitra GLOW',
    role: 'OWNER',
  },
};

/**
 * Login via API and inject the JWT token into localStorage.
 * This is faster than UI login and avoids brittle form interactions
 * when we just need an authenticated state.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'user'|'admin'|'owner'} role
 */
async function loginViaAPI(page, role = 'user') {
  const credentials = TEST_USERS[role];

  // First navigate so we are on the right origin
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Call the auth API and get a token
  const response = await page.request.post('http://localhost:3001/api/auth/login', {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Login API failed for role "${role}" (${response.status()}): ${await response.text()}`
    );
  }

  const body = await response.json();
  const token = body.token;

  // Inject the token into localStorage so the app treats the user as logged in
  await page.evaluate((tk) => {
    localStorage.setItem('token', tk);
  }, token);

  return { token, credentials };
}

/**
 * Login via the UI (modal/form). Use when testing the login UI itself.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'user'|'admin'|'owner'} role
 */
async function loginViaUI(page, role = 'user') {
  const credentials = TEST_USERS[role];

  // Open the login modal — GLOW uses a modal triggered by clicking "Masuk"
  const loginBtn = page.locator('button, [onclick]').filter({ hasText: /masuk/i }).first();
  await loginBtn.click();

  // Fill in the login form
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);

  // Submit
  await page.click('button[type="submit"], button:has-text("Masuk")');
}

/**
 * Clear auth state (logout).
 * @param {import('@playwright/test').Page} page
 */
async function logout(page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
  });
}

module.exports = { loginViaAPI, loginViaUI, logout, TEST_USERS };
