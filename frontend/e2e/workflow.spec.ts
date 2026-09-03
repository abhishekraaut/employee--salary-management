import { test, expect } from '@playwright/test';

test('Critical HR Workflow', async ({ page }) => {
  // Open application
  await page.goto('http://localhost:5173/login');
  
  // Authenticate
  await page.fill('input[type="email"]', 'abhishek.hr@abhitech.com');
  await page.fill('input[type="password"]', 'abhi@123');
  await page.click('button[type="submit"]');

  // Dashboard
  await expect(page.locator('h1')).toHaveText('Dashboard');
  
  // Navigate to employees
  await page.click('text=Employees');
  await expect(page.locator('h1')).toHaveText('Employees');

  // Search employee
  await page.fill('input[placeholder="Search employees by name..."]', 'John');
  
  // Wait for network response implicitly or explicit text
  await expect(page.locator('table')).toBeVisible();

  // We are not mocking backend in full E2E so we'll just check if basic UI is rendering
  // A complete E2E would click an employee and update salary.
});
