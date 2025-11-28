from playwright.sync_api import sync_playwright, expect
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Using a slightly larger viewport to avoid potential layout shifts hiding elements,
        # though standard mobile is fine.
        context = browser.new_context(viewport={'width': 414, 'height': 896})
        page = context.new_page()

        # 1. Navigate to home
        page.goto("http://localhost:8080")

        # DEBUG: Take a screenshot of Home
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/debug_home.png")

        # 2. Navigate to Dice Page
        # Click the parent .nav-item to be safe
        page.locator(".nav-item").filter(has_text="DICE").click()

        # Wait a moment for Vue to swap components
        # (Though Playwright's auto-wait is usually good, Vue transition might be instant but DOM update async)
        page.wait_for_timeout(500)

        # DEBUG: Take a screenshot of Dice Page (or what it thinks is the Dice Page)
        page.screenshot(path="verification/debug_dice_page.png")

        # 3. Verify Header
        expect(page.locator(".dice-tray-header")).to_have_text("DICE TRAY")

        # 4. Verify Dice Selection
        dice_slots = page.locator(".die-slot")
        expect(dice_slots.nth(0)).to_have_text("d6")

        # 5. Roll Dice
        page.click(".roll-btn")

        # 6. Verify Results appear
        expect(page.locator(".result-box.min")).to_be_visible()

        # 7. Add a Modifier
        page.fill("input[placeholder='Name (e.g. High Ground)']", "Boost")
        page.fill("input[placeholder='+1']", "2")
        page.click(".add-modifier-form .comic-btn.plus")

        # 8. Verify Modifier Added
        expect(page.locator(".modifier-chip")).to_contain_text("Boost")
        expect(page.locator(".modifier-chip .modifier-value")).to_have_text("+2")

        # 9. Screenshot Final
        page.screenshot(path="verification/dice_page_verified.png")

        browser.close()

if __name__ == "__main__":
    run()
