import { test, expect } from '@playwright/test';

test.describe('Hedef15 Pro', () => {
  test('loads homepage with brand and tabs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('HEDEF15', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Kupon & Formül|Kupon/i }).first()).toBeVisible();
  });

  test('shows column summary after formula calculation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Nihai Kolon Sayısı').or(page.getByText(/Kolon/i)).first()).toBeVisible({ timeout: 15_000 });
  });

  test('can navigate to AI radar tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /AI Değer Radarı|Değer Radarı/i }).first().click();
    await expect(page.getByText(/Değer \(Value\) Radarı|Arbitraj/i).first()).toBeVisible();
  });
});
