# 4. Decisiones técnicas

> Punto evaluado: **apartado 6 del enunciado — las 10 preguntas, con ejemplos concretos de la solución**.

---

## 1. ¿Por qué seleccioné esos casos?

Los seleccioné por **riesgo de negocio**, no por facilidad de automatización. El
criterio operativo fue: *si esto falla en producción un lunes por la mañana, ¿qué pasa?*

- **Se detiene el ingreso** → P0. El flujo de compra (WEB-01, MOB-01) y el ciclo de
  vida de la reserva (API-06) son los tres escenarios que protegen la facturación.
- **Se cobra mal o se guardan datos incorrectos** → P0. De ahí que WEB-01 no se limite
  a "llegar a la confirmación": asevera `subtotal`, `impuesto = subtotal × 0.08` y
  `total = subtotal + impuesto`. Y de ahí WEB-07, que compara el precio del carrito
  contra el del resumen.
- **Se expone información o se permite lo que no se debe** → P0 aunque no sea camino
  feliz: WEB-06 (URLs protegidas) y los escenarios `@security` de API-04/API-05
  (escritura sin token).
- **Frecuencia de uso** → un fallo en el login (WEB-02, MOB-03) afecta al 100 % de los
  usuarios; uno en el ordenamiento (WEB-05) a una fracción pequeña. Por eso el primero
  es P0 y el segundo P2.

Y un criterio adicional muy práctico: **automaticé lo que un humano tendría que repetir
en cada release**. El flujo de compra se prueba en cada entrega; el enlace a LinkedIn del
footer, no.

---

## 2. ¿Qué decidí no automatizar?

Lo detallo en [`01-analisis-y-riesgos.md` §1.5](01-analisis-y-riesgos.md). En resumen:

| No automatizado | Motivo |
|---|---|
| Defectos visuales (`visual_user`, `problem_user`) | Una aserción funcional no detecta un problema de maquetación. Corresponde a *visual regression* con línea base versionada, no a un `expect` sobre un atributo |
| Rendimiento (`performance_glitch_user`) | Medir latencia dentro de un test E2E en CI produce falsos positivos por ruido de infraestructura |
| Las 8 combinaciones del formulario de checkout | La app valida secuencialmente: sólo 3 son observables. Las otras 5 costarían tiempo sin añadir información |
| Los 6 productos del catálogo | El comportamiento es idéntico; se usan 2-3 representativos |
| Biometría, QR, geolocalización, drawing (Mobile) | Demos de capacidades del dispositivo, ajenas al flujo de compra. Alto coste de mantenimiento, cero valor de negocio |
| Footer, redes sociales, "About" | Impacto de negocio marginal |

Un matiz: **"no automatizado" no es "no probado"**. Esas áreas se cubren con
exploratoria manual y con herramientas específicas; lo que hago es no meterlas en la
suite de regresión, donde sólo debe vivir aquello que aporta señal fiable.

---

## 3. ¿Qué patrón de automatización utilicé?

**Un patrón distinto por capa, elegido por el problema de cada una.** Forzar el mismo
patrón en las tres es el error más común.

### Web — Page Object Model + Fixtures + componentes

```
src/pages/       LoginPage, InventoryPage, CartPage, CheckoutInformationPage, …
src/components/  HeaderComponent  (reutilizado en varias páginas)
src/fixtures/    pages.fixture.ts (inyección de dependencias)
src/data/        users, products, checkout-data
src/utils/       session (siembra de estado), money (aritmética)
```

- **POM** porque el sistema es estable y orientado a pantallas: encapsular los
  localizadores en la página evita que un cambio de UI toque 25 tests.
- **`HeaderComponent` como componente y no como página**, porque la cabecera aparece en
  cinco pantallas: duplicar sus localizadores en cinco Page Objects sería el problema
  que el POM viene a resolver.
- **Fixtures** en lugar de instanciar páginas en cada test: el test declara sólo lo que
  necesita (`async ({ cartPage, checkoutOverviewPage })`) y Playwright gestiona el ciclo
  de vida. Añadir una página nueva no obliga a tocar ningún test existente.

**Por qué descarté Cucumber/Gherkin en Web:** aquí no hay stakeholders no técnicos
leyendo los escenarios. Gherkin habría añadido una capa de *step definitions* que
mantener a cambio de una legibilidad que ya consigo con `test.step()` y nombres
descriptivos —y que se ve tal cual en el reporte HTML de Playwright—. Gherkin es
excelente cuando **hay negocio leyendo**; aquí sólo habría sido ceremonia.

