import { expect, test } from '@playwright/test'

const companyId = 'bf7bd432-0c31-4350-95f2-cce62dda4884'
const appointmentId = '11111111-1111-4111-8111-111111111111'
const customerId = '22222222-2222-4222-8222-222222222222'
const employeeId = '33333333-3333-4333-8333-333333333333'
const serviceId = '44444444-4444-4444-8444-444444444444'

const futureJwt = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiI1Y2M1ODk4ZC1hMmZlLTRhZjMtYTVjMS0xYWZhNTE0NDg4M2UiLCJjb21wYW55X2lkIjoiYmY3YmQ0MzItMGMzMS00MzUwLTk1ZjItY2NlNjJkZGE0ODg0IiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9',
  'test-signature',
].join('.')

test('displays the appointment workspace and opens the creation form', async ({ page }) => {
  await page.addInitScript((token) => {
    window.sessionStorage.setItem('erp_beauty_pro_access_token', token)
  }, futureJwt)

  await page.route('**/api/v1/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
        company_id: companyId,
        email: 'admin@peluqueria.com',
        is_active: true,
        is_verified: true,
        last_login: null,
        created_at: '2026-08-24T18:00:00Z',
        updated_at: '2026-08-24T18:00:00Z',
      }),
    })
  })

  await page.route('**/api/v1/customers**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total: 1,
        items: [
          {
            id: customerId,
            company_id: companyId,
            first_name: 'Laura',
            last_name: 'Gómez',
            document_number: null,
            phone: '3001234567',
            email: 'laura@example.com',
            notes: null,
            is_active: true,
            created_at: '2026-08-24T18:00:00Z',
            updated_at: '2026-08-24T18:00:00Z',
          },
        ],
      }),
    })
  })

  await page.route('**/api/v1/employees**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: employeeId,
          company_id: companyId,
          first_name: 'Ana',
          last_name: 'Torres',
          document_number: null,
          email: null,
          phone: null,
          job_title: 'Estilista',
          salary: null,
          commission_percentage: null,
          hire_date: null,
          attendance_code: null,
          biometric_device_user_id: null,
          biometric_enabled: false,
          is_active: true,
          created_at: '2026-08-24T18:00:00Z',
          updated_at: '2026-08-24T18:00:00Z',
        },
      ]),
    })
  })

  await page.route('**/api/v1/services/company/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: serviceId,
          company_id: companyId,
          name: 'Corte y peinado',
          description: null,
          duration_minutes: 60,
          price: '45000.00',
          is_active: true,
          created_at: '2026-08-24T18:00:00Z',
          updated_at: '2026-08-24T18:00:00Z',
        },
      ]),
    })
  })

  for (const path of ['work-schedules', 'schedule-blocks', 'reminders']) {
    await page.route(`**/api/v1/appointments/${path}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total: 0, items: [] }),
      })
    })
  }

  let appointmentRequests = 0
  await page.route(/\/api\/v1\/appointments(?:\?.*)?$/, async (route) => {
    appointmentRequests += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total: 1,
        items: [
          {
            id: appointmentId,
            company_id: companyId,
            customer_id: customerId,
            employee_id: employeeId,
            service_id: serviceId,
            start_at: '2026-08-25T14:00:00-05:00',
            end_at: '2026-08-25T15:00:00-05:00',
            status: 'confirmed',
            notes: 'Corte y peinado',
            cancellation_reason: null,
            created_at: '2026-08-24T18:00:00Z',
            updated_at: '2026-08-24T18:00:00Z',
          },
        ],
      }),
    })
  })

  await page.goto('/appointments')

  await expect(page.getByRole('heading', { name: 'Agenda y citas' })).toBeVisible()
  await expect(page.getByText('Laura Gómez')).toBeVisible()
  await expect(page.getByText('Corte y peinado')).toBeVisible()

  await page.getByRole('button', { name: 'Nueva cita' }).click()
  await expect(page.getByRole('dialog')).toContainText(/nueva cita/i)

  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.getByRole('button', { name: 'Aplicar filtros' }).click()

  await expect.poll(() => appointmentRequests).toBe(2)
})
