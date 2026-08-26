import { expect, test } from '@playwright/test'

const futureJwt = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiI1Y2M1ODk4ZC1hMmZlLTRhZjMtYTVjMS0xYWZhNTE0NDg4M2UiLCJjb21wYW55X2lkIjoiYmY3YmQ0MzItMGMzMS00MzUwLTk1ZjItY2NlNjJkZGE0ODg0IiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9',
  'test-signature',
].join('.')

test('displays the operational dashboard and applies its filters', async ({ page }) => {
  await page.addInitScript((token) => {
    window.sessionStorage.setItem('erp_beauty_pro_access_token', token)
  }, futureJwt)

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
        created_at: '2026-08-01T12:00:00Z',
        updated_at: '2026-08-01T12:00:00Z',
      }),
    })
  })

  let dashboardRequests = 0

  await page.route('**/api/v1/dashboard**', async (route) => {
    dashboardRequests += 1
    const requestUrl = new URL(route.request().url())

    expect(requestUrl.searchParams.get('timezone')).toBe('America/Bogota')
    expect(requestUrl.searchParams.get('top_limit')).toBeTruthy()

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        metadata: {
          company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
          start_date: requestUrl.searchParams.get('start_date'),
          end_date: requestUrl.searchParams.get('end_date'),
          timezone: 'America/Bogota',
          generated_at: '2026-08-24T21:15:12.814181Z',
        },
        top_limit: Number(requestUrl.searchParams.get('top_limit')),
        kpis: {
          completed_sales_count: 2,
          cancelled_sales_count: 1,
          sales_cancellation_rate: '33.33',
          net_sales: '180000.00',
          average_ticket: '90000.00',
          total_income: '230000.00',
          total_expense: '50000.00',
          net_cash_flow: '180000.00',
          total_stock_units: '46.000',
          low_stock_products: 1,
          out_of_stock_products: 0,
          active_customers: 3,
          new_customers: 1,
          services_sold: 2,
          service_revenue: '120000.00',
          appointments_count: 4,
          completed_appointments: 2,
          cancelled_appointments: 1,
          no_show_appointments: 0,
          appointment_completion_rate: '66.67',
        },
        charts: {
          daily_sales: [
            {
              date: '2026-08-01',
              sales_count: 2,
              net_sales: '180000.00',
            },
          ],
          daily_cash_flow: [
            {
              date: '2026-08-01',
              income: '230000.00',
              expense: '50000.00',
              net_amount: '180000.00',
            },
          ],
          appointments_by_status: [
            { status: 'scheduled', appointments_count: 1 },
            { status: 'confirmed', appointments_count: 0 },
            { status: 'in_progress', appointments_count: 0 },
            { status: 'completed', appointments_count: 2 },
            { status: 'cancelled', appointments_count: 1 },
            { status: 'no_show', appointments_count: 0 },
          ],
          inventory_movements: [
            {
              movement_type: 'entry',
              movements_count: 3,
              quantity: '22.000',
            },
          ],
        },
        highlights: {
          products: [
            {
              product_id: 'd360553e-44cc-4855-b513-156c63a75baf',
              code: 'PROD-001',
              name: 'Shampoo profesional',
              sales_count: 2,
              quantity: '2.000',
              revenue: '60000.00',
              current_stock: '12.000',
            },
          ],
          services: [],
          customers: [],
        },
      }),
    })
  })

  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Panel de control' })).toBeVisible()
  await expect(page.getByText('Ventas netas')).toBeVisible()
  await expect(page.getByText('Shampoo profesional')).toBeVisible()

  await expect.poll(() => dashboardRequests).toBeGreaterThanOrEqual(1)
  const requestsBeforeRefresh = dashboardRequests

  await page.getByLabel('Fecha final').fill('2026-08-20')
  await page.getByRole('button', { name: 'Actualizar' }).click()

  await expect.poll(() => dashboardRequests).toBeGreaterThan(requestsBeforeRefresh)
})
