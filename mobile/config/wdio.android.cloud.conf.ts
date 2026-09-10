import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf';

/**
 * Ejecución en una granja de dispositivos (Sauce Labs como ejemplo).
 *
 * Es el mismo código de test: sólo cambian las capabilities y el endpoint.
 * Ésta es la vía de escalado natural del framework -> matriz de dispositivos
 * reales en la ejecución nocturna, emulador en Pull Request.
 *
 * Las credenciales SIEMPRE vienen de variables de entorno / GitHub Secrets.
 */
export const config: Options.Testrunner = {
  ...sharedConfig,
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  hostname: `ondemand.${process.env.SAUCE_REGION ?? 'eu-central-1'}.saucelabs.com`,
  port: 443,
  protocol: 'https',
  path: '/wd/hub',
  services: [],
  maxInstances: 3,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Google Pixel 7',
      'appium:platformVersion': '13',
      'appium:app': process.env.SAUCE_APP_STORAGE ?? 'storage:filename=mda.apk',
      'sauce:options': {
        build: process.env.BUILD_TAG ?? 'local-build',
        name: 'My Demo App - E2E',
        appiumVersion: '2.11.2',
      },
    } as WebdriverIO.Capabilities,
  ],
} as Options.Testrunner;
