const APP_PACKAGE = 'com.saucelabs.mydemoapp.android';

/**
 * Estrategia de localizadores (ver docs/04-decisiones-tecnicas.md).
 *
 * Orden de preferencia:
 *   1. accessibility id  -> content-desc. Es el localizador más estable y además
 *      obliga a que la app sea accesible; funciona igual en iOS.
 *   2. resource-id       -> único dentro de la app, resistente a cambios de texto
 *      e idioma. Se usa cuando no hay content-desc.
 *   3. UiSelector/XPath  -> último recurso (texto visible, scroll a un elemento).
 *      El XPath por jerarquía completa está prohibido en este proyecto.
 *
 * Los localizadores se declaran mediante estas funciones para que la estrategia
 * sea explícita y auditable en cada Screen Object.
 */
export const by = {
  /** content-desc (accessibility id). */
  accessibility: (id: string): string => `~${id}`,

  /** resource-id completo de la aplicación. */
  id: (resourceId: string): string => `id=${APP_PACKAGE}:id/${resourceId}`,

  /** Texto exacto visible; sólo para elementos sin id ni content-desc. */
  text: (value: string): string =>
    `android=new UiSelector().text("${value}")`,

  /** Descendiente con un resource-id dentro de un contenedor por índice. */
  childOfIndex: (containerId: string, index: number, childId: string): string =>
    `android=new UiSelector().resourceId("${APP_PACKAGE}:id/${containerId}")` +
    `.childSelector(new UiSelector().resourceId("${APP_PACKAGE}:id/${childId}").instance(${index}))`,

  /** Scroll dentro de un contenedor hasta encontrar un texto. */
  scrollTo: (text: string): string =>
    'android=new UiScrollable(new UiSelector().scrollable(true))' +
    `.scrollIntoView(new UiSelector().textContains("${text}"))`,
} as const;

export const appPackage = APP_PACKAGE;
