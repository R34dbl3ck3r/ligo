import { Page } from '@playwright/test';
import { Product } from '@data/products';
import { env } from '@config/env';

/**
 * Siembra de estado (state seeding).
 *
 * SauceDemo guarda la sesión en la cookie `session-username` y el carrito en
 * `localStorage["cart-contents"]`. Sembrar ese estado permite que un test que
 * valida el *checkout* no dependa del test de login ni del test de carrito:
 *   - elimina dependencias entre pruebas (cada test es atómico),
 *   - reduce el tiempo de ejecución y la superficie de flakiness,
 *   - deja el login como escenario probado explícitamente en su propio test.
 *
 * Regla del proyecto: la UI se usa para *probar* el flujo bajo prueba;
 * para *preparar* precondiciones se usa la vía más rápida y estable disponible.
 */
export async function seedSession(
  page: Page,
  username: string,
  cart: ReadonlyArray<Product> = [],
): Promise<void> {
  const baseURL = new URL(env.baseURL);

  await page.context().addCookies([
    {
      name: 'session-username',
      value: username,
      domain: baseURL.hostname,
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 600,
    },
  ]);

  const ids = cart.map((product) => product.id);
  await page.addInitScript((cartIds: number[]) => {
    if (cartIds.length > 0) {
      window.localStorage.setItem('cart-contents', JSON.stringify(cartIds));
    } else {
      window.localStorage.removeItem('cart-contents');
    }
  }, ids);
}
