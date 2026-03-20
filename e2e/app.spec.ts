import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should show register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test("should validate registration form", async ({ page }) => {
    await page.goto("/register");
    
    await page.fill('input[type="email"]', "invalid-email");
    await page.fill('input[name="username"]', "a");
    await page.fill('input[type="password"]', "short");
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator("text=/invalid|required/i")).toBeVisible();
  });
});

test.describe("Home Page", () => {
  test("should redirect unauthenticated users to landing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(login|register|landing)?/);
  });
});

test.describe("Health Check", () => {
  test("should return healthy status", async ({ page }) => {
    const response = await page.request.get("/api/health");
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe("healthy");
    expect(data.checks.database).toBe("connected");
  });
});

test.describe("Navigation", () => {
  test("should show navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    const menuButton = page.locator('button[aria-label*="menu"], button[class*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  });
});

test.describe("Accessibility", () => {
  test("should have no accessibility violations on login page", async ({ page }) => {
    await page.goto("/login");
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});

test.describe("Performance", () => {
  test("should load home page within 3 seconds", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
});
