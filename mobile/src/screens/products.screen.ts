import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';

export type SortOption =
  | 'Name - Ascending'
  | 'Name - Descending'
  | 'Price - Ascending'
  | 'Price - Descending';

/**
 * Catálogo de productos (pantalla inicial de la app).
 */
class ProductsScreen extends BaseScreen {
  constructor() {
    super(by.accessibility('Displays all products of catalog'));
  }

  get cartButton(): ChainablePromiseElement {
    return $(by.accessibility('View cart'));
  }

  get cartBadge(): ChainablePromiseElement {
    return $(by.id('cartTV'));
  }

  get menuButton(): ChainablePromiseElement {
    return $(by.accessibility('View menu'));
  }

  get sortButton(): ChainablePromiseElement {
    return $(by.accessibility('Shows current sorting order and displays available sorting options'));
  }

  get productTitles(): ChainablePromiseArray {
    return $$(by.id('titleTV'));
  }

  get productPrices(): ChainablePromiseArray {
    return $$(by.id('priceTV'));
  }

  productByName(name: string): ChainablePromiseElement {
    return $(by.text(name));
  }

  /**
   * Abre la ficha de un producto.
   *
   * Dos hechos de la app, verificados volcando la jerarquía real con
   * `uiautomator dump`, condicionan esta implementación:
   *
   *  1. El catálogo es una REJILLA de dos columnas, no una lista: dos productos
   *     comparten coordenada vertical. Emparejar por índice las listas de
   *     títulos e imágenes es frágil, porque una celda parcialmente visible
   *     aporta imagen pero todavía no título.
   *  2. El título (`titleTV`) NO es clicable. El único elemento clicable de la
   *     celda es la imagen (`productIV`).
   *
   * Se sube del título a su celda y se pulsa la imagen de esa celda, de modo
   * que el test nombra el producto y nunca una posición ni una coordenada.
   */
  async openProduct(name: string): Promise<void> {
    await this.scrollIntoViewInside('productRV', name);
    await this.tap($(by.cellSiblingOf(name, 'productIV')));
  }

  async openCart(): Promise<void> {
    await this.tap(this.cartButton);
  }

  /** 0 cuando el badge no está presente (carrito vacío). */
  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isExisting())) return 0;
    return Number((await this.cartBadge.getText()).trim());
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.tap(this.sortButton);
    await this.tap($(by.text(option)));
  }

  async prices(): Promise<number[]> {
    const texts = await this.productPrices.map((element) => element.getText());
    return texts.map((text) => Number(text.replace(/[^\d.]/g, '')));
  }

  async titles(): Promise<string[]> {
    return this.productTitles.map((element) => element.getText());
  }
}

export default new ProductsScreen();
