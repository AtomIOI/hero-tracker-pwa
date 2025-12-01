from playwright.sync_api import sync_playwright

def verify_home_banner():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8089/index.html")

        # Take a screenshot of the banner area
        # The banner is within .comic-header-box
        banner = page.locator(".comic-header-box").first

        # Verify "ISSUE #1" is NOT visible
        # We can check if the text exists within the banner
        issue_box = banner.locator(".issue-box")

        if issue_box.count() == 0:
            print("SUCCESS: 'ISSUE #1' box is not present.")
        else:
             # Check visibility
             if not issue_box.is_visible():
                 print("SUCCESS: 'ISSUE #1' box is present but not visible.")
             else:
                 print("FAILURE: 'ISSUE #1' box is present and visible.")

        page.screenshot(path="verification/home_banner.png")
        browser.close()

if __name__ == "__main__":
    verify_home_banner()
