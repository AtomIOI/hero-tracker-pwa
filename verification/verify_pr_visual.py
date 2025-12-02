
from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 412, 'height': 915}) # Mobile viewport
        page = context.new_page()

        # Load the page
        page.goto("http://localhost:8080/index.html")

        # Inject data to have collections and past issues
        page.evaluate("""
            window.vm.characterSheet.hero.issues.past = ['Issue A', 'Issue B', '', '', ''];
            window.vm.characterSheet.hero.issues.collections = [
                { name: 'The Dark Age', issues: ['Issue 1', 'Issue 2', 'Issue 3', 'Issue 4', 'Issue 5'] },
                { name: 'Golden Era', issues: ['Origin', 'First Flight', 'Nemesis', 'Team Up', 'Victory'] }
            ];
        """)

        # Open Issue Modal
        issue_box = page.locator(".issue-box")
        # Long press
        box = issue_box.bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        time.sleep(1.2)
        page.mouse.up()

        # Wait for modal
        page.wait_for_selector(".modal-overlay")
        time.sleep(0.5)

        # Scroll to collections (simulated by finding the element)
        collections_section = page.locator("text=COLLECTIONS")
        collections_section.scroll_into_view_if_needed()

        # Click the first collection to expand
        page.locator(".mb-4 .flex.flex-col > div").first.click()

        # Wait for animation/render
        time.sleep(0.5)

        # Take screenshot
        page.screenshot(path="verification/pr_visual.png")
        print("Screenshot taken: verification/pr_visual.png")

        browser.close()

if __name__ == "__main__":
    run()
