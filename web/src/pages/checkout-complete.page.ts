import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';

export class CheckoutCompletePage extends BasePage {
  readonly header: HeaderComponent;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(
      page,
      '/checkout-complete.html',
      page.getByTestId('checkout-complete-container'),
    );
    this.header = new HeaderComponent(page);
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }
}
