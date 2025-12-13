from playwright.sync_api import sync_playwright

def verify_update_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use iPhone 12 viewport for mobile-first testing
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:8089")

            # Navigate to Settings
            # Click the Settings nav item
            page.locator(".nav-item:has-text('SETTINGS')").click()

            # Wait for settings page to load
            page.wait_for_selector(".settings-page")

            # Check for the Application section
            app_section = page.locator(".section-label:has-text('APPLICATION')")
            if app_section.is_visible():
                print("Application section found.")
            else:
                print("Application section NOT found.")

            # Check for the Update App button
            update_btn = page.locator("button.comic-btn.secondary:has-text('UPDATE APP')")
            if update_btn.is_visible():
                print("Update App button found.")
            else:
                print("Update App button NOT found.")

            # Check position relative to Save Settings
            save_btn = page.locator("button.comic-btn.primary:has-text('SAVE SETTINGS')")

            # Take a screenshot of the settings page, specifically the bottom part
            page.screenshot(path="/tmp/verification_update_btn.png")
            print("Screenshot saved to /tmp/verification_update_btn.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_update_button()
