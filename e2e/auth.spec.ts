import { expect, test } from '@playwright/test'

function createToken(): string {
  const now = Math.floor(Date.now() / 1000)
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    sub: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
    company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
    iat: now,
    exp: now + 1800,
  })}.signature`
}

test('authenticates and displays the private dashboard', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    expect(route.request().postData()).toContain('username=admin%40peluqueria.com')

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: createToken(),
        token_type: 'bearer',
      }),
    })
  })

  await page.route('**/api/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
        company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
        email: 'admin@peluqueria.com',
        is_active: true,
        is_verified: false,
        last_login: null,
        created_at: '2026-08-25T00:00:00Z',
        updated_at: '2026-08-25T00:00:00Z',
      }),
    })
  })

  await page.route('**/api/v1/dashboard**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        detail: 'Dashboard omitted from authentication test',
      }),
    })
  })

  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@peluqueria.com')
  await page.locator('input[type="password"]').fill('password123')
  await page.getByRole('button', { name: 'Ingresar al sistema' }).click()

  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: 'Panel de control' })).toBeVisible()
})
