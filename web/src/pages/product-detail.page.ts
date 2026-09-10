import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';
import { Product } from '@data/products';
import { toAmount } from '@utils/money';

export class ProductDetailPage extends BasePage {
  readonly header: HeaderComponent;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly backButton: Locator;
  /**
   * En la ficha de producto la aplicación expone `data-test="add-to-cart"` /
   * `"remove"` sin el slug del producto (a diferencia del listado, donde sí lo
   * lleva). Esa diferencia se aísla aquí para que los tests no la conozcan.
   */
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page) {
    super(page, '/inventory-item.html', page.getByTestId('inventory-item-name'));
    this.header = new HeaderComponent(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.backButton = page.getByTestId('back-to-products');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
  }

  /** Navegación directa a la ficha (deep link) sin pasar por el listado. */
  async openById(product: Product): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${product.id}`);
    await this.expectLoaded();
  }

  async priceValue(): Promise<number> {
    return toAmount(await this.price.innerText());
  }
}
