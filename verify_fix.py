from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8000")

    # 1. Click on 'ABILITIES' navigation item
    page.get_by_text("ABILITIES").click()
    page.locator("#abilities-grid").wait_for()

    # 2. Click "Add New Ability"
    # This checks if the button works (method name fix)
    page.locator("#add-power-btn").click()

    # 3. Check for Modal
    modal_title = page.get_by_text("Add Ability", exact=True)
    modal_title.wait_for()

    print("Modal opened successfully!")

    # 4. Close modal to see the cards clearly for screenshot
    page.get_by_text("Cancel").click()
    page.wait_for_timeout(500)

    # 5. Screenshot to verify dots in header / no dots in body
    page.screenshot(path="verification_fix.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
