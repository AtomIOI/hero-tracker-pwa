const { test, expect } = require('@playwright/test');

test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.click('.nav-item:has-text("SETTINGS")');
    });

    test('should load settings page', async ({ page }) => {
        await expect(page.locator('.comic-title')).toHaveText('SETTINGS');
        await expect(page.locator('.section-label').first()).toHaveText('IDENTITY');
    });

    test('should update hero name', async ({ page }) => {
        test.setTimeout(60000);
        const nameInput = page.locator('.form-group').filter({ hasText: 'HERO NAME' }).locator('input');

        await nameInput.fill('New Hero Name');

        page.on('dialog', async dialog => {
            await dialog.accept();
        });
        await page.click('button:has-text("SAVE SETTINGS")');

        // Navigate away and back to verify persistence in memory (and potentially local storage if implemented correctly)
        await page.click('.nav-item:has-text("HOME")');
        await expect(page.locator('.comic-title')).toHaveText('HERO TRACKER');

        await page.click('.nav-item:has-text("SETTINGS")');
        await expect(page.locator('.comic-title')).toHaveText('SETTINGS');

        const newNameInput = page.locator('.form-group').filter({ hasText: 'HERO NAME' }).locator('input');
        await expect(newNameInput).toHaveValue('New Hero Name');
    });

    test('should update principles', async ({ page }) => {
        test.setTimeout(60000);
        const principleNameInput = page.locator('input[placeholder="Principle of..."]').first();
        await principleNameInput.fill('Principle of Testing');

        page.on('dialog', async dialog => {
            await dialog.accept();
        });
        await page.click('button:has-text("SAVE SETTINGS")');

        await page.click('.nav-item:has-text("HOME")');
        await expect(page.locator('.comic-title')).toHaveText('HERO TRACKER');

        await page.click('.nav-item:has-text("SETTINGS")');
        await expect(page.locator('.comic-title')).toHaveText('SETTINGS');

        const savedInput = page.locator('input[placeholder="Principle of..."]').first();
        await expect(savedInput).toHaveValue('Principle of Testing');
    });
});
