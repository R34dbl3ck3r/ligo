/**
 * Captura de evidencias del flujo principal (una imagen por paso).
 *
 * Se ejecuta bajo demanda para adjuntar evidencia visual a un reporte o a una
 * incidencia, sin ensuciar la suite de pruebas:
 *   npx tsx scripts/capture-evidence.ts   (o npx playwright test si se prefiere)
 */
import { chromium, selectors } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const OUT_DIR = process.env.EVIDENCE_DIR ?? path.resolve('../evidence/web/screenshots');

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Fuera del test runner hay que fijar el atributo de test explícitamente
  // (la opción `testIdAttribute` de playwright.config.ts sólo aplica a los tests).
  selectors.setTestIdAttribute('data-test');
  // `BROWSER_CHANNEL=chrome` permite reutilizar un Chrome/Edge ya instalado en la
  // máquina en lugar del Chromium que descarga Playwright. Sin la variable se usa
  // el navegador embebido, que es el comportamiento por defecto en CI.
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const shot = (name: string) => page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });

  await page.goto(BASE_URL);
  await shot('01-login.png');

  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill(process.env.SAUCE_PASSWORD ?? 'secret_sauce');
  await page.getByTestId('login-button').click();
  await page.getByTestId('inventory-list').waitFor();
  await shot('02-inventario.png');

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('add-to-cart-sauce-labs-bolt-t-shirt').click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('cart-contents-container').waitFor();
  await shot('03-carrito.png');

  await page.getByTestId('checkout').click();
  await page.getByTestId('firstName').fill('Paolo');
  await page.getByTestId('lastName').fill('Villanueva');
  await page.getByTestId('postalCode').fill('15001');
  await shot('04-datos-envio.png');

  await page.getByTestId('continue').click();
  await page.getByTestId('checkout-summary-container').waitFor();
  await shot('05-resumen-importes.png');

  await page.getByTestId('finish').click();
  await page.getByTestId('checkout-complete-container').waitFor();
  await shot('06-confirmacion.png');

  await browser.close();
  console.log(`Evidencias guardadas en ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
