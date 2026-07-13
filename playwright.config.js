// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directory where tests are located
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [['html', { open: 'never' }], ['list']],

  // Shared settings for all tests
  use: {
    // Base URL — server runs on port 3001 (from .env)
    baseURL: 'http://localhost:3001',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Navigation timeout
    navigationTimeout: 30000,

    // Action timeout
    actionTimeout: 10000,
  },

  // Global test timeout
  timeout: 30000,

  // Auto-start the Express server before running tests
  webServer: {
    command: 'node server/server.js',
    url: 'http://localhost:3001',
    reuseExistingServer: true,  // Reuse if already running
    timeout: 15000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
