from playwright.sync_api import sync_playwright
import time

def verify_dropdown_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (running on port 8089)
        page.goto("http://localhost:8089")

        # 1. Check initial dropdown state
        page.locator('.nav-item').nth(1).click() # Abilities
        page.click('#add-power-btn')
        page.wait_for_selector('.modal-content', state='visible')

        # Get options in the select
        select = page.locator('select').first
        options = select.locator('option').all_inner_texts()
        print("Initial Options:", options)

        # Close modal
        page.click('button:has-text("CANCEL")')

        # 2. Add a new Power
        page.locator('.nav-item').nth(2).click() # P&Q
        page.click('button:has-text("Add New Power")')
        page.wait_for_selector('.modal-content', state='visible')

        # Fill trait modal
        # Note: AddEditTraitModal might not have IDs, let's look at it if needed.
        # But usually inputs are generic.
        page.fill('.modal-content input[type="text"]', 'New Test Power')

        # Click "Add" (not Save)
        page.click('.modal-content button.plus')

        # 3. Go back to Abilities and check dropdown
        page.locator('.nav-item').nth(1).click() # Abilities
        page.click('#add-power-btn')
        page.wait_for_selector('.modal-content', state='visible')

        new_options = page.locator('select').first.locator('option').all_inner_texts()
        print("New Options:", new_options)

        # Check if 'New Test Power' is in there (might need to handle spaces/formatting)
        found = any('New Test Power' in opt for opt in new_options)
        print("Found New Power:", found)

        browser.close()

if __name__ == "__main__":
    verify_dropdown_fix()
