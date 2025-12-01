const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
    });

    test('should display initial health correctly', async ({ page }) => {
        // Initial health should be 30 based on app.js default
        await expect(page.locator('.health-readout-box')).toContainText('30 / 30');
    });

    test('should decrease health when minus button is clicked', async ({ page }) => {
        await page.click('button.comic-btn.minus');
        await expect(page.locator('.health-readout-box')).toContainText('29 / 30');
    });

    test('should increase health when plus button is clicked', async ({ page }) => {
        // First decrease then increase to verify
        await page.click('button.comic-btn.minus');
        await expect(page.locator('.health-readout-box')).toContainText('29 / 30');
        await page.click('button.comic-btn.plus');
        await expect(page.locator('.health-readout-box')).toContainText('30 / 30');
    });

    test('should navigate to Abilities page', async ({ page }) => {
        await page.click('.nav-item:has-text("ABILITIES")');
        await expect(page.locator('.comic-title')).toHaveText('ABILITY MODULES');
    });

    // Status message is not directly visible in the new design based on index.html inspection
    // It seems getStatusMessage is in app.js but might not be used in the current template
    // So skipping status message test for now.
});
