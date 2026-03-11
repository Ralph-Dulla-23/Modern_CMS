import { test, expect } from '@playwright/test';

test('landing page loads and displays main components', async ({ page }) => {
  // Navigate to the root URL
  await page.goto('/');

  // Check that the main application title or brand element is visible.
  // We look for a known text string from the Hero section based on earlier context.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  
  // Verify the login button exists in the navigation
  const loginButton = page.getByRole('button', { name: /login/i });
  await expect(loginButton).toBeVisible();
});
