
import os
from playwright.sync_api import sync_playwright

def verify_settings_bottom():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # Click the Settings icon to navigate to the settings page
        # The settings icon has class 'nav-icon settings'
        # Since it's a div acting as a button, we can locate it by class
        page.locator(".nav-icon.settings").click()

        # Wait for the settings page to be visible
        # We can check for the "Stats" header or the "Save Settings" button
        save_btn = page.locator("button", has_text="Save Settings")
        save_btn.wait_for(state="visible")

        # Scroll to the bottom of the page
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        # Take a screenshot of the bottom area
        page.screenshot(path="verification/settings_page_bottom.png")

        browser.close()

if __name__ == "__main__":
    verify_settings_bottom()
