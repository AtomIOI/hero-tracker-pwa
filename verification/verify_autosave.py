
import asyncio
from playwright.async_api import async_playwright
import json
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Create a context that simulates a mobile device to test mobile behavior if needed,
        # but for localStorage we just need a persistent context.
        # Note: In headless mode, we need to ensure localStorage works.
        context = await browser.new_context()
        page = await context.new_page()

        # Start a simple HTTP server to serve the files
        # We assume the current directory is the root

        # Actually, standard tool use requires me to rely on the environment's server or just file://
        # But file:// usually has issues with modules.
        # I'll rely on the assumption that I can access the file via localhost if I start a server,
        # or I can try to use the file path if permitted.
        # Given the sandbox, I'll start a background server.

        print("Connecting to local server...")
        # Assuming port 8080 is available or I'll use 8000.
        # I'll try 8000 as per instructions.
        try:
            await page.goto("http://localhost:8000")
        except:
            print("Could not connect to localhost:8000. Please ensure server is running.")
            await browser.close()
            return

        print("Page loaded.")

        # 1. Get initial health
        initial_health = await page.evaluate("window.vm.characterSheet.hero.health.current")
        print(f"Initial Health: {initial_health}")

        # 2. Change health via UI or VM
        # Let's verify the watcher by modifying the VM directly, which should trigger the watcher.
        print("Modifying health to 25...")
        await page.evaluate("window.vm.characterSheet.hero.health.current = 25")

        # Wait a bit for the watcher to fire and localStorage to update
        await page.wait_for_timeout(1000)

        # 3. Check localStorage
        saved_data_str = await page.evaluate("localStorage.getItem('hero-character')")
        if not saved_data_str:
            print("FAIL: localStorage is empty.")
        else:
            saved_data = json.loads(saved_data_str)
            saved_health = saved_data['hero']['health']['current']
            if saved_health == 25:
                print("SUCCESS: Health change was auto-saved to localStorage.")
            else:
                print(f"FAIL: Saved health is {saved_health}, expected 25.")

        # 4. Reload page to simulate the refresh
        print("Reloading page...")
        await page.reload()

        # 5. Check if data persisted on reload
        # Note: localStorage should persist in the same context
        reloaded_health = await page.evaluate("window.vm.characterSheet.hero.health.current")
        if reloaded_health == 25:
             print("SUCCESS: Data persisted after reload.")
        else:
             print(f"FAIL: Data did not persist. Health is {reloaded_health}.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
