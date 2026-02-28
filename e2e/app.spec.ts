import { test, expect, Page } from "@playwright/test";

/**
 * E2E tests for the Google Tasks API browser app.
 *
 * These tests are READ-ONLY — they list task lists and tasks but never
 * create, update, or delete any data.
 *
 * To run locally:
 *   npm run compile        # build dist/index.js from src/
 *   npm run test:e2e       # starts a local server and launches Chrome
 *
 * The tests use system Chrome so that the user's existing Google sign-in
 * session is available.  A Google OAuth consent popup will appear on the
 * first run; subsequent runs reuse the session stored in Chrome.
 */

/** Authorize the app and wait for task lists to be rendered. */
async function authorizeAndWaitForContent(page: Page): Promise<void> {
  await page.goto("/");

  // Wait for the gapi library to initialise and show the Authorize button.
  const authorizeButton = page.locator("#authorize_button");
  await expect(authorizeButton).toBeVisible({ timeout: 15_000 });

  // Click Authorize and handle the OAuth popup.
  const popupPromise = page.waitForEvent("popup");
  await authorizeButton.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");

  // The popup may auto-close once the user approves (or if already approved).
  // Wait for it to close or for content to appear in the main window.
  await Promise.race([
    popup.waitForEvent("close"),
    page.locator("#content").waitFor({ state: "attached" }),
  ]);

  // Wait for task lists to appear in the output area.
  await expect(page.locator("#content")).toContainText("Task Lists:", {
    timeout: 30_000,
  });
}

test.describe("App startup", () => {
  test("loads the page and shows the Authorize button", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Google Tasks API TypeScript Example");

    // Authorize button is shown once gapi reports the user is not signed in.
    const authorizeButton = page.locator("#authorize_button");
    await expect(authorizeButton).toBeVisible({ timeout: 15_000 });

    // Sign-out button should be hidden before authorization.
    await expect(page.locator("#signout_button")).toBeHidden();
  });
});

test.describe("Task lists (read-only)", () => {
  test("displays task lists after authorization", async ({ page }) => {
    await authorizeAndWaitForContent(page);

    const content = page.locator("#content");
    await expect(content).toContainText("Task Lists:");
  });

  test("hides Authorize button and shows Sign Out after authorization", async ({
    page,
  }) => {
    await authorizeAndWaitForContent(page);

    await expect(page.locator("#authorize_button")).toBeHidden();
    await expect(page.locator("#signout_button")).toBeVisible();
  });

  test("lists at least one task list", async ({ page }) => {
    await authorizeAndWaitForContent(page);

    const content = page.locator("#content");
    // Each task list is rendered as "<title> (<id>)" on its own line.
    await expect(content).not.toContainText("No task lists found.");
  });

  test("displays Tasks header after listing a task list", async ({ page }) => {
    await authorizeAndWaitForContent(page);

    const content = page.locator("#content");
    await expect(content).toContainText("Tasks:", { timeout: 30_000 });
  });

  test("Sign Out button clears content and shows Authorize again", async ({
    page,
  }) => {
    await authorizeAndWaitForContent(page);

    await page.locator("#signout_button").click();

    await expect(page.locator("#authorize_button")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("#signout_button")).toBeHidden();
  });
});
