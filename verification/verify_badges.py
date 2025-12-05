
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 390, 'height': 844}) # Mobile viewport
        page = await context.new_page()

        try:
            print("Navigating to home...")
            await page.goto("http://localhost:8081")

            # Click ABILITIES nav item
            print("Clicking Abilities...")
            # The nav item might be an icon or text. Memory says 'ABILITIES'.
            # Looking at comic-theme.css, .nav-icon.powers
            await page.click(".nav-icon.powers", force=True)

            print("Waiting for ability card...")
            await page.wait_for_selector(".ability-card", timeout=5000)

            # Find the first ability card header badges
            # The structure is: .ability-card-header .flex .flex-wrap > div
            badges = page.locator(".ability-card-header .flex.flex-wrap > div")

            count = await badges.count()
            print(f"Found {count} badges in the first header (expected 2)")

            if count >= 2:
                interaction_badge = badges.nth(0)
                trait_badge = badges.nth(1)

                # Evaluate styles
                interaction_style = await interaction_badge.evaluate("""element => {
                    const style = window.getComputedStyle(element);
                    return {
                        borderStyle: style.borderStyle,
                        borderWidth: style.borderWidth,
                        borderColor: style.borderColor
                    };
                }""")

                trait_style = await trait_badge.evaluate("""element => {
                    const style = window.getComputedStyle(element);
                    return {
                        borderStyle: style.borderStyle,
                        borderWidth: style.borderWidth,
                        borderColor: style.borderColor
                    };
                }""")

                print(f"Interaction Badge Style: {interaction_style}")
                print(f"Trait Badge Style: {trait_style}")

                # Take screenshot of the card
                card = page.locator(".ability-card").first
                await card.screenshot(path="/tmp/badges_before.png")
                print("Screenshot saved to /tmp/badges_before.png")

            else:
                print("Could not find badges.")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="/tmp/error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
