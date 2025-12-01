const { test, expect } = require('@playwright/test');

test('Abilities page loads with grouped zones', async ({ page }) => {
  await page.goto('http://localhost:8000');

  // Click the Abilities navigation item
  await page.click('div.nav-item:has-text("ABILITIES")');

  // Wait for the zone containers to be visible
  await page.waitForSelector('.zone-container');

  // Check that at least one zone header is visible
  const zoneHeader = await page.locator('.section-label').first();
  await expect(zoneHeader).toBeVisible();

  // Check that at least one ability card is visible within the modules grid
  const abilityCard = await page.locator('.abilities-grid.modules-grid .ability-card').first();
  await expect(abilityCard).toBeVisible();

  // Check that the image tag is not present (standard test for no-images spec)
  const image = await abilityCard.locator('img');
  await expect(image).toHaveCount(0);

  // Take a screenshot of the abilities page
  await page.screenshot({ path: 'test-results/abilities-page-grouped.png' });
});
