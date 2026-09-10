import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';

/** Pantalla final de confirmación del pedido. */
class CheckoutCompleteScreen extends BaseScreen {
  constructor() {
    super(by.id('completeTV'));
  }

  get title(): ChainablePromiseElement {
    return $(by.id('completeTV'));
  }

  get thankYouMessage(): ChainablePromiseElement {
    return $(by.id('thankYouTV'));
  }

  get continueShoppingButton(): ChainablePromiseElement {
    return $(by.id('shoopingBt'));
  }
}

export default new CheckoutCompleteScreen();
