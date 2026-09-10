import { expect } from '@wdio/globals';
import ProductsScreen from '@screens/products.screen';
import ProductDetailScreen from '@screens/product-detail.screen';
import CartScreen from '@screens/cart.screen';
import CheckoutScreen from '@screens/checkout.screen';
import CheckoutCompleteScreen from '@screens/checkout-complete.screen';
import LoginScreen from '@screens/login.screen';
import MenuScreen from '@screens/menu.screen';
import { products } from '@data/products';
import { users } from '@data/users';
import { validShipping, validPayment } from '@data/checkout';

/**
 * MOB-01 | P0 | Flujo funcional principal:
 * Productos -> Detalle -> Carrito -> Checkout -> Confirmación.
 *
 * Es el escenario de mayor valor: cubre la operación que genera ingreso y
 * atraviesa todas las pantallas críticas de la aplicación.
 */
describe('MOB-01 Compra completa @smoke @regression @p0', () => {
  beforeEach(async () => {
    await MenuScreen.resetAppState();
    await ProductsScreen.waitForDisplayed();
  });

  it('permite comprar un producto y muestra la confirmación del pedido', async () => {
    const product = products.backpack;

    await ProductsScreen.openProduct(product.name);
    await ProductDetailScreen.waitForDisplayed();
    expect(await ProductDetailScreen.priceValue()).toEqual(product.price);

    await ProductDetailScreen.addToCart();
    expect(await ProductDetailScreen.cartBadge.getText()).toEqual('1');

    await ProductDetailScreen.openCart();
    await CartScreen.waitForDisplayed();
    expect(await CartScreen.titles()).toContain(product.name);
    expect(await CartScreen.totalValue()).toEqual(product.price);

    await CartScreen.proceedToCheckout();

    // La app exige sesión iniciada para completar el checkout
    await LoginScreen.waitForDisplayed();
    await LoginScreen.loginAs(users.standard);

    await CheckoutScreen.waitForDisplayed();
    await CheckoutScreen.fillShipping(validShipping);
    await CheckoutScreen.fillPayment(validPayment);

    expect(await CheckoutScreen.totalValue()).toBeGreaterThanOrEqual(product.price);
    await CheckoutScreen.placeOrder();

    await CheckoutCompleteScreen.waitForDisplayed();
    expect(await CheckoutCompleteScreen.title.getText()).toContain('Checkout Complete');
  });
});
