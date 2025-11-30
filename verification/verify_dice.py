from playwright.sync_api import sync_playwright
import time

def verify_dice():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8089")

        # Navigate to Dice Page
        page.click("text=DICE")

        # Verify initial dice images exist
        print("Verifying dice images...")
        page.wait_for_selector(".die-img")

        # Verify Modal Icons
        print("Opening modal to check icons...")
        # Click the first die to open modal
        page.locator(".die-slot-img-container").first.click()
        # Check for images inside modal
        page.wait_for_selector(".die-option-img")
        print("Modal images verified.")
        # Close modal (click outside or select one)
        page.locator(".die-option").first.click()

        # Click Roll
        print("Clicking Roll...")
        page.click(".roll-btn")

        # Wait for impact text (it should appear after ~800ms)
        print("Waiting for impact text...")
        time.sleep(1) # Wait for animation to finish

        overlay = page.locator(".impact-text-overlay")
        if overlay.is_visible():
            text = overlay.inner_text()
            print(f"Impact Text Visible: {text}")
        else:
            print("Impact Text NOT visible (unexpected if roll just finished)!")

        # Wait for text to disappear (1.5s delay)
        print("Waiting for text to disappear...")
        time.sleep(2)

        if not overlay.is_visible():
            print("Impact Text successfully disappeared.")
        else:
            print("Error: Impact Text is still visible!")

        # Take screenshot of the "Cluster"
        page.screenshot(path="verification/dice_cluster_final.png")
        print("Screenshot saved to verification/dice_cluster_final.png")

        browser.close()

if __name__ == "__main__":
    verify_dice()
