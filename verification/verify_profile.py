from playwright.sync_api import sync_playwright

def verify_profile_grid():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to local server
        page.goto("http://localhost:8080")

        # Wait for the profile grid to be visible
        page.wait_for_selector(".profile-grid")

        # Take a screenshot of the entire split row to show the layout swap and the grid
        element = page.locator(".split-row")
        element.screenshot(path="verification/profile_grid.png")

        browser.close()

if __name__ == "__main__":
    verify_profile_grid()