### API — Karate DSL, features + features auxiliares reutilizables

```
common/auth.feature            token compartido con `callonce`
common/create-booking.feature  precondición reutilizable
common/booking-builder.js      Test Data Builder (datos únicos)
common/basic-auth.js           helper de codificación
data/booking-schema.json       contrato
features/api-0X-*.feature      escenarios
```

Karate ya *es* un DSL: envolverlo en más capas es contraproducente. Lo que sí abstraje
fue lo que se repetía: obtención de token, creación de la precondición y generación de
datos.

### Mobile — Screen Object + estrategia de localizadores centralizada

```
src/screens/    ProductsScreen, ProductDetailScreen, CartScreen, CheckoutScreen, …
src/utils/      selectors.ts  (política de localizadores en un único sitio)
```

Los Screen Objects se exportan **ya instanciados** (`export default new ProductsScreen()`),
que es la convención de WebdriverIO y evita ruido en los tests. `BaseScreen` centraliza
las esperas explícitas: **`browser.pause()` está prohibido en este proyecto**.

---

## 4. ¿Cómo administré los datos?

Tres estrategias según la naturaleza del dato:

| Tipo de dato | Estrategia | Ejemplo |
|---|---|---|
| **Datos de referencia del sistema** (usuarios, catálogo) | Constantes tipadas fuera del test | `web/src/data/users.ts`, `products.ts` |
| **Datos de entrada del escenario** (particiones, tablas de decisión) | Colecciones que alimentan el DDT | `invalidLogins`, `checkoutValidationCases`, `Scenario Outline` en Karate |
| **Datos que se crean en el sistema** (reservas) | *Test Data Builder* con valores únicos por ejecución | `booking-builder.js`: `firstname: 'QA' + uuid` |

Decisiones concretas:

- **Nada de credenciales ni tokens en el repositorio.** Aunque las de SauceDemo y
  Restful Booker son públicas y están documentadas en las propias aplicaciones, se leen
  de variables de entorno (`SAUCE_PASSWORD`, `BOOKER_USERNAME`, `BOOKER_PASSWORD`,
  `MDA_PASSWORD`) con un valor por defecto público. En CI llegan desde *GitHub Secrets*.
- **Datos únicos, no aleatorios sin control.** El builder genera un sufijo UUID por
  reserva. Esto permite (a) ejecutar en paralelo contra un entorno compartido sin
  colisiones y (b) que el filtrado por nombre devuelva exactamente un resultado, lo que
  convierte una aserción débil en una fuerte (`match response == '#[1]'`).
- **No uso `faker` en los datos de aserción.** Datos aleatorios en el valor que se
  verifica hacen que un fallo sea difícil de reproducir. Aleatorizo la *identidad*
  (para el aislamiento), no el *comportamiento esperado*.
- **El oráculo se calcula, no se copia.** `expectedTax(subtotal, 0.08)` en lugar de
  `expect(tax).toBe(3.68)`.

---

## 5. ¿Cómo evité dependencias entre pruebas?

Regla del proyecto: **un test que necesita que otro se haya ejecutado antes no es un
test, es un paso.**

1. **Siembra de estado en lugar de encadenar por UI (Web).**
   `src/utils/session.ts` inyecta la cookie `session-username` y el `localStorage`
   `cart-contents` antes de cargar la página. Así, el test de validación del checkout
   arranca *ya* en el formulario, sin repetir login ni alta de productos:

   ```ts
   await loggedIn({ cart: [products.backpack] });
   await checkoutInformationPage.open();
   ```

   Efecto medible: la suite completa de 25 ejecuciones tarda **~38 s**. Encadenando por
   UI serían varios minutos.

2. **Cada escenario crea sus propios datos (API).**
   `create-booking.feature` se invoca como precondición; ningún escenario asume que
   existe la reserva de otro. Por eso la suite corre con `parallel(4)` sin interferencias.

3. **`callonce` sólo para lo idempotente.**
   El token se obtiene una vez por feature (rendimiento), pero eso no crea acoplamiento:
   ningún escenario depende del *resultado* de otro, sólo comparte un recurso de solo lectura.

4. **Estado limpio en cada test de Mobile.**
   `MenuScreen.resetAppState()` en el `beforeEach` devuelve la app a su estado inicial
   sin reinstalarla (mucho más rápido que `fullReset`).

