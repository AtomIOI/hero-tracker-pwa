from playwright.sync_api import sync_playwright
import sys

def verify_alignment():
    with sync_playwright() as p:
        # Use iPhone 12 viewport as per guidelines
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        try:
            page.goto("http://localhost:8089")

            # Click Hero Points star to open modal
            page.click(".hero-points-star")

            # Wait for modal content
            modal_content = page.locator(".modal-content").first
            modal_content.wait_for()

            # Get header box locator (it's the first comic-header-box inside modal-content)
            header_box = modal_content.locator(".comic-header-box").first

            # Get buttons
            minus_btn = modal_content.locator(".comic-btn.minus").first
            plus_btn = modal_content.locator(".comic-btn.plus").first

            # Get bounding boxes
            header_bbox = header_box.bounding_box()
            minus_bbox = minus_btn.bounding_box()
            plus_bbox = plus_btn.bounding_box()

            if not header_bbox or not minus_bbox or not plus_bbox:
                print("Could not find elements or bounding boxes")
                return False

            print(f"Header Left: {header_bbox['x']}, Right: {header_bbox['x'] + header_bbox['width']}")
            print(f"Minus Left: {minus_bbox['x']}")
            print(f"Plus Right: {plus_bbox['x'] + plus_bbox['width']}")

            left_diff = abs(minus_bbox['x'] - header_bbox['x'])
            right_diff = abs((plus_bbox['x'] + plus_bbox['width']) - (header_bbox['x'] + header_bbox['width']))

            print(f"Left Difference: {left_diff}")
            print(f"Right Difference: {right_diff}")

            # Tolerance (e.g., 2px)
            aligned = left_diff < 2 and right_diff < 2

            if aligned:
                print("ALIGNED: Buttons align with header edges.")
            else:
                print("MISALIGNED: Buttons do not align with header edges.")

            # Take screenshot of the modal
            # We screenshot the whole page but since it's a modal overlay, it should be fine.
            # Or better, screenshot the modal content element.
            modal_content.screenshot(path="verification/hero_points_aligned.png")
            print("Screenshot saved to verification/hero_points_aligned.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_alignment()
