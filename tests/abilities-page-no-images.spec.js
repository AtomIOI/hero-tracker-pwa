const { test, expect } = require('@playwright/test');

test('Abilities page loads with solid color cards', async ({ page }) => {
  await page.goto('http://localhost:8000');

  // Click the Abilities navigation item
  await page.click('div.nav-item:has-text("ABILITIES")');

  // Wait for the abilities grid to be visible
  await page.waitForSelector('#abilities-grid');

  // Check that at least one ability card is visible
  const abilityCard = await page.locator('.ability-card').first();
  await expect(abilityCard).toBeVisible();

  // Check that the image tag is not present
  const image = await abilityCard.locator('img');
  await expect(image).toHaveCount(0);

  // Take a screenshot of the abilities page
  await page.screenshot({ path: '/home/jules/verification/abilities-page-no-images.png' });
});
