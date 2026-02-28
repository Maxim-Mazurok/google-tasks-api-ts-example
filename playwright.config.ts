import { defineConfig, devices } from "@playwright/test";

/**
 * E2E test configuration.
 *
 * Tests serve the compiled app from dist/ on http://localhost:3000 and use
 * the system Chrome browser so that any stored Google sign-in session is
 * available without additional setup.
 *
 * Prerequisites:
 *   1. Copy src/config.example.ts → src/config.ts and fill in credentials.
 *   2. Run `npm run compile` so dist/index.js exists.
 *   3. Ensure you are signed in to the Google account that owns the tasks in
 *      your system Chrome profile (tests are read-only — they will not modify
 *      any tasks or lists).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    // Use system Chrome so the user's Google sign-in session is available.
    channel: "chrome",
    headless: false,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "npx serve dist --listen 3000 --no-clipboard",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
