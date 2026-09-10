import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright.
 *
 * Decisiones:
 *  - `baseURL` parametrizado por entorno (BASE_URL) para poder ejecutar contra
 *    https://www.saucedemo.com (por defecto) o contra un despliegue local/staging.
 *  - `trace: 'on-first-retry'` -> evidencia rica sólo cuando algo falla (coste/beneficio).
 *  - `retries` sólo en CI: en local un fallo debe verse como fallo, no ocultarse.
 *  - `forbidOnly` en CI para que un `test.only` olvidado no reduzca la cobertura.
 *  - Reporters: `list` (consola), `html` (humano) y `junit` (integración con GitHub Actions).
 */
const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: './reports/artifacts',
  // Aislamiento total: cada archivo corre en un worker independiente y en paralelo.
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  workers: IS_CI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 7_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test', // SauceDemo expone data-test: localizadores estables
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Cross-browser sólo en la ejecución nocturna (npx playwright test --project=firefox)
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
