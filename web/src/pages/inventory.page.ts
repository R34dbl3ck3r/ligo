import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';
import { Product } from '@data/products';
import { toAmount } from '@utils/money';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly header: HeaderComponent;
  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page, '/inventory.html', page.getByTestId('inventory-list'));
    this.header = new HeaderComponent(page);
    this.items = page.getByTestId('inventory-item');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  /**
   * Localizador dinámico por slug de producto. Se prefiere el `data-test`
   * específico (`add-to-cart-<slug>`) frente a recorrer la lista y hacer click
   * por índice: el índice cambia al ordenar y genera pruebas frágiles.
   */
  addToCartButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${product.slug}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async addToCart(...productList: Product[]): Promise<void> {
    for (const product of productList) {
      await this.addToCartButton(product).click();
      await expect(this.removeButton(product)).toBeVisible();
    }
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.removeButton(product).click();
    await expect(this.addToCartButton(product)).toBeVisible();
  }

  async openProductDetail(product: Product): Promise<void> {
    await this.page
      .getByTestId('inventory-item-name')
      .filter({ hasText: product.name })
      .first()
      .click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async productNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    const texts = await this.page.getByTestId('inventory-item-price').allInnerTexts();
    return texts.map(toAmount);
  }
}
