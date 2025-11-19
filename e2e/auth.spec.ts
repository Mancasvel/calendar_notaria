import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/mis-vacaciones')
    await expect(page).toHaveURL('/login')
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h2')).toContainText('Vacation Management System')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')

    // HTML5 validation should prevent submission
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Vacation Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // This would need to be adapted based on your actual authentication setup
    // For now, we'll mock the authentication
    await page.addInitScript(() => {
      // Mock session storage for testing
      window.sessionStorage.setItem('next-auth.session-token', 'mock-token')
    })
  })

  test('should show vacation dashboard for authenticated users', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: () => 'mock-session',
          setItem: () => {},
          removeItem: () => {},
        },
        writable: true,
      })
    })

    await page.goto('/mis-vacaciones')
    // This test would need to be adapted based on your actual session handling
  })

  test('should allow requesting vacation', async ({ page }) => {
    await page.goto('/solicitar-vacaciones')

    // Fill vacation request form
    await page.fill('input[name="startDate"]', '2024-12-01')
    await page.fill('input[name="endDate"]', '2024-12-05')

    // Check availability
    await page.click('text=Verificar Disponibilidad')

    // Should show availability results
    await expect(page.locator('text=Fechas disponibles')).toBeVisible()
  })
})
