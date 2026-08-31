import { expect, test } from '@playwright/test'

test('redirects a visitor to the login screen', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
})
