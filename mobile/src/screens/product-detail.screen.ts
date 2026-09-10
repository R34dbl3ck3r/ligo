import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';

/** Ficha de producto: color, cantidad y alta en el carrito. */
class ProductDetailScreen extends BaseScreen {
  constructor() {
    super(by.accessibility('Displays selected product'));
  }

  get title(): ChainablePromiseElement {
    return $(by.id('productTV'));
  }

  get price(): ChainablePromiseElement {
    return $(by.id('priceTV'));
  }

  get quantity(): ChainablePromiseElement {
    return $(by.id('noTV'));
  }

  get increaseQuantityButton(): ChainablePromiseElement {
    return $(by.accessibility('Increase item quantity'));
  }

  get decreaseQuantityButton(): ChainablePromiseElement {
    return $(by.accessibility('Decrease item quantity'));
  }

  get addToCartButton(): ChainablePromiseElement {
    return $(by.accessibility('Tap to add product to cart'));
  }

  get cartBadge(): ChainablePromiseElement {
    return $(by.id('cartTV'));
  }

  async priceValue(): Promise<number> {
    return Number((await this.price.getText()).replace(/[^\d.]/g, ''));
  }

  async setQuantity(target: number): Promise<void> {
    let current = Number(await this.quantity.getText());
    while (current < target) {
      await this.tap(this.increaseQuantityButton);
      current = Number(await this.quantity.getText());
    }
  }

  async addToCart(): Promise<void> {
    await this.scrollIntoView('Add to cart');
    await this.tap(this.addToCartButton);
  }

  async openCart(): Promise<void> {
    await this.tap($(by.accessibility('View cart')));
  }
}

export default new ProductDetailScreen();
