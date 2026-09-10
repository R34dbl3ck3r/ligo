import { test, expect } from '@fixtures/pages.fixture';
import { products } from '@data/products';

/**
 * WEB-03 | P1 | Gestión del carrito.
 * Riesgo cubierto: el contador del carrito y su contenido se desincronizan,
 * lo que arrastra al cliente a pagar por artículos que no eligió.
 *
 * Precondición sembrada por cookie/localStorage: el test no vuelve a probar
 * el login (eso ya lo hace WEB-02) y arranca directamente en el catálogo.
 */
test.describe('WEB-03 Carrito', () => {
  test(
    'añadir y quitar productos mantiene sincronizados badge y contenido',
    { tag: ['@regression', '@p1'] },
    async ({ loggedIn, inventoryPage, cartPage }) => {
      await loggedIn();
      await inventoryPage.open();

      await inventoryPage.addToCart(products.backpack, products.onesie);
      expect(await inventoryPage.header.cartCount()).toBe(2);

      await inventoryPage.removeFromCart(products.onesie);
      expect(await inventoryPage.header.cartCount()).toBe(1);

      await inventoryPage.header.goToCart();
      await cartPage.expectLoaded();
      expect(await cartPage.itemNames()).toEqual([products.backpack.name]);
    },
  );

  test(
    'el carrito persiste al navegar entre catálogo y ficha de producto',
    { tag: ['@regression', '@p1'] },
    async ({ loggedIn, inventoryPage, productDetailPage, cartPage }) => {
      await loggedIn({ cart: [products.fleeceJacket] });
      await inventoryPage.open();
      expect(await inventoryPage.header.cartCount()).toBe(1);

      await productDetailPage.openById(products.bikeLight);
      await expect(productDetailPage.name).toHaveText(products.bikeLight.name);
      await productDetailPage.addToCartButton.click();
      await expect(productDetailPage.removeButton).toBeVisible();

      await productDetailPage.backButton.click();
      await inventoryPage.expectLoaded();
      expect(await inventoryPage.header.cartCount()).toBe(2);

      await inventoryPage.header.goToCart();
      expect(await cartPage.itemNames()).toEqual(
        expect.arrayContaining([products.fleeceJacket.name, products.bikeLight.name]),
      );
    },
  );

  test(
    'eliminar el último producto deja el carrito vacío y sin badge',
    { tag: ['@regression', '@p2'] },
    async ({ loggedIn, cartPage }) => {
      await loggedIn({ cart: [products.redTShirt] });
      await cartPage.open();

      await cartPage.removeFromCart(products.redTShirt);

      await expect(cartPage.items).toHaveCount(0);
      expect(await cartPage.header.cartCount()).toBe(0);
    },
  );
});
