# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> redirects unauthenticated users from dashboard
- Location: e2e\homepage.spec.ts:30:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/dashboard
Call log:
  - navigating to "http://localhost:3001/dashboard", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  |
  3  | // Option commune pour éviter d'attendre l'événement "load" (Next.js dev garde des
  4  | // connexions HMR/DB ouvertes qui empêchent le "load" de se déclencher dans les délais)
  5  | const NAV = { waitUntil: 'domcontentloaded' } as const
  6  |
  7  | test.describe('Homepage', () => {
  8  |   test('loads successfully', async ({ page }) => {
  9  |     await page.goto('/', NAV)
  10 |     // Titre réel : "Accueil • LBS Call Center" (template layout appliqué par Next.js)
  11 |     await expect(page).toHaveTitle(/Accueil/)
  12 |     await expect(page.locator('body')).toBeVisible()
  13 |   })
  14 |
  15 |   test('contient le contenu marketing principal', async ({ page }) => {
  16 |     await page.goto('/', NAV)
  17 |     await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  18 |     // 2 liens "Connexion" sur la page (navbar + footer) — on cible la navigation
  19 |     await expect(
  20 |       page.getByRole('navigation').getByRole('link', { name: 'Connexion' })
  21 |     ).toBeVisible()
  22 |   })
  23 |
  24 |   test('is accessible on mobile', async ({ page }) => {
  25 |     await page.setViewportSize({ width: 375, height: 667 })
  26 |     await page.goto('/', NAV)
  27 |     await expect(page.locator('body')).toBeVisible()
  28 |   })
  29 |
  30 |   test('redirects unauthenticated users from dashboard', async ({ page }) => {
> 31 |     await page.goto('/dashboard', NAV)
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/dashboard
  32 |     // Le middleware redirige vers /login — on attend que l'URL change
  33 |     await expect(page).toHaveURL(/login/, { timeout: 15000 })
  34 |   })
  35 | })
  36 |
  37 | test.describe('Authentication', () => {
  38 |   test('login page is accessible', async ({ page }) => {
  39 |     await page.goto('/login', NAV)
  40 |     // Les inputs sont des composants client-side — on cible les IDs
  41 |     await expect(page.locator('#email')).toBeVisible({ timeout: 10000 })
  42 |     await expect(page.locator('#password')).toBeVisible({ timeout: 10000 })
  43 |   })
  44 |
  45 |   test('forgot password page is accessible', async ({ page }) => {
  46 |     await page.goto('/forgot-password', NAV)
  47 |     await expect(page.locator('#email')).toBeVisible({ timeout: 10000 })
  48 |   })
  49 |
  50 |   test('login page affiche une erreur via paramètre URL', async ({ page }) => {
  51 |     // NextAuth v5 beta redirige vers /login?error=CredentialsSignin sur échec d'auth.
  52 |     // On simule ce comportement directement — découplé du formulaire et de l'état de la DB.
  53 |     await page.goto('/login?error=CredentialsSignin', NAV)
  54 |     await expect(page.getByText('Identifiants invalides.')).toBeVisible({ timeout: 5000 })
  55 |   })
  56 | })
  57 |
```
