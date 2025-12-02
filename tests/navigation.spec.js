const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
    });

    test('should navigate to all main pages', async ({ page }) => {
        // Home (already there)
        await expect(page.locator('.comic-title')).toHaveText('HERO TRACKER');

        // Abilities
        await page.click('.nav-item:has-text("ABILITIES")');
        await expect(page.locator('.comic-title')).toHaveText('ABILITY MODULES');
        await expect(page.locator('.nav-item:has-text("ABILITIES")')).toHaveClass(/active/);

        // Powers/Qualities
        await page.click('.nav-item:has-text("Powers/Qualities")');
        await expect(page.locator('.comic-title')).toHaveText('POWERS/QUALITIES');
        await expect(page.locator('.nav-item:has-text("Powers/Qualities")')).toHaveClass(/active/);

        // Dice
        await page.click('.nav-item:has-text("DICE")');
        // Dice page uses a different header structure
        await expect(page.locator('.dice-tray-header')).toHaveText('DICE TRAY');
        await expect(page.locator('.nav-item:has-text("DICE")')).toHaveClass(/active/);

        // Settings
        await page.click('.nav-item:has-text("SETTINGS")');
        await expect(page.locator('.comic-title')).toHaveText('SETTINGS');
        await expect(page.locator('.nav-item:has-text("SETTINGS")')).toHaveClass(/active/);

        // Back to Home
        await page.click('.nav-item:has-text("HOME")');
        await expect(page.locator('.comic-title')).toHaveText('HERO TRACKER');
        await expect(page.locator('.nav-item:has-text("HOME")')).toHaveClass(/active/);
    });
});
