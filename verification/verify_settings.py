from playwright.sync_api import sync_playwright

def verify_settings_toggle():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 390, "height": 844})

        # 1. Load the app
        page.goto("http://127.0.0.1:8080")

        # 2. Go to Settings
        page.click('.nav-item:has-text("SETTINGS")')
        page.wait_for_selector('.section-label:has-text("DISPLAY")')

        # 3. Take screenshot of Settings showing the new toggle
        # Scroll to the toggle if needed
        element = page.locator('label:has-text("Show Out Ability")')
        element.scroll_into_view_if_needed()
        page.screenshot(path="verification/settings_page_toggle.png")
        print("Settings page screenshot saved.")

        # 4. Toggle it OFF (using the label as input is hidden)
        page.click('label[for="pref-show-out"]')

        # 5. Go to Abilities page
        page.click('.nav-item:has-text("ABILITIES")')

        # 6. Verify Out Zone is hidden and take screenshot
        # Wait a bit for transition/render
        page.wait_for_timeout(500)
        page.screenshot(path="verification/abilities_page_hidden.png")
        print("Abilities page hidden screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_settings_toggle()
