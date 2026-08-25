import { expect, test } from '@playwright/test'

test('renders the ERP Beauty Pro initial screen', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'ERP Beauty Pro',
    }),
  ).toBeVisible()

  await expect(page.getByText('Sistema integral para la gestión de peluquerías')).toBeVisible()

  await expect(
    page.getByText('El frontend del ERP Beauty Pro se inicializó correctamente.'),
  ).toBeVisible()

  await expect(
    page.getByRole('button', {
      name: 'Frontend inicializado',
    }),
  ).toBeVisible()
})
