import { Page, Locator, expect } from '@playwright/test';

/**
 * Página base del Page Object Model.
 *
 * Responsabilidades:
 *  - exponer `page` y helpers comunes a todas las páginas,
 *  - centralizar la navegación y la verificación de "página cargada".
 *
 * Lo que NO hace: assertions de negocio. Las aserciones viven en los tests,
 * salvo las de sincronización (`expectLoaded`), que son parte del contrato de
 * la página y evitan esperas duplicadas en cada test.
 */
export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    /** Ruta relativa al baseURL. */
    protected readonly path: string,
    /** Elemento raíz que confirma que la página está renderizada. */
    protected readonly rootLocator: Locator,
  ) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.expectLoaded();
  }

  /** Espera basada en estado (web-first assertion), nunca `waitForTimeout`. */
  async expectLoaded(): Promise<void> {
    await expect(this.rootLocator).toBeVisible();
  }

  get url(): string {
    return this.page.url();
  }
}