5. **Aislamiento del navegador.** Playwright crea un contexto nuevo por test: cookies,
   almacenamiento y caché no se filtran entre pruebas. `fullyParallel: true`.

---

## 6. ¿Cómo controlaría pruebas *flaky*?

Mi postura de partida: **un test inestable es peor que no tener test**, porque enseña al
equipo a ignorar el rojo. El reintento es una red de seguridad, nunca la solución.

**Prevención (lo que ya está en el código):**

- **Cero esperas fijas.** Ni `waitForTimeout` ni `browser.pause()`. Todas las esperas
  son condiciones sobre el estado: `expect(locator).toBeVisible()`,
  `waitForDisplayed()`, `retry until` en Karate.
- **Aserciones *web-first*.** Playwright reintenta la aserción hasta el timeout, lo que
  absorbe la asincronía del render sin código extra.
- **Localizadores estables** (ver pregunta 7).
- **Independencia total** (pregunta 5): la mayor fuente de flakiness es el estado
  compartido.
- **Animaciones desactivadas en Android** (`disableWindowAnimation`, `disable-animations`
  en el workflow) y teclado cerrado tras cada `type()`: dos causas clásicas de *clicks*
  interceptados.
- **Un caso real de esta entrega:** el icono `data-test="open-menu"` de SauceDemo está
  cubierto por el botón real del menú y el click se interceptaba. La solución no fue
  reintentar, fue **cambiar el localizador** al elemento que de verdad recibe el evento
  (`#react-burger-menu-btn`), documentándolo en el código.

**Detección:**

- `retries: 1` **sólo en CI**, con `trace: 'on-first-retry'`. Un test que pasa en el
  reintento queda marcado como *flaky* en el reporte: no se oculta, se registra.
- Métrica de seguimiento: *flaky rate* semanal por test. Un test con >2 % de flakiness
  entra en cuarentena (etiqueta `@quarantine`, excluido del gate de PR pero ejecutado en
  nightly) con un ticket asociado y **fecha límite**: si no se arregla, se borra.

**Diagnóstico:** el `trace.zip` de Playwright (DOM, red, consola y vídeo paso a paso) y
la captura + log de Appium adjuntos al reporte Allure. Casi siempre el diagnóstico es
uno de estos tres: espera implícita, dato compartido o localizador dependiente de la
posición.

---

## 7. ¿Qué estrategia usé para los localizadores?

Una jerarquía explícita, aplicada igual en las tres capas: **cuanto más cerca del
contrato del producto, mejor; cuanto más cerca de la maquetación, peor.**

### Web

1. `data-test` (atributo de test que la aplicación expone y mantiene). Se configura
   globalmente:

   ```ts
   use: { testIdAttribute: 'data-test' }   // playwright.config.ts
   ```

   de modo que en el código se escribe `page.getByTestId('checkout')` y no un selector CSS.
2. Roles y texto accesible (`getByRole`) cuando no hay `data-test`.
3. CSS por `id` estable como último recurso, siempre comentado (el caso del menú).
4. **Prohibido:** XPath por jerarquía, clases de maquetación y selección por índice.

Un detalle de diseño: los botones del listado usan `add-to-cart-<slug>` mientras que en
la ficha de producto son `add-to-cart` a secas. Esa inconsistencia de la aplicación está
**absorbida dentro de los Page Objects**; los tests no la conocen.

### API

No hay localizadores, pero el principio equivalente es **verificar contra el contrato y
no contra la representación**: `match ... == schema` con marcadores de tipo, y JsonPath
para navegar la respuesta.

### Mobile — `src/utils/selectors.ts`

1. **`accessibility id`** (`~Displays all products of catalog`) — es el más estable,
   sobrevive a cambios de texto y de idioma, funciona igual en iOS y además **obliga a
   que la app sea accesible**.
2. **`resource-id`** (`id=com.saucelabs.mydemoapp.android:id/titleTV`) — único dentro
   de la app; se usa cuando no hay `content-desc`.
3. **`UiSelector`** por texto o para hacer scroll hasta un elemento — último recurso.
4. **Prohibido:** XPath por jerarquía completa (`//android.widget.LinearLayout[2]/...`),
   que se rompe con cualquier cambio de layout.

La política vive en **un solo archivo**, de modo que es auditable y se puede cambiar sin
tocar los Screen Objects.

---

## 8. ¿Qué ejecutaría como Smoke y qué como Regression?

