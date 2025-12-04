from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    # Use iPhone 12 viewport to simulate mobile
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()

    # Capture console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    page.goto("http://localhost:8089")

    # 1. Verify Issue Box Text
    print("Checking Issue Box text...")
    issue_box = page.locator(".issue-box")
    # Wait for app to mount
    issue_box.wait_for()

    text = issue_box.inner_text().strip()
    print(f"Issue Box text: '{text}'")

    if "ISSUE: #1" in text:
        print("PASS: Issue Box text is correct.")
    else:
        print(f"FAIL: Issue Box text is incorrect. Expected 'ISSUE: #1', got '{text}'")

    # 2. Verify Click Interaction
    print("Clicking Issue Box...")
    # Force click if needed, but standard click should work
    issue_box.click()

    # Wait for modal to appear
    modal = page.locator(".modal-overlay")
    try:
        modal.wait_for(state="visible", timeout=5000)
        print("PASS: Issue Modal is visible after click.")
    except Exception as e:
        print(f"FAIL: Issue Modal is not visible after click. Error: {e}")
        # Take screenshot for debug
        page.screenshot(path="verification_fail.png")

    # 3. Verify Modal Content (sanity check)
    if modal.is_visible():
        modal_title = page.locator(".modal-content .comic-title")
        title_text = modal_title.inner_text().strip()
        if "ISSUE TRACKER" in title_text:
            print(f"PASS: Modal title is correct: '{title_text}'")
        else:
            print(f"FAIL: Modal title is incorrect: '{title_text}'")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
