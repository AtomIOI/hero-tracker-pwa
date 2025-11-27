from playwright.sync_api import sync_playwright

def verify_home_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to home page
        page.goto("http://localhost:8080")

        # Wait for content to load
        page.wait_for_selector(".status-panel")

        # Check for new elements
        # 1. Compact Status Panel
        if page.locator(".status-panel.compact-status").is_visible():
            print("SUCCESS: Compact status panel found.")
        else:
            print("ERROR: Compact status panel not found.")

        # 2. Main Menu Grid
        if page.locator(".main-menu-grid").is_visible():
            print("SUCCESS: Main menu grid found.")
        else:
            print("ERROR: Main menu grid not found.")

        # 3. Specific Buttons
        buttons = ["CHARACTER", "INVENTORY", "QUESTS", "MAP", "SETTINGS"]
        for btn_text in buttons:
            if page.locator(".main-menu-grid").get_by_text(btn_text).is_visible():
                print(f"SUCCESS: Button '{btn_text}' found.")
            else:
                print(f"ERROR: Button '{btn_text}' not found.")

        # Take screenshot
        page.screenshot(path="verification_home.png", full_page=True)
        print("Screenshot saved to verification_home.png")

        browser.close()

if __name__ == "__main__":
    verify_home_page()
