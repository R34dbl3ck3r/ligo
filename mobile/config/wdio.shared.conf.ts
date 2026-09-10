import type { Options } from '@wdio/types';

/**
 * Configuración compartida por todos los entornos (local y cloud).
 * Cada entorno concreto la extiende y sólo aporta sus `capabilities`.
 * Así no se duplica la política de timeouts, reporters ni framework.
 */
export const sharedConfig: Partial<Options.Testrunner> = {
  runner: 'local',
  // WebdriverIO v9 compila TypeScript automáticamente (tsx); no hace falta
  // configurar ts-node. Los alias de rutas se leen de tsconfig.json.
  specs: ['../tests/**/*.spec.ts'],
  maxInstances: 1,
  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 15_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 2,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 180_000,
  },
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],
  /**
   * Evidencia automática: captura de pantalla adjunta al reporte ante cualquier
   * fallo. Es lo primero que se mira al triar un fallo en CI.
   */
  afterTest: async function (
    _test: unknown,
    _context: unknown,
    { passed }: { passed: boolean },
  ) {
    if (!passed) {
      await browser.takeScreenshot();
    }
  },
};
