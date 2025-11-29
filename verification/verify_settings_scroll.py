from playwright.sync_api import sync_playwright
import time
import http.server
import socketserver
import threading
import os
import sys

# Use a new port to avoid conflicts
PORT = 8087

def start_server():
    # Set directory to project root
    os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")
    Handler = http.server.SimpleHTTPRequestHandler
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Server started on port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Server error: {e}")

def run_verification():
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    time.sleep(2) # Give it time to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Mobile view
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        try:
            print(f"Navigating to http://localhost:{PORT}")
            page.goto(f"http://localhost:{PORT}")

            # Click Settings
            print("Clicking Settings...")
            page.locator(".nav-item", has_text="SETTINGS").click()
            page.wait_for_selector(".settings-page")

            # Scroll to Bottom (Save Button)
            print("Scrolling to Bottom...")
            # Scroll to very bottom of page to ensure padding is visible
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.0)

            page.screenshot(path="verification/settings_bottom.png")
            print("Verification Complete. Screenshot saved to verification/settings_bottom.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
