import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';
import { ShippingInfo, PaymentInfo } from '@data/checkout';

/** Datos de envío -> datos de pago -> revisión -> confirmación. */
class CheckoutScreen extends BaseScreen {
  constructor() {
    super(by.id('fullNameET'));
  }

  // --- Paso 1: dirección de envío
  get fullNameInput(): ChainablePromiseElement {
    return $(by.id('fullNameET'));
  }
  get address1Input(): ChainablePromiseElement {
    return $(by.id('address1ET'));
  }
  get cityInput(): ChainablePromiseElement {
    return $(by.id('cityET'));
  }
  get zipInput(): ChainablePromiseElement {
    return $(by.id('zipET'));
  }
  get countryInput(): ChainablePromiseElement {
    return $(by.id('countryET'));
  }
  get toPaymentButton(): ChainablePromiseElement {
    return $(by.accessibility('Saves user info for checkout'));
  }

  // --- Paso 2: pago
  get cardHolderInput(): ChainablePromiseElement {
    return $(by.id('nameET'));
  }
  get cardNumberInput(): ChainablePromiseElement {
    return $(by.id('cardNumberET'));
  }
  get expirationInput(): ChainablePromiseElement {
    return $(by.id('expirationDateET'));
  }
  get securityCodeInput(): ChainablePromiseElement {
    return $(by.id('securityCodeET'));
  }
  get reviewOrderButton(): ChainablePromiseElement {
    return $(by.accessibility('Saves payment info and launches screen to review checkout data'));
  }

  // --- Paso 3: revisión y confirmación
  get placeOrderButton(): ChainablePromiseElement {
    return $(by.accessibility('Completes the process of checkout'));
  }
  get totalAmount(): ChainablePromiseElement {
    return $(by.id('totalAmountTV'));
  }

  async fillShipping(info: ShippingInfo): Promise<void> {
    await this.type(this.fullNameInput, info.fullName);
    await this.type(this.address1Input, info.address);
    await this.type(this.cityInput, info.city);
    await this.type(this.zipInput, info.zipCode);
    await this.type(this.countryInput, info.country);
    await this.tap(this.toPaymentButton);
  }

  async fillPayment(info: PaymentInfo): Promise<void> {
    await this.type(this.cardHolderInput, info.cardHolder);
    await this.type(this.cardNumberInput, info.cardNumber);
    await this.type(this.expirationInput, info.expiration);
    await this.type(this.securityCodeInput, info.securityCode);
    await this.tap(this.reviewOrderButton);
  }

  async placeOrder(): Promise<void> {
    await this.scrollIntoView('Place Order');
    await this.tap(this.placeOrderButton);
  }

  async totalValue(): Promise<number> {
    return Number((await this.totalAmount.getText()).replace(/[^\d.]/g, ''));
  }
}

export default new CheckoutScreen();
