/**
 * Catálogo del e-commerce. El `id` corresponde al índice interno que la
 * aplicación guarda en la cookie `cart-contents`, lo que permite sembrar
 * el estado del carrito sin pasar por la UI (ver `src/utils/session.ts`).
 */
export type Product = {
  id: number;
  name: string;
  price: number;
  /** Slug usado por los data-test de añadir/quitar del carrito. */
  slug: string;
};

export const products = {
  bikeLight: {
    id: 0,
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    slug: 'sauce-labs-bike-light',
  },
  boltTShirt: {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    slug: 'sauce-labs-bolt-t-shirt',
  },
  onesie: {
    id: 2,
    name: 'Sauce Labs Onesie',
    price: 7.99,
    slug: 'sauce-labs-onesie',
  },
  redTShirt: {
    id: 3,
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    slug: 'test.allthethings()-t-shirt-(red)',
  },
  backpack: {
    id: 4,
    name: 'Sauce Labs Backpack',
    price: 29.99,
    slug: 'sauce-labs-backpack',
  },
  fleeceJacket: {
    id: 5,
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    slug: 'sauce-labs-fleece-jacket',
  },
} as const satisfies Record<string, Product>;

export const allProducts: ReadonlyArray<Product> = Object.values(products);
