const { test, expect } = require('@playwright/test');

test.describe('Powers/Qualities Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.click('.nav-item:has-text("Powers/Qualities")');
    });

    test('should load Powers/Qualities page', async ({ page }) => {
        await expect(page.locator('.comic-title')).toHaveText('POWERS/QUALITIES');
        // Check for sections tabs
        await expect(page.locator('.comic-tab').filter({ hasText: 'POWERS' })).toBeVisible();
        await expect(page.locator('.comic-tab').filter({ hasText: 'QUALITIES' })).toBeVisible();
    });

    test('should add a new power', async ({ page }) => {
        test.setTimeout(60000);
        // Click Add New Power button
        await page.click('button.comic-btn', { hasText: 'Add New Power' });

        // Modal should appear
        await expect(page.locator('.modal-content h2')).toHaveText('Add Power');

        // Fill form
        await page.fill('#trait-name', 'New Super Power');

        // Select die (d10) inside the modal
        // Scope to .modal-content to avoid selecting dice on the background page
        // Use force: true to bypass potential overlay interception issues in some browsers
        await page.locator('.modal-content img[alt="d10"]').click({ force: true });

        // Save
        await page.click('button[type="submit"]', { hasText: 'Add' });

        // Verify added
        await expect(page.locator('.trait-name', { hasText: 'New Super Power' })).toBeVisible();
        // Verify die icon
        await expect(page.locator('.trait-panel', { hasText: 'New Super Power' }).locator('img[src*="D10.png"]')).toBeVisible();
    });

    test('should delete a power', async ({ page }) => {
        test.setTimeout(60000);
        // First add a power to delete
        await page.click('button.comic-btn', { hasText: 'Add New Power' });
        await page.fill('#trait-name', 'Power To Delete');
        await page.click('button[type="submit"]', { hasText: 'Add' });

        const powerPanel = page.locator('.trait-panel').filter({ hasText: 'Power To Delete' });
        await expect(powerPanel).toBeVisible();

        // Click the card to edit
        await powerPanel.click();

        // Modal appears
        await expect(page.locator('.modal-content h2')).toHaveText('Edit Power');

        // Click Delete
        await page.click('button:has-text("Delete")');

        // Verify removed
        await expect(page.locator('.trait-name', { hasText: 'Power To Delete' })).not.toBeVisible();
    });
});
