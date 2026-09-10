import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';

/** Carrito de compra. */
class CartScreen extends BaseScreen {
  constructor() {
    super(by.accessibility('Displays list of selected products'));
  }

  get itemTitles(): ChainablePromiseArray {
    return $$(by.id('titleTV'));
  }

  get itemPrices(): ChainablePromiseArray {
    return $$(by.id('priceTV'));
  }

  get totalPrice(): ChainablePromiseElement {
    return $(by.id('totalPriceTV'));
  }

  get totalItems(): ChainablePromiseElement {
    return $(by.id('itemsTV'));
  }

  get proceedToCheckoutButton(): ChainablePromiseElement {
    return $(by.accessibility('Confirms products for checkout'));
  }

  get emptyCartMessage(): ChainablePromiseElement {
    return $(by.id('noItemTitleTV'));
  }

  removeButtonAt(index = 0): ChainablePromiseElement {
    return $$(by.accessibility('Removes product from cart'))[index];
  }

  async titles(): Promise<string[]> {
    return this.itemTitles.map((element) => element.getText());
  }

  async totalValue(): Promise<number> {
    return Number((await this.totalPrice.getText()).replace(/[^\d.]/g, ''));
  }

  async itemCount(): Promise<number> {
    return Number((await this.totalItems.getText()).replace(/\D/g, ''));
  }

  async removeFirstItem(): Promise<void> {
    await this.tap(this.removeButtonAt(0));
  }

  async proceedToCheckout(): Promise<void> {
    await this.tap(this.proceedToCheckoutButton);
  }
}

export default new CartScreen();
