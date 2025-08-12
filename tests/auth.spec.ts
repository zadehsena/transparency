import { test, expect } from '@playwright/test';

test('home header changes when logged in', async ({ page, request }) => {
  await page.goto('http://localhost:3000');

  const res = await request.post('http://localhost:3000/api/signup', {
    data: { name: 'E2E', email: 'e2e@example.com', password: 'test1234' }
  });
  expect([200, 409]).toContain(res.status());

  // Click the login link in the header
  await page.getByRole('navigation').getByRole('link', { name: /log in/i }).click();

  await page.getByPlaceholder('Email').fill('e2e@example.com');
  await page.getByPlaceholder('Password').fill('test1234');
  await page.getByRole('button', { name: /continue/i }).click();

  // Expect profile/sign out in header
  await expect(page.getByRole('navigation').getByRole('link', { name: /profile/i })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('button', { name: /sign out/i })).toBeVisible();

  // Sign out works
  await page.getByRole('navigation').getByRole('button', { name: /sign out/i }).click();
  await expect(page.getByRole('navigation').getByRole('link', { name: /log in/i })).toBeVisible();
});
