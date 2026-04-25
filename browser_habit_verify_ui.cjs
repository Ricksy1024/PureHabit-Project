const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const habitName = 'Browser Habit 1777131000486';

  try {
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    await page.locator('#auth-email').fill('mamszmimsz@gmail.com');
    await page.locator('#auth-password').fill('proba123');
    await page.getByRole('button', { name: 'Enter My Sanctuary' }).click();
    await page.getByText('Good Morning, proba').waitFor({ timeout: 15000 });
    await page.getByRole('link', { name: 'Habits' }).click();
    await page.getByText(habitName).waitFor({ timeout: 15000 });
    console.log(JSON.stringify({ ok: true, habitName }));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