Detallado en [`05-estrategia-ci-cd.md`](05-estrategia-ci-cd.md). En una frase:

| Etapa | Qué | Cuánto | Criterio |
|---|---|---|---|
| **Pull Request** | `@smoke` = los P0 del camino crítico (8 escenarios API, ~6 Web) + *type-check* | < 10 min | Lo que puede **bloquear un merge** |
| **Merge a `main`** | `@regression` completa de Web y API en Chromium | < 25 min | Lo que detecta **regresiones reales** |
| **Nightly** | Todo: Web en 3 navegadores/viewports, API completa y **Mobile en emulador** | ~45 min | Lo que es **caro o dependiente de infraestructura** |

Las etiquetas ya están en el código, así que la selección es una opción de línea de
comandos, no una lista mantenida a mano:

```bash
npm run test:smoke                          # Playwright --grep @smoke
mvn test -Dkarate.options="--tags @smoke"   # Karate
```

**Por qué Mobile no está en el PR:** un emulador tarda ~5 minutos en arrancar y es la
parte más frágil del pipeline. Bloquear cada PR con eso genera *builds* rojos que nadie
cree. Va en nightly, y si el equipo lo necesita antes, se lanza a demanda
(`workflow_dispatch`).

---

## 9. ¿Cómo escalaría el framework?

**Ya está preparado para escalar en estos ejes:**

| Eje | Cómo | Evidencia en el repositorio |
|---|---|---|
| **Más entornos** | Todo parametrizado por variable de entorno | `BASE_URL`, `karate.env`, `booker.baseUrl` |
| **Más navegadores/dispositivos** | Proyectos de Playwright y configuraciones WDIO | 3 `projects`; `wdio.android.cloud.conf.ts` listo para Sauce Labs |
| **Más casos** | Añadir un dato, no un test | `Scenario Outline` y arrays de casos |
| **Más gente** | Estructura por capas y responsabilidades | Un cambio de UI toca un Page Object; los tests no se tocan |
| **Paralelismo** | Ya activo | `fullyParallel: true`, `parallel(4)` en Karate |

**Lo siguiente si el proyecto creciera:**

1. **Extraer un paquete común** (`@aybarcorp/qa-core`) con utilidades compartidas
   —logging, generación de datos, clientes HTTP— y versionarlo.
2. **Sharding en CI:** `--shard=1/4` en Playwright y matriz de GitHub Actions para bajar
   de 25 a ~7 minutos.
3. **Granja de dispositivos** para Mobile: la configuración ya existe; sólo hay que
   conectar credenciales y definir la matriz de dispositivos por cuota de mercado real.
4. **Reporte unificado de las tres capas** (Allure con histórico) para poder responder a
   "¿mejoramos respecto al sprint pasado?" con datos.
5. **Sembrado de datos por API en la capa Web:** hoy siembro el estado por cookie; si el
   e-commerce real tuviera API, la precondición se crearía por API, que es aún más rápido
   y más fiable.
6. **Contract testing** (Pact) entre el front y la API de reservas, para detectar roturas
   de contrato antes de llegar a E2E.

---

## 10. ¿Qué mejoraría en una V2?

Ordenado por relación valor/esfuerzo:

1. **Regresión visual** en Web y Mobile con línea base versionada. Cubre R-W9, hoy el
   hueco más grande de la cobertura.
2. **Reporte unificado con histórico** (Allure + tendencias): estabilidad por test,
   duración y *flaky rate*, publicado en GitHub Pages tras cada nightly.
3. **Sharding y paralelismo real en CI** para bajar el tiempo de la regresión a la mitad.
4. **Cuarentena automatizada:** un test que falla de forma intermitente se etiqueta solo
   y abre un ticket, en lugar de depender de que alguien lo note.
5. **Pruebas de accesibilidad** (axe-core integrado en Playwright): coste marginal,
   alto valor de cumplimiento.
6. **Datos por API en Mobile:** hoy el `beforeEach` recorre UI para dejar el estado; con
   *deep links* (`adb shell am start -d ...`) se saltaría directamente a la pantalla bajo
   prueba, reduciendo tiempo y flakiness.
7. **Ejecución selectiva por impacto:** analizar qué cambió en el PR y ejecutar sólo los
   tests relacionados, en lugar de todo el smoke.
8. **Monitorización sintética:** ejecutar el smoke de producción cada hora con alerta a
   Slack. Convierte la suite de regresión en observabilidad de negocio.
