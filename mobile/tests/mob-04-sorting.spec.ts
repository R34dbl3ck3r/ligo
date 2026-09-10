import { expect } from '@wdio/globals';
import ProductsScreen from '@screens/products.screen';
import MenuScreen from '@screens/menu.screen';

/**
 * MOB-04 | P2 | Ordenamiento del catálogo.
 * Verificación algorítmica: el resultado esperado se calcula a partir de lo
 * que muestra la propia app, no de una lista fija que se rompería al cambiar
 * el catálogo.
 */
describe('MOB-04 Ordenamiento @regression @p2', () => {
  beforeEach(async () => {
    await MenuScreen.resetAppState();
    await ProductsScreen.waitForDisplayed();
  });

  it('ordena por precio ascendente', async () => {
    await ProductsScreen.sortBy('Price - Ascending');

    const prices = await ProductsScreen.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('ordena por precio descendente', async () => {
    await ProductsScreen.sortBy('Price - Descending');

    const prices = await ProductsScreen.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('ordena por nombre ascendente', async () => {
    await ProductsScreen.sortBy('Name - Ascending');

    const titles = await ProductsScreen.titles();
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });
});
