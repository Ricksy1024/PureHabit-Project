const { chromium } = require('playwright');

const baseUrl = 'http://127.0.0.1:3000';
const email = 'mamszmimsz@gmail.com';
const password = 'proba123';
const habitName = `Browser Habit ${Date.now()}`;

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('#auth-email').fill(email);
    await page.locator('#auth-password').fill(password);
    await page.getByRole('button', { name: 'Enter My Sanctuary' }).click();

    await page.getByText('Good Morning, proba').waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: 'Add New' }).click();

    const modalForm = page.locator('form').filter({ has: page.getByPlaceholder('e.g., Morning Meditation') });
    await modalForm.getByPlaceholder('e.g., Morning Meditation').fill(habitName);
    await modalForm.getByPlaceholder('e.g., 15 minutes, 2.5 liters').fill('1 session');
    await modalForm.getByRole('button', { name: 'M' }).first().click();
    await modalForm.getByRole('button', { name: 'Add Activity' }).click();
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
