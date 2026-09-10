/**
 * Configuración por entorno.
 *
 * Ningún dato sensible se versiona: las credenciales de SauceDemo son públicas y
 * están documentadas en la propia página de login, pero aun así se leen de
 * variables de entorno para que el patrón sea correcto en un proyecto real
 * (en CI llegarían desde GitHub Secrets).
 */
export const env = {
  baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  password: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  /** Impuesto aplicado por el e-commerce sobre el subtotal (regla de negocio). */
  taxRate: Number(process.env.TAX_RATE ?? 0.08),
} as const;
