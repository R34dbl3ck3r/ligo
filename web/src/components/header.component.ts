import { Page, Locator } from '@playwright/test';

/**
 * Cabecera común (carrito, menú lateral y título de sección).
 * Se modela como *componente* y no como página porque se reutiliza en varias
 * pantallas: evita duplicar localizadores en cada Page Object.
 */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly burgerButton: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    // El icono `data-test="open-menu"` está cubierto por el botón real del menú:
    // se usa el botón para evitar clicks interceptados (fuente típica de flakiness).
    this.burgerButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    this.title = page.getByTestId('title');
  }

  /** Cantidad de artículos en el carrito (0 cuando el badge no existe). */
  async cartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number((await this.cartBadge.innerText()).trim());
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.burgerButton.click();
    await this.logoutLink.click();
  }
}
