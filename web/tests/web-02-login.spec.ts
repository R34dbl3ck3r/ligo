import { test, expect } from '@fixtures/pages.fixture';
import { invalidLogins, users } from '@data/users';

/**
 * WEB-02 | P0 | Autenticación.
 * Técnicas: partición de equivalencia (credenciales válidas / inválidas /
 * campos obligatorios ausentes) + Data Driven Testing sobre `invalidLogins`.
 *
 * Un solo caso por partición: añadir más contraseñas incorrectas no aporta
 * información nueva, sólo tiempo de ejecución.
 */
test.describe('WEB-02 Login', () => {
  test(
    'credenciales válidas dan acceso al catálogo',
    { tag: ['@smoke', '@regression', '@p0'] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.open();
      await loginPage.loginAs(users.standard);

      await inventoryPage.expectLoaded();
      await expect(inventoryPage.items).toHaveCount(6);
    },
  );

  for (const scenario of invalidLogins) {
    test(
      `login rechazado: ${scenario.id}`,
      { tag: ['@regression', '@p0'] },
      async ({ loginPage, page }) => {
        await loginPage.open();
        await loginPage.login(scenario.username, scenario.password);

        await loginPage.expectError(scenario.expectedError);
        expect(page.url(), 'no debe navegar al catálogo').not.toContain(
          '/inventory.html',
        );
      },
    );
  }
});
