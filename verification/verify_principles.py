from playwright.sync_api import sync_playwright

def verify_principles():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport to match the app's design
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # 1. Load the app (using the server we started on 8089)
        page.goto("http://localhost:8089/index.html")

        # 2. Go to Settings and add data
        print("Navigating to Settings...")
        page.click(".nav-item:has-text('SETTINGS')")
        page.wait_for_selector(".section-label:has-text('PRINCIPLES')")

        # Find the textareas for Overcome Action
        # Assuming the first one corresponds to the first principle
        print("Entering Overcome Action text...")

        # Select the first Overcome Action textarea (using the label we added)
        # We added <label>Overcome Action</label> followed by <textarea>
        # Let's target the textarea following that label
        overcome_inputs = page.locator("textarea[placeholder='Overcome action description...']")

        # Fill the first one
        overcome_inputs.nth(0).fill("I channel the power of destiny to overcome the impossible!")

        # Fill the second one
        overcome_inputs.nth(1).fill("I use the strict letter of the law to find a loophole.")

        # Save Settings
        page.click("button:has-text('SAVE SETTINGS')")

        # Handle the alert
        # Playwright auto-dismisses dialogs but let's be sure we wait a sec or handle it if we want to check message
        # page.on("dialog", lambda dialog: dialog.accept()) - default behavior is dismiss/accept

        # 3. Navigate to Abilities
        print("Navigating to Abilities...")
        page.click(".nav-item:has-text('ABILITIES')")

        # 4. Verify the new section exists
        print("Verifying Overcome Actions section...")
        page.wait_for_selector(".section-label:has-text('OVERCOME ACTIONS')")

        # Check for the cards
        principle_cards = page.locator(".ability-card")

        # We expect at least 2 cards (for the 2 principles) plus any existing abilities
        # But specifically under the Overcome Actions section, we want to verify the text matches

        # Verify text presence
        # "Principle of Destiny" should be a title
        # "I channel the power..." should be the body

        # Take a screenshot of the top of the abilities page
        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/principles_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_principles()
