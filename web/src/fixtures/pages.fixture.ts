import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { InventoryPage } from '@pages/inventory.page';
import { ProductDetailPage } from '@pages/product-detail.page';
import { CartPage } from '@pages/cart.page';
import { CheckoutInformationPage } from '@pages/checkout-information.page';
import { CheckoutOverviewPage } from '@pages/checkout-overview.page';
import { CheckoutCompletePage } from '@pages/checkout-complete.page';
import { seedSession } from '@utils/session';
import { users } from '@data/users';
import { Product } from '@data/products';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Deja la sesión iniciada (sin pasar por la UI) y opcionalmente siembra el carrito. */
  loggedIn: (options?: { username?: string; cart?: ReadonlyArray<Product> }) => Promise<void>;
};

/**
 * Fixtures: inyección de dependencias del framework.
 *
 * Ventajas frente a instanciar los Page Objects en cada test:
 *  - el test declara sólo lo que necesita (menos ruido, mejor legibilidad),
 *  - Playwright gestiona el ciclo de vida y el aislamiento por test,
 *  - añadir una página nueva no obliga a tocar los tests existentes.
 */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInformationPage: async ({ page }, use) => use(new CheckoutInformationPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  loggedIn: async ({ page }, use) => {
    await use(async (options) => {
      await seedSession(
        page,
        options?.username ?? users.standard.username,
        options?.cart ?? [],
      );
    });
  },
});

export { expect } from '@playwright/test';
