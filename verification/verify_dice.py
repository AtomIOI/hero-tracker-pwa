from playwright.sync_api import sync_playwright
import time

def verify_dice():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8089")

        # Navigate to Dice Page
        page.click("text=DICE")

        # Verify initial dice (should be images now)
        print("Verifying dice images...")
        page.wait_for_selector(".die-img")

        # Click Roll
        print("Clicking Roll...")
        page.click(".roll-btn")

        # Verify shaking animation
        print("Verifying shaking...")
        page.wait_for_selector(".shaking")

        # Wait for roll to finish (0.8s) + a bit buffer
        time.sleep(1)

        # Verify Impact Text
        print("Verifying impact text...")
        # Since text depends on random result, just check if the overlay exists or contains one of the words
        # Note: impact text might fade out or stay. The current implementation keeps it until next roll.
        # But wait, did I clear it?
        # Code: `this.determineImpactText` sets `this.impactText`. Template shows it `v-if="impactText"`.
        # So it should be visible.

        overlay = page.locator(".impact-text-overlay")
        if overlay.is_visible():
            text = overlay.inner_text()
            print(f"Impact Text Visible: {text}")
        else:
            print("Impact Text NOT visible!")

        # Take screenshot
        page.screenshot(path="verification/dice_verification.png")
        print("Screenshot saved to verification/dice_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_dice()
