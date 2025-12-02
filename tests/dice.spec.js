const { test, expect } = require('@playwright/test');

test.describe('Dice Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.click('.nav-item:has-text("DICE")');
    });

    test('should load dice page', async ({ page }) => {
        await expect(page.locator('.comic-title')).toHaveText('DICE TRAY');
        // Check default dice (d6, d8, d10)
        await expect(page.locator('.die-slot-img-container')).toHaveCount(3);
    });

    test('should roll dice', async ({ page }) => {
        const rollBtn = page.locator('.roll-btn');
        await expect(rollBtn).toHaveText('ROLL!');

        await rollBtn.click();

        // Should show rolling state
        await expect(rollBtn).toHaveText('...');

        // Wait for results (simulated delay 800ms)
        await expect(page.locator('.result-box')).toHaveCount(3, { timeout: 3000 });
        await expect(rollBtn).toHaveText('ROLL!');

        // Verify results displayed
        const minVal = await page.locator('.result-box.min .result-value').innerText();
        const midVal = await page.locator('.result-box.mid .result-value').innerText();
        const maxVal = await page.locator('.result-box.max .result-value').innerText();

        expect(Number(minVal)).not.toBeNaN();
        expect(Number(midVal)).not.toBeNaN();
        expect(Number(maxVal)).not.toBeNaN();
    });

    test('should add and remove modifier', async ({ page }) => {
        test.setTimeout(60000);
        // Add modifier
        await page.fill('input[placeholder="Name (e.g. High Ground)"]', 'Test Mod');
        await page.fill('input[placeholder="+1"]', '2');
        await page.click('.add-modifier-form button.comic-btn.plus');

        // Verify added
        const modChip = page.locator('.modifier-chip').filter({ hasText: 'Test Mod' });
        await expect(modChip).toBeVisible();
        await expect(modChip).toContainText('+2');
        await expect(page.locator('.modifiers-header')).toContainText('(+2)');

        // Remove modifier
        await modChip.locator('.delete-mod-btn').click();
        await expect(modChip).not.toBeVisible();
        await expect(page.locator('.modifiers-header')).toContainText('MODIFIERS (0)');
    });

    test('should change selected die', async ({ page }) => {
        test.setTimeout(60000);
        // Click first die (index 0, default d6)
        await page.locator('.die-slot-img-container').nth(0).click();

        // Modal appears
        await expect(page.locator('.dice-selector-modal')).toBeVisible();

        // Select d12
        // Use force: true because of the overlay issue seen in other tests
        await page.locator('.die-option img[alt="d12"]').click({ force: true });

        // Modal closes
        await expect(page.locator('.dice-selector-modal')).not.toBeVisible();

        // Verify die changed
        await expect(page.locator('.die-slot-img-container img').nth(0)).toHaveAttribute('alt', 'd12');
    });
});
