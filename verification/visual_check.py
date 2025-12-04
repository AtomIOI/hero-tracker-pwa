from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.goto("http://localhost:8089")

    # Wait for app to load
    page.wait_for_selector(".issue-box")

    # 1. Screenshot Issue Box in default state
    # Focus on the issue box area
    header_box = page.locator(".comic-header-box")
    header_box.screenshot(path="verification/issue_box_default.png")

    # 2. Click to open modal
    page.locator(".issue-box").click()

    # Wait for modal
    page.wait_for_selector(".modal-overlay")
    page.wait_for_timeout(500) # Wait for animation if any

    # 3. Screenshot with Modal Open
    page.screenshot(path="verification/issue_modal_open.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
