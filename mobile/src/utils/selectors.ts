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

  /**
   * resource-id del framework de Android (p. ej. `android:id/button1`, el botón
   * afirmativo de un AlertDialog). Se separa de `id()` porque no lleva el
   * package de la app: los diálogos del sistema no son parte de su namespace.
   */
  systemId: (fullResourceId: string): string => `id=${fullResourceId}`,

  /** Texto exacto visible; sólo para elementos sin id ni content-desc. */
  text: (value: string): string =>
    `android=new UiSelector().text("${value}")`,

  /**
   * Elemento con `resourceId` que vive en la MISMA celda que un texto dado.
   *
   * Es un XPath RELATIVO, anclado en el texto y de un solo salto al padre: no
   * el XPath por jerarquía completa que este proyecto prohíbe. Se usa porque
   * el catálogo es una rejilla y hace falta subir del título a su celda; la
   * alternativa de WebdriverIO (`parentElement()`) no sirve en Android, porque
   * se apoya en el ejecutor de JavaScript y UiAutomator2 no lo implementa.
   */
  cellSiblingOf: (text: string, resourceId: string): string =>
    `//*[@text="${text}"]/parent::*//*[@resource-id="${APP_PACKAGE}:id/${resourceId}"]`,

  /**
   * N-ésima aparición de un resource-id. Se usa para resolver la fila de una
   * lista: primero se localiza la posición por un dato estable (el título) y
   * después se actúa sobre el elemento clicable de esa misma fila. El índice
   * nunca se fija a mano en el test.
   */
  instanceOf: (resourceId: string, index: number): string =>
    `android=new UiSelector().resourceId("${APP_PACKAGE}:id/${resourceId}").instance(${index})`,

  /** Descendiente con un resource-id dentro de un contenedor por índice. */
  childOfIndex: (containerId: string, index: number, childId: string): string =>
    `android=new UiSelector().resourceId("${APP_PACKAGE}:id/${containerId}")` +
    `.childSelector(new UiSelector().resourceId("${APP_PACKAGE}:id/${childId}").instance(${index}))`,

  /**
   * Scroll DENTRO de un contenedor concreto hasta un texto exacto.
   *
   * Se prefiere a `scrollTo`, que busca `scrollable(true).instance(0)`: en una
   * pantalla con varios contenedores desplazables ese "primero" no tiene por
   * qué ser la lista que interesa, y el scroll se aplica al contenedor
   * equivocado sin dar error.
   */
  scrollInside: (containerId: string, text: string): string =>
    `android=new UiScrollable(new UiSelector().resourceId("${APP_PACKAGE}:id/${containerId}"))` +
    `.setMaxSearchSwipes(12).scrollIntoView(new UiSelector().text("${text}"))`,

  /** Scroll dentro de un contenedor hasta encontrar un texto. */
  scrollTo: (text: string): string =>
    'android=new UiScrollable(new UiSelector().scrollable(true))' +
    `.scrollIntoView(new UiSelector().textContains("${text}"))`,
} as const;

export const appPackage = APP_PACKAGE;
