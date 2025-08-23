import re
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local HTML file
        page.goto("file:///app/Entrega_v1.0/dashboard.html")

        # Wait for the summary to indicate that the data has loaded
        summary = page.locator("#summary")
        expect(summary).to_contain_text(re.compile(r'Se encontraron \d+ resultados.'))

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()
