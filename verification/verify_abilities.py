from playwright.sync_api import sync_playwright

def verify_abilities_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (running on port 8089)
        page.goto("http://localhost:8089")

        # Click on the Abilities tab (bottom nav)
        page.locator('.nav-item').nth(1).click()

        # Wait for the abilities page to load
        page.wait_for_selector('h1.comic-title', state='visible')

        # Take a screenshot of the initial abilities page
        page.screenshot(path="verification/abilities_page_initial.png")
        print("Screenshot saved: verification/abilities_page_initial.png")

        # Click "Add New Ability"
        page.click('#add-power-btn')

        # Wait for modal
        page.wait_for_selector('.modal-content', state='visible')

        # Fill out the form
        page.fill('#ability-name', 'Thunder Strike')

        # Select a linked power (Lightning Bolt)
        # The value matches the ID in app.js: 'lightning-bolt'
        page.select_option('select', 'lightning-bolt')

        # Select a zone (Yellow)
        page.click('input[value="yellow"] + div')

        # Select Interaction Type (Action)
        page.click('input[value="action"] + div')

        # Select Basic Actions (Attack)
        page.click('div:has-text("Attack")')

        # Add description
        page.fill('#ability-text', 'Calls down lightning.')

        # Take a screenshot of the modal filled out
        page.screenshot(path="verification/abilities_modal_filled.png")
        print("Screenshot saved: verification/abilities_modal_filled.png")

        # Save - Target the button specifically inside the modal content
        page.click('.modal-content button[type="submit"]')

        # Wait for modal to close (overlay gone)
        page.wait_for_selector('.modal-overlay', state='hidden')

        # Wait for the new card to appear
        page.wait_for_selector('.ability-card h3:has-text("Thunder Strike")', state='visible')

        # Verify the new card is present and has the right data visually
        page.screenshot(path="verification/abilities_page_after_add.png")
        print("Screenshot saved: verification/abilities_page_after_add.png")

        browser.close()

if __name__ == "__main__":
    verify_abilities_ui()
