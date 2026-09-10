import path from 'node:path';
import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf';

/**
 * Ejecución local contra emulador o dispositivo físico Android.
 *
 * Variables de entorno soportadas:
 *   ANDROID_DEVICE   nombre del avd/dispositivo (por defecto: emulator-5554)
 *   ANDROID_VERSION  versión de Android
 *   APP_PATH         ruta al APK (por defecto: ./apps/mda-<version>.apk)
 */
export const config: Options.Testrunner = {
  ...sharedConfig,
  port: 4723,
  services: [
    [
      'appium',
      {
        args: { relaxedSecurity: true },
        logPath: './reports',
      },
    ],
  ],
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE ?? 'emulator-5554',
      'appium:platformVersion': process.env.ANDROID_VERSION ?? '13',
      'appium:app':
        process.env.APP_PATH ?? path.resolve(process.cwd(), 'apps/mda-2.2.0-25.apk'),
      'appium:appPackage': 'com.saucelabs.mydemoapp.android',
      'appium:appActivity': '.view.activities.SplashActivity',
      'appium:autoGrantPermissions': true,
      // Reinstalar la app en cada sesión garantiza estado limpio entre suites
      // (sin datos de un run anterior): aislamiento a nivel de dispositivo.
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      // Reduce la principal causa de flakiness en Android: animaciones.
      'appium:disableWindowAnimation': true,
      'appium:uiautomator2ServerLaunchTimeout': 90_000,
    },
  ],
} as Options.Testrunner;
