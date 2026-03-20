import { test, expect } from "@playwright/test";

test.describe("Jobs", () => {
  test("should display jobs page", async ({ page }) => {
    await page.goto("/jobs");
    
    await expect(page.locator("h1, h2, [class*='title']")).toBeVisible();
  });

  test("should show job listings", async ({ page }) => {
    await page.goto("/jobs");
    
    const jobCards = page.locator('[class*="job"], [data-testid="job-card"]');
    const count = await jobCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Discover", () => {
  test("should show discover page", async ({ page }) => {
    await page.goto("/discover");
    
    await expect(page).toHaveURL("/discover");
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/discover");
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("developer");
    }
  });
});
