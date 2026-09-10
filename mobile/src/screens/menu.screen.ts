import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';

export type MenuOption =
  | 'Catalog'
  | 'Webview'
  | 'QR Code Scanner'
  | 'Geo Location'
  | 'Drawing'
  | 'About'
  | 'Reset App State'
  | 'Biometrics'
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
   * Deja la app en estado limpio sin reinstalarla: es mucho más rápido que
   * `fullReset` y suficiente para aislar tests dentro de una misma sesión.
   */
  async resetAppState(): Promise<void> {
    await this.open();
    await this.select('Reset App State');
  }
}

export default new MenuScreen();
