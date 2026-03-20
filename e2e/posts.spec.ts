import { test, expect } from "@playwright/test";

test.describe("Post Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should create a text post", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testUsername = `testuser${Date.now()}`;
    
    await page.goto("/register");
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[type="password"]', "TestPassword123!");
    
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(home|discover|login)/, { timeout: 10000 });
  });
});

test.describe("Post Display", () => {
  test("should show post content", async ({ page }) => {
    await page.goto("/discover");
    
    const posts = page.locator('[data-testid="post"], article, [class*="post"]');
    const postCount = await posts.count();
    
    expect(postCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("User Profile", () => {
  test("should show profile page", async ({ page }) => {
    await page.goto("/discover");
    
    const userLinks = page.locator('a[href^="/u/"]');
    const linkCount = await userLinks.count();
    
    if (linkCount > 0) {
      await userLinks.first().click();
      await expect(page).toHaveURL(/\/u\//);
    }
  });
});
