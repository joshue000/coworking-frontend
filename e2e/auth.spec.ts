import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000';

const emptyPage = {
  data: [],
  meta: { total: 0, page: 1, pageSize: 1, totalPages: 0 },
};

const spacesListPage = {
  data: [
    {
      id: 'space-1',
      placeId: 'place-1',
      name: 'Meeting Room A',
      capacity: 10,
      opensAt: '08:00',
      closesAt: '18:00',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      place: { id: 'place-1', name: 'HQ Office', latitude: 0, longitude: 0, timezone: 'UTC' },
    },
  ],
  meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
};

test.describe('Authentication', () => {
  test('shows API key setup screen on first visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('saves key and enters the app after successful validation', async ({ page }) => {
    await page.route(`${API}/api/spaces*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyPage),
      });
    });
    await page.route(`${API}/api/places*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyPage),
      });
    });

    await page.goto('/');
    await page.locator('input').first().fill('valid-api-key');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/spaces/, { timeout: 5_000 });
  });

  test('shows setup screen again when API key is rejected', async ({ page }) => {
    await page.route(`${API}/api/spaces*`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Unauthorized' } }),
      });
    });

    await page.goto('/');
    await page.locator('input').first().fill('wrong-key');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.locator('input').first()).toBeVisible({ timeout: 3_000 });
  });

  test('clears stored key on 401 and shows setup screen', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'coworking-auth',
        JSON.stringify({ state: { apiKey: 'expired-key' }, version: 0 })
      );
    });

    await page.route(`${API}/api/**`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Unauthorized' } }),
      });
    });

    await page.goto('/spaces');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 5_000 });
  });

  test('restores session from localStorage on reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'coworking-auth',
        JSON.stringify({ state: { apiKey: 'my-key' }, version: 0 })
      );
    });

    await page.route(`${API}/api/spaces*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(spacesListPage),
      });
    });
    await page.route(`${API}/api/places*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyPage),
      });
    });

    await page.goto('/spaces');
    await expect(page.getByText('Meeting Room A')).toBeVisible({ timeout: 5_000 });
  });
});
