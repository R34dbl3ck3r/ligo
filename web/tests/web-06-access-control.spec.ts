import { test, expect } from '@fixtures/pages.fixture';

/**
 * WEB-06 | P0 | Control de acceso por URL directa (deep link).
 * Riesgo de seguridad: acceder al catálogo o al checkout sin sesión válida.
 * Es P0 aunque no forme parte del "camino feliz": el impacto es de negocio y legal.
 */
const protectedRoutes = [
  '/inventory.html',
  '/cart.html',
  '/checkout-step-one.html',
  '/checkout-step-two.html',
];

test.describe('WEB-06 Control de acceso', () => {
  for (const route of protectedRoutes) {
    test(
      `sin sesión, ${route} redirige al login`,
      { tag: ['@regression', '@p0', '@security'] },
      async ({ page, loginPage }) => {
        await page.goto(route);

        await loginPage.expectLoaded();
        await loginPage.expectError(
          `Epic sadface: You can only access '${route}' when you are logged in.`,
        );
      },
    );
  }

  test(
    'cerrar sesión invalida el acceso al catálogo',
    { tag: ['@regression', '@p1', '@security'] },
    async ({ loggedIn, inventoryPage, loginPage, page }) => {
      await loggedIn();
      await inventoryPage.open();

      await inventoryPage.header.logout();
      await loginPage.expectLoaded();

      await page.goto('/inventory.html');
      await loginPage.expectLoaded();
      expect(page.url()).not.toContain('/inventory.html');
    },
  );
});
