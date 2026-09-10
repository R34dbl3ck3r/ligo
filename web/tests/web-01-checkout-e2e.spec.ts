import { test, expect } from '@fixtures/pages.fixture';
import { users } from '@data/users';
import { products } from '@data/products';
import { validCheckoutInfo } from '@data/checkout-data';
import { env } from '@config/env';
import { expectedTax, round2 } from '@utils/money';

/**
 * WEB-01 | P0 | Flujo principal de compra end-to-end.
 * Técnica: prueba de transición de estados sobre el camino feliz
 * (Login -> Productos -> Carrito -> Checkout -> Confirmación).
 *
 * Es el único test que recorre el flujo completo por UI: es el que protege
 * el ingreso del negocio. El resto de escenarios ataca partes concretas
 * partiendo de estado sembrado, para no repetir el mismo recorrido N veces.
 */
test.describe('WEB-01 Compra end-to-end', () => {
  test(
    'un usuario estándar completa una compra y recibe la confirmación',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInformationPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      const selected = [products.backpack, products.boltTShirt];
      const expectedSubtotal = round2(
        selected.reduce((acc, item) => acc + item.price, 0),
      );

      await test.step('1. Login con usuario estándar', async () => {
        await loginPage.open();
        await loginPage.loginAs(users.standard);
        await inventoryPage.expectLoaded();
        expect(inventoryPage.url).toContain('/inventory.html');
      });

      await test.step('2. Añadir productos al carrito', async () => {
        await inventoryPage.addToCart(...selected);
        expect(await inventoryPage.header.cartCount()).toBe(selected.length);
      });

      await test.step('3. Revisar el carrito', async () => {
        await inventoryPage.header.goToCart();
        await cartPage.expectLoaded();
        expect(await cartPage.itemNames()).toEqual(selected.map((item) => item.name));
      });

      await test.step('4. Completar datos de envío', async () => {
        await cartPage.checkout();
        await checkoutInformationPage.expectLoaded();
        await checkoutInformationPage.submit(validCheckoutInfo);
      });

      await test.step('5. Verificar el resumen y los importes', async () => {
        await checkoutOverviewPage.expectLoaded();
        expect(await checkoutOverviewPage.itemNames()).toEqual(
          selected.map((item) => item.name),
        );

        const subtotal = await checkoutOverviewPage.subtotal();
        const tax = await checkoutOverviewPage.tax();
        const total = await checkoutOverviewPage.total();

        expect(subtotal, 'el subtotal debe ser la suma de los productos').toBe(
          expectedSubtotal,
        );
        expect(tax, `el impuesto debe ser el ${env.taxRate * 100}% del subtotal`).toBe(
          expectedTax(expectedSubtotal, env.taxRate),
        );
        expect(total, 'el total debe ser subtotal + impuesto').toBe(
          round2(subtotal + tax),
        );
      });

      await test.step('6. Confirmar el pedido', async () => {
        await checkoutOverviewPage.finish();
        await checkoutCompletePage.expectLoaded();
        await expect(checkoutCompletePage.completeHeader).toHaveText(
          'Thank you for your order!',
        );
      });

      await test.step('7. El carrito queda vacío tras la compra', async () => {
        expect(await checkoutCompletePage.header.cartCount()).toBe(0);
      });
    },
  );
});
