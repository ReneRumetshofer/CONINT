const { test, expect } = require("@playwright/test");

test("Homepage loads and shows headline", async ({ page }) => {
  await page.goto("http://localhost:8080");
  await expect(page.locator("h1")).toHaveText("Secret Notes");
});
