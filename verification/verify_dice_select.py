from playwright.sync_api import sync_playwright, expect
import time

def verify_dice_select():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812}) # Mobile viewport
        page = context.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Navigate to home
        page.goto("http://localhost:8089/")

        # Navigate to Settings
        page.click(".nav-item:has-text('SETTINGS')")

        # Wait for stats to be visible
        stats_section = page.locator(".section-label:has-text('STATS')")
        expect(stats_section).to_be_visible()

        # Scroll to stats section
        stats_section.scroll_into_view_if_needed()

        # Check for DiceSelect components
        dice_selectors = page.locator(".dice-select-container")
        expect(dice_selectors).to_have_count(3) # Green, Yellow, Red

        # Take screenshot of Stats section
        stats_box = page.locator(".wobbly-box", has_text="STATS")
        stats_box.screenshot(path="verification/dice_select_initial.png")
        print("Initial screenshot taken.")

        # Click the first dice selector (Green)
        first_selector_btn = dice_selectors.first.locator(".current-die")
        first_selector_btn.click(force=True)

        # Wait for modal (SELECT DIE header)
        modal_header = page.locator("h3:has-text('SELECT DIE')")
        try:
            expect(modal_header).to_be_visible(timeout=5000)
        except AssertionError as e:
            print("Modal not visible. Taking error screenshot.")
            page.screenshot(path="verification/dice_select_error.png", full_page=True)
            raise e

        print("Modal opened successfully.")

        # Verify options in modal
        # They are .option-die inside the modal
        # Since modal is teleported to body, we search globally, or refine scope if needed.
        # But 'SELECT DIE' is unique enough.
        modal_content = page.locator(".fixed.inset-0").filter(has=modal_header)
        options = modal_content.locator(".option-die")
        expect(options).to_have_count(5)

        page.screenshot(path="verification/dice_select_open.png", full_page=True)
        print("Open modal screenshot taken.")

        # Click an option (d10)
        options.nth(3).click(force=True)

        # Verify modal closed
        expect(modal_header).not_to_be_visible()

        # Verify value changed
        current_img = first_selector_btn.locator("img")
        expect(current_img).to_have_attribute("src", "assets/dice/D10.png")

        print("Verification successful.")

        browser.close()

if __name__ == "__main__":
    verify_dice_select()
