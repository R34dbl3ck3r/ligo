import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { toAmount } from '@utils/money';

export class CheckoutOverviewPage extends BasePage {
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;

  constructor(page: Page) {
    super(
      page,
      '/checkout-step-two.html',
      page.getByTestId('checkout-summary-container'),
    );
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
  }

  async subtotal(): Promise<number> {
    return toAmount(await this.subtotalLabel.innerText());
  }

  async tax(): Promise<number> {
    return toAmount(await this.taxLabel.innerText());
  }

  async total(): Promise<number> {
    return toAmount(await this.totalLabel.innerText());
  }

  async itemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
