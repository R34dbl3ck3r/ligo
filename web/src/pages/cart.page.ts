import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';
import { Product } from '@data/products';
import { toAmount } from '@utils/money';

export class CartPage extends BasePage {
  readonly header: HeaderComponent;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page, '/cart.html', page.getByTestId('cart-contents-container'));
    this.header = new HeaderComponent(page);
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  itemByName(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.page.getByTestId(`remove-${product.slug}`).click();
  }

  async itemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts();
  }

  async subtotalFromItems(): Promise<number> {
    const prices = await this.page.getByTestId('inventory-item-price').allInnerTexts();
    return prices.map(toAmount).reduce((acc, price) => acc + price, 0);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
