import { test, expect } from '@playwright/test'

// Option commune pour éviter d'attendre l'événement "load" (Next.js dev garde des
// connexions HMR/DB ouvertes qui empêchent le "load" de se déclencher dans les délais)
const NAV = { waitUntil: 'domcontentloaded' } as const

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/', NAV)
    // Titre réel : "Accueil • LBS Call Center" (template layout appliqué par Next.js)
    await expect(page).toHaveTitle(/Accueil/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('contient le contenu marketing principal', async ({ page }) => {
    await page.goto('/', NAV)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // 2 liens "Connexion" sur la page (navbar + footer) — on cible la navigation
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Connexion' })
    ).toBeVisible()
  })

  test('is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/', NAV)
    await expect(page.locator('body')).toBeVisible()
  })

  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard', NAV)
    // Le middleware redirige vers /login — on attend que l'URL change
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })
})

test.describe('Authentication', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/login', NAV)
    // Les inputs sont des composants client-side — on cible les IDs
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('#password')).toBeVisible({ timeout: 10000 })
  })

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password', NAV)
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 })
  })

  test('login page affiche une erreur via paramètre URL', async ({ page }) => {
    // NextAuth v5 beta redirige vers /login?error=CredentialsSignin sur échec d'auth.
    // On simule ce comportement directement — découplé du formulaire et de l'état de la DB.
    await page.goto('/login?error=CredentialsSignin', NAV)
    await expect(page.getByText('Identifiants invalides.')).toBeVisible({ timeout: 5000 })
  })
})
