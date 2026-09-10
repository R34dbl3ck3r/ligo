/**
 * Screen Object base.
 *
 * Centraliza las esperas explícitas. En este framework está PROHIBIDO
 * `browser.pause()`: toda espera es condicional sobre el estado del elemento,
 * que es la principal medida anti-flakiness en mobile.
 */
export abstract class BaseScreen {
  protected constructor(private readonly rootSelector: string) {}

  get root(): ChainablePromiseElement {
    return $(this.rootSelector);
  }

  async waitForDisplayed(timeout = 20_000): Promise<void> {
    await this.root.waitForDisplayed({
      timeout,
      timeoutMsg: `La pantalla no se mostró: ${this.rootSelector}`,
    });
  }

  async isDisplayed(): Promise<boolean> {
    return this.root.isDisplayed();
  }

  protected async tap(element: ChainablePromiseElement): Promise<void> {
    await element.waitForDisplayed({ timeout: 15_000 });
    await element.waitForEnabled({ timeout: 15_000 });
    await element.click();
  }

  protected async type(
    element: ChainablePromiseElement,
    value: string,
  ): Promise<void> {
    await element.waitForDisplayed({ timeout: 15_000 });
    await element.clearValue();
    await element.setValue(value);
    // El teclado tapa elementos y provoca clicks interceptados: se cierra siempre.
    await this.hideKeyboardIfShown();
  }

  protected async hideKeyboardIfShown(): Promise<void> {
    if (await browser.isKeyboardShown()) {
      await browser.hideKeyboard();
    }
  }

  /** Scroll vertical dentro de la vista scrollable hasta un texto. */
  protected async scrollIntoView(text: string): Promise<void> {
    await $(
      'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
        `.scrollIntoView(new UiSelector().textContains("${text}"))`,
    );
  }
}
