import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['github']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Next.js dev garde des connexions HMR ouvertes → "load" peut ne jamais arriver
    // On force domcontentloaded comme comportement par défaut
    navigationTimeout: 45000,
    actionTimeout: 15000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    // En local : next dev (rapide, sans build)
    // En CI   : build complet puis start
    command: process.env.CI ? 'npx next build && npx next start -p 3001' : 'npx next dev -p 3001',
    url: 'http://localhost:3001',
    // false = ne jamais réutiliser un serveur existant (évite de se connecter
    // accidentellement à un autre projet déjà lancé sur ce port)
    reuseExistingServer: false,
    timeout: 180000,
    env: {
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
})
