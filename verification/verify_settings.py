import os
import subprocess
import time
from playwright.sync_api import sync_playwright

def verify_settings():
    # Start the server
    server = subprocess.Popen(["python3", "-m", "http.server", "8080"])

    try:
        # Give the server a moment to start
        time.sleep(2)

        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()

            # Navigate to the settings page
            page.goto("http://localhost:8080")

            # Click the Settings navigation button
            page.click('.nav-item span:text("SETTINGS")')

            # Wait for settings page to load
            page.wait_for_selector('.settings-page')

            # Take a screenshot
            page.screenshot(path="verification/settings_after.png", full_page=True)

            print("Screenshot saved to verification/settings_after.png")
            browser.close()

    finally:
        # Kill the server
        server.terminate()

if __name__ == "__main__":
    verify_settings()
