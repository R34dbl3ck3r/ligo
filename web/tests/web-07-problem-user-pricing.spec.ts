import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { validCheckoutInfo } from '@data/checkout-data';
import { round2 } from '@utils/money';

/**
 * WEB-07 | P0 | Consistencia de precios entre carrito y resumen de compra.
 *
 * Este test documenta un DEFECTO REAL del sistema bajo prueba: con
 * `problem_user`, el resumen de checkout duplica el precio de cada artículo
 * respecto al carrito (ver docs/07-hallazgos.md, BUG-WEB-01).
 *
 * Se marca con `test.fail()`: la prueba se ejecuta, se espera que falle y el
 * pipeline avisa en cuanto el defecto se corrija (el test pasaría "inesperadamente").
 * Es preferible a comentar el test o a codificar el comportamiento erróneo como
 * esperado, que ocultaría la regresión.
 */
test.describe('WEB-07 Consistencia de precios', () => {
  test(
    'el subtotal del resumen coincide con el del carrito (problem_user)',
    { tag: ['@regression', '@p0', '@known-issue'] },
    async ({
      loggedIn,
      cartPage,
      checkoutInformationPage,
      checkoutOverviewPage,
    }) => {
      test.fail(true, 'BUG-WEB-01: problem_user duplica precios en el resumen');

      await loggedIn({
        username: users.problem.username,
        cart: [products.backpack, products.bikeLight],
      });
      await cartPage.open();
      const cartSubtotal = await cartPage.subtotalFromItems();

      await cartPage.checkout();
      await checkoutInformationPage.submit(validCheckoutInfo);
      await checkoutOverviewPage.expectLoaded();

      expect(await checkoutOverviewPage.subtotal()).toBe(round2(cartSubtotal));
    },
  );
});
