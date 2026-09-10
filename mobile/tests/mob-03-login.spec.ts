import { expect } from '@wdio/globals';
import LoginScreen from '@screens/login.screen';
import MenuScreen from '@screens/menu.screen';
import ProductsScreen from '@screens/products.screen';
import { invalidLogins, users } from '@data/users';

/**
 * MOB-03 | P1 | Autenticación.
 * Técnica: partición de equivalencia + Data Driven Testing.
 * Se automatiza porque es la puerta de entrada al checkout (MOB-01 depende de ella).
 */
describe('MOB-03 Login @regression @p1', () => {
  beforeEach(async () => {
    // La precondición de este escenario es la pantalla de login, no el
    // catálogo: tras un caso de login fallido la app se queda en el propio
    // formulario, y esperar el catálogo introducía una dependencia falsa
    // entre casos.
    await MenuScreen.resetAppState();
    await MenuScreen.openLogin();
    await LoginScreen.waitForDisplayed();
  });

  it('un usuario válido inicia sesión correctamente @smoke', async () => {
    await LoginScreen.loginAs(users.standard);

    await ProductsScreen.waitForDisplayed();
    expect(await ProductsScreen.isDisplayed()).toBe(true);
  });

  for (const scenario of invalidLogins) {
    it(`rechaza el login: ${scenario.id}`, async () => {
      await LoginScreen.login(scenario.username, scenario.password);

      const error = LoginScreen.errorFor(scenario.field);
      await error.waitForDisplayed({ timeout: 10_000 });
      expect(await error.getText()).toContain(scenario.expectedError);
    });
  }

  /**
   * HALLAZGO BUG-MOB-01: la aplicación no valida las credenciales. Cualquier
   * usuario distinto de `alice@example.com` con cualquier contraseña entra.
   * El test asevera el comportamiento REAL para que actúe como detector de
   * cambio: cuando se implemente la validación, este test fallará y obligará
   * a revisar el escenario (y a cerrar el defecto).
   */
  it('acepta credenciales arbitrarias @known-issue @p0 @security', async () => {
    await LoginScreen.login('cualquiera@example.com', 'contrasena-inventada');

    await ProductsScreen.waitForDisplayed();
    expect(await ProductsScreen.isDisplayed()).toBe(true);
  });
});
