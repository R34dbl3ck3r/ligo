import { expect } from '@wdio/globals';
import ProductsScreen from '@screens/products.screen';
import ProductDetailScreen from '@screens/product-detail.screen';
import CartScreen from '@screens/cart.screen';
import MenuScreen from '@screens/menu.screen';
import { products } from '@data/products';

/**
 * MOB-02 | P1 | Gestión del carrito.
 * Riesgo: el importe total o la cantidad no reflejan lo seleccionado.
 * Se verifica la aritmética del carrito, no sólo que "aparezca algo".
 */
describe('MOB-02 Carrito @regression @p1', () => {
  beforeEach(async () => {
    await MenuScreen.resetAppState();
    await ProductsScreen.waitForDisplayed();
  });

  it('el total refleja la cantidad seleccionada del producto', async () => {
    const product = products.onesie;
    const quantity = 3;

    await ProductsScreen.openProduct(product.name);
    await ProductDetailScreen.waitForDisplayed();
    await ProductDetailScreen.setQuantity(quantity);
    await ProductDetailScreen.addToCart();

    await ProductDetailScreen.openCart();
    await CartScreen.waitForDisplayed();

    expect(await CartScreen.itemCount()).toEqual(quantity);
    expect(await CartScreen.totalValue()).toEqual(
      Number((product.price * quantity).toFixed(2)),
    );
  });

  it('eliminar el único producto deja el carrito vacío', async () => {
    await ProductsScreen.openProduct(products.bikeLight.name);
    await ProductDetailScreen.waitForDisplayed();
    await ProductDetailScreen.addToCart();
    await ProductDetailScreen.openCart();
    await CartScreen.waitForDisplayed();

    await CartScreen.removeFirstItem();

    await expect(CartScreen.emptyCartMessage).toBeDisplayed();
    expect(await ProductsScreen.cartCount()).toEqual(0);
  });
});
