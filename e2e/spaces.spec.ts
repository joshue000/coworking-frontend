import { test, expect } from '@playwright/test';

const API = 'http://localhost:3000';

const PLACES_RESPONSE = {
  data: [{ id: 'place-1', name: 'HQ Office', latitude: 0, longitude: 0, timezone: 'UTC', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }],
  meta: { total: 1, page: 1, pageSize: 100, totalPages: 1 },
};

const SPACES_LIST_RESPONSE = {
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
      place: { id: 'place-1', name: 'HQ Office', latitude: 0, longitude: 0, timezone: 'UTC', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
    },
    {
      id: 'space-2',
      placeId: 'place-1',
      name: 'Focus Pod B',
      capacity: 2,
      opensAt: '09:00',
      closesAt: '20:00',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      place: { id: 'place-1', name: 'HQ Office', latitude: 0, longitude: 0, timezone: 'UTC', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
    },
  ],
  meta: { total: 2, page: 1, pageSize: 20, totalPages: 1 },
};

const SPACE_DETAIL_RESPONSE = {
  data: SPACES_LIST_RESPONSE.data[0],
};

const EMPTY_RESERVATIONS = {
  data: [],
  meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

// Inject API key and mock places before every test
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'coworking-auth',
      JSON.stringify({ state: { apiKey: 'test-key' }, version: 0 })
    );
  });

  await page.route(`${API}/api/places*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(PLACES_RESPONSE),
    });
  });
});

test.describe('Spaces list', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/spaces`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SPACES_LIST_RESPONSE),
      });
    });
    // Also intercept paginated requests
    await page.route(`${API}/api/spaces?*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SPACES_LIST_RESPONSE),
      });
    });
  });

  test('displays all spaces', async ({ page }) => {
    await page.goto('/spaces');
    await expect(page.getByText('Meeting Room A')).toBeVisible();
    await expect(page.getByText('Focus Pod B')).toBeVisible();
  });

  test('shows place name for each space', async ({ page }) => {
    await page.goto('/spaces');
    await expect(page.locator('td', { hasText: 'HQ Office' }).first()).toBeVisible();
  });

  test('shows capacity', async ({ page }) => {
    await page.goto('/spaces');
    await expect(page.getByText(/10/).first()).toBeVisible();
  });

  test('navigates to space detail via direct URL', async ({ page }) => {
    await page.route(`${API}/api/spaces/space-1`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SPACE_DETAIL_RESPONSE),
      });
    });
    await page.route(`${API}/api/reservations*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPTY_RESERVATIONS),
      });
    });

    await page.goto('/spaces/space-1');
    await expect(page.getByText('Meeting Room A')).toBeVisible({ timeout: 3_000 });
    await expect(page).toHaveURL(/\/spaces\/space-1/);
  });
});

test.describe('Space detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/api/spaces/space-1`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SPACE_DETAIL_RESPONSE),
      });
    });
    await page.route(`${API}/api/reservations*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPTY_RESERVATIONS),
      });
    });
  });

  test("shows the space name and today's reservations section", async ({ page }) => {
    await page.goto('/spaces/space-1');
    await expect(page.getByText('Meeting Room A')).toBeVisible();
    await expect(page.getByRole('heading', { name: /today/i })).toBeVisible();
  });

  test('shows empty state when no reservations', async ({ page }) => {
    await page.goto('/spaces/space-1');
    await expect(page.getByText(/no reservations/i)).toBeVisible();
  });

  test('shows Book this space button', async ({ page }) => {
    await page.goto('/spaces/space-1');
    await expect(page.getByRole('button', { name: /book/i })).toBeVisible();
  });
});
