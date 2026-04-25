const { test, expect } = require('playwright/test');
const admin = require('/workspaces/PureHabit-Project/functions/node_modules/firebase-admin');

test('signup verify and create habit', async ({ page }) => {
  const baseUrl = 'http://127.0.0.1:3000';
  const email = `codex-habit-${Date.now()}@example.com`;
  const password = 'PureHabitTest123!';
  const displayName = 'Codex Test';
  const habitName = `Browser Habit ${Date.now()}`;

  if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'purehabit-b2923' });
  }

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.locator('#auth-name').fill(displayName);
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
  await page.getByRole('button', { name: 'Create My Sanctuary' }).click();

  await expect(page.getByRole('button', { name: 'I have verified my email' })).toBeVisible({ timeout: 15000 });

  const authUser = await page.evaluate(() => {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith('firebase:authUser:')) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        return JSON.parse(raw);
      } catch (_error) {}
    }
    return null;
  });

  if (!authUser || !authUser.uid) {
    throw new Error('Could not extract Firebase auth user from localStorage.');
  }

  await admin.auth().updateUser(authUser.uid, { emailVerified: true });

  await page.getByRole('button', { name: 'I have verified my email' }).click();
  await expect(page.getByText('Your Habits')).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Add New' }).click();
  await page.getByPlaceholder('e.g., Morning Meditation').fill(habitName);
  await page.getByPlaceholder('e.g., 15 minutes, 2.5 liters').fill('1 session');
  await page.getByRole('button', { name: 'M' }).first().click();
  await page.getByRole('button', { name: 'Add Activity' }).click();
  await expect(page.getByText(habitName)).toBeVisible({ timeout: 15000 });

  console.log(JSON.stringify({ ok: true, uid: authUser.uid, email, habitName }));
});
