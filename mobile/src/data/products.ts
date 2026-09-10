export type MobileProduct = {
  name: string;
  price: number;
};

/** Catálogo de My Demo App usado en los escenarios. */
export const products = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
} as const satisfies Record<string, MobileProduct>;
