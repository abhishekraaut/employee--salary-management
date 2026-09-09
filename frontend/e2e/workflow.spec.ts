import { test, expect } from '@playwright/test';

test('Critical HR Workflow', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.fill('input[type="email"]', 'abhishek.hr@abhitech.com');
  await page.fill('input[type="password"]', 'abhi@123');
  await page.click('button[type="submit"]');

  await expect(page.locator('h1')).toHaveText('Dashboard');

  await page.getByRole('link', { name: 'Employees' }).click();
  await expect(page.locator('h1')).toHaveText('Employees');

  await page.getByPlaceholder('Search employees by name...').fill('First0');
  await expect(page.getByRole('row').nth(1)).toContainText('First0');
  await page.getByRole('row').nth(1).click();

  await expect(page.getByRole('heading', { level: 2 })).toContainText('First0');
  await page.getByRole('button', { name: 'Update Salary' }).click();
  await page.getByLabel('Amount').fill('123456');
  await page.getByLabel('Reason (Optional)').fill('E2E salary review');

  await Promise.all([
    page.waitForResponse(response => response.url().includes('/compensations') && response.request().method() === 'POST'),
    page.getByRole('button', { name: 'Save Update' }).click()
  ]);

  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('link', { name: 'Audit Log' }).click();
  await expect(page.getByText('E2E salary review')).toBeVisible();
});

test('Login shows the backend validation message', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'abhishek.hr@abhitech.com');
  await page.fill('input[type="password"]', 'wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});
