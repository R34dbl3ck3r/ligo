import { test, expect } from '@fixtures/pages.fixture';
import { products } from '@data/products';
import { checkoutValidationCases, validCheckoutInfo } from '@data/checkout-data';

/**
 * WEB-04 | P1 | Validación del formulario de checkout.
 * Técnica: tabla de decisión sobre campos obligatorios (Data Driven Testing).
 */
test.describe('WEB-04 Validación de datos de envío', () => {
  test.beforeEach(async ({ loggedIn, checkoutInformationPage }) => {
    await loggedIn({ cart: [products.backpack] });
    await checkoutInformationPage.open();
  });

  for (const scenario of checkoutValidationCases) {
    test(
      `no permite continuar ${scenario.id}`,
      { tag: ['@regression', '@p1'] },
      async ({ checkoutInformationPage, page }) => {
        await checkoutInformationPage.submit(scenario.info);

        await checkoutInformationPage.expectError(scenario.expectedError);
        expect(page.url()).toContain('/checkout-step-one.html');
      },
    );
  }

  test(
    'con los tres campos completos avanza al resumen',
    { tag: ['@smoke', '@regression', '@p1'] },
    async ({ checkoutInformationPage, checkoutOverviewPage }) => {
      await checkoutInformationPage.submit(validCheckoutInfo);
      await checkoutOverviewPage.expectLoaded();
    },
  );

  test(
    'cancelar devuelve al carrito conservando los productos',
    { tag: ['@regression', '@p2'] },
    async ({ checkoutInformationPage, cartPage }) => {
      await checkoutInformationPage.cancelButton.click();

      await cartPage.expectLoaded();
      expect(await cartPage.itemNames()).toEqual([products.backpack.name]);
    },
  );
});
