import { test, expect } from '@fixtures/pages.fixture';
import { allProducts } from '@data/products';
import type { SortOption } from '@pages/inventory.page';

/**
 * WEB-05 | P2 | Ordenamiento del catálogo.
 * Riesgo: un orden incorrecto no bloquea la venta, pero degrada la conversión.
 * Se automatiza porque la verificación es puramente algorítmica (barata y estable)
 * y porque el propio test calcula el resultado esperado a partir de los datos,
 * en lugar de fijar una lista literal que se rompería al cambiar el catálogo.
 */
const cases: ReadonlyArray<{ option: SortOption; description: string }> = [
  { option: 'az', description: 'nombre A-Z' },
  { option: 'za', description: 'nombre Z-A' },
  { option: 'lohi', description: 'precio ascendente' },
  { option: 'hilo', description: 'precio descendente' },
];

test.describe('WEB-05 Ordenamiento de productos', () => {
  for (const { option, description } of cases) {
    test(
      `ordena por ${description}`,
      { tag: ['@regression', '@p2'] },
      async ({ loggedIn, inventoryPage }) => {
        await loggedIn();
        await inventoryPage.open();

        await inventoryPage.sortBy(option);

        if (option === 'az' || option === 'za') {
          const expected = allProducts
            .map((product) => product.name)
            .sort((a, b) => a.localeCompare(b));
          if (option === 'za') expected.reverse();
          expect(await inventoryPage.productNames()).toEqual(expected);
        } else {
          const expected = allProducts
            .map((product) => product.price)
            .sort((a, b) => a - b);
          if (option === 'hilo') expected.reverse();
          expect(await inventoryPage.productPrices()).toEqual(expected);
        }
      },
    );
  }
});
