from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}) # iPhone 12 viewport
        page = context.new_page()

        # 1. Load the page (assuming server is running on 8089)
        page.goto("http://localhost:8089")

        # 2. Wait for app to load
        page.wait_for_selector('.comic-title')
        print("Page loaded.")

        # 3. Nav to Abilities
        page.get_by_text("ABILITIES", exact=True).click()
        page.wait_for_selector('.ability-card')
        print("Abilities page loaded.")

        # 4. Verify specific locked ability (Flight is Yellow zone, locked in Green)
        flight_card = page.locator('.ability-card').filter(has_text="Flight")
        if flight_card.count() > 0:
            print("Found Flight card.")
            # Check for locked overlay image
            locked_img = flight_card.locator('img[alt="LOCKED"]')

            if locked_img.is_visible():
                print("LOCKED image is visible on Flight card.")

                # Verify Source
                src = locked_img.get_attribute('src')
                print(f"Image Source: {src}")

                if "assets/locked-stamp.png" in src:
                    print("SUCCESS: Image source is correct.")
                else:
                    print(f"FAILURE: Image source is incorrect: {src}")

                # Verify Style (approximate check for width/rotation)
                style = locked_img.get_attribute('style')
                print(f"Image Style: {style}")

            else:
                print("LOCKED image NOT visible on Flight card.")
        else:
            print("Flight card not found.")

        browser.close()

if __name__ == "__main__":
    run()
