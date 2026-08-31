import { expect, test } from '@playwright/test'

test('provides Spanish metadata and keyboard access to main content', async ({ page }) => {
  await page.goto('/login')

  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page).toHaveTitle(/Iniciar sesión \| ERP Beauty Pro/)

  const skipLink = page.getByRole('link', { name: 'Ir al contenido principal' })
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
})
