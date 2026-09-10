import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';

/**
 * Opciones del menú lateral, verificadas contra la app 2.2.0 (versionCode 25)
 * volcando la jerarquía real con `uiautomator dump`. Los textos que asumía una
 * versión anterior ('Webview', 'Biometrics') no existen: son 'WebView' y
 * 'FingerPrint'.
 */
export type MenuOption =
  | 'Catalog'
  | 'WebView'
  | 'QR Code Scanner'
  | 'Geo Location'
  | 'Drawing'
  | 'About'
  | 'Reset App State'
  | 'FingerPrint'
  | 'Virtual USB'
  | 'Log In'
  | 'Log Out';

/** Menú lateral. Incluye "Reset App State", clave para el aislamiento. */
class MenuScreen extends BaseScreen {
  constructor() {
    super(by.id('menuRV'));
  }

  get openMenuButton(): ChainablePromiseElement {
    return $(by.accessibility('View menu'));
  }

  async open(): Promise<void> {
    await this.tap(this.openMenuButton);
    await this.waitForDisplayed();
  }

  async select(option: MenuOption): Promise<void> {
    await this.tap($(by.text(option)));
  }

  /**
   * Abre la pantalla de login desde el menú.
   *
   * `Reset App State` limpia el carrito pero NO cierra la sesión: si un test
   * anterior inició sesión, el menú muestra 'Log Out' y 'Log In' no existe.
   * Esta precondición deja siempre la app en el mismo punto de partida, que es
   * lo que hace que los tests puedan ejecutarse en cualquier orden.
   */
  async openLogin(): Promise<void> {
    await this.open();

    const logOut = $(by.text('Log Out'));
    if (await logOut.isExisting()) {
      await this.tap(logOut);
      // Algunos flujos de cierre de sesión piden confirmación.
      if (await this.dialogButton.isExisting()) {
        await this.tap(this.dialogButton);
        await this.dialogButton.waitForExist({ reverse: true, timeout: 10_000 });
      }
      await this.open();
    }

    await this.select('Log In');
  }

  /**
   * Botón afirmativo del AlertDialog. Los dos diálogos del reset comparten este
   * id del framework, así que se distinguen por su texto, no por el localizador.
   */
  get dialogButton(): ChainablePromiseElement {
    return $(by.systemId('android:id/button1'));
  }

  /**
   * Deja la app en estado limpio sin reinstalarla: es mucho más rápido que
   * `fullReset` y suficiente para aislar tests dentro de una misma sesión.
   *
   * La opción del menú no resetea directamente: encadena DOS diálogos.
   *   1. Confirmación  'Are you sure you want to Reset the App'  -> RESET APP
   *   2. Acuse         'App State has been reset.'              -> OK
   * Ambos usan `android:id/button1`, por lo que esperar a que "el botón
   * desaparezca" tras el primer tap falla: el segundo diálogo ya lo ha
   * reutilizado. Se espera al cambio de texto del botón, que es el único
   * estado que distingue un diálogo del otro.
   */
  async resetAppState(): Promise<void> {
    await this.open();
    await this.select('Reset App State');

    await this.tap(this.dialogButton);
    await browser.waitUntil(
      async () => (await this.dialogButton.getText()).trim().toUpperCase() === 'OK',
      {
        timeout: 10_000,
        timeoutMsg: 'No apareció el acuse de reset con el botón OK',
      },
    );

    await this.tap(this.dialogButton);
    await this.dialogButton.waitForExist({ reverse: true, timeout: 10_000 });
  }
}

export default new MenuScreen();
