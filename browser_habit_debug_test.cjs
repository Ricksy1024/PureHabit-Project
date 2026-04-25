const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    await page.locator('#auth-email').fill('mamszmimsz@gmail.com');
    await page.locator('#auth-password').fill('proba123');
    await page.getByRole('button', { name: 'Enter My Sanctuary' }).click();
    await page.waitForTimeout(5000);
    console.log(JSON.stringify({
      title: await page.title(),
      bodyText: (await page.locator('body').innerText()).slice(0, 4000)
    }));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
