# Evidencias de ejecución

Ejecución del **9 de septiembre de 2026** contra los **entornos públicos reales**:
`https://www.saucedemo.com` y `https://restful-booker.herokuapp.com`.

| Suite | Casos | Resultado | Tiempo real | Entrada al reporte |
|---|---|---|---|---|
| **Web** · Playwright 1.56 · Chromium | 25 | ✅ **25/25** | 16.4 s | [`web/reports/playwright-html/index.html`](web/reports/playwright-html/index.html) |
| **API** · Karate 1.5.1 · 4 hilos | 31 | ✅ **31/31** | 7.7 s | [`api/reports/karate/karate-summary.html`](api/reports/karate/karate-summary.html) |
| **Mobile** · Appium + WDIO · emulador Pixel 6 | 11 | ⚠️ **9/11** | 3.0 min | [`mobile/reports/allure-report/index.html`](mobile/reports/allure-report/index.html) |

> Los reportes son HTML: ábrelos con doble clic o con
> `start evidence/api/reports/karate/karate-summary.html` (Windows).

---

## Web — SauceDemo · 25/25

| Archivo de pruebas | Casos | Tiempo | Qué demuestra |
|---|---|---|---|
| `web-01-checkout-e2e.spec.ts` | 1 | 4.6 s | Compra completa: login → catálogo → carrito → envío → resumen → confirmación, con subtotal, impuesto y total verificados |
| `web-02-login.spec.ts` | 6 | 23.3 s | Acceso válido + 5 particiones inválidas (usuario/password vacíos, inexistente, incorrecto, bloqueado) |
| `web-03-cart.spec.ts` | 3 | 14.3 s | Sincronía entre badge y contenido, persistencia al navegar, vaciado |
| `web-04-checkout-validation.spec.ts` | 5 | 23.1 s | Tabla de decisión de los 3 campos obligatorios + caso válido + cancelación |
| `web-05-inventory-sort.spec.ts` | 4 | 12.6 s | Ordenamiento por nombre (A-Z, Z-A) y precio (asc, desc) |
| `web-06-access-control.spec.ts` | 5 | 13.1 s | 4 rutas protegidas por URL directa sin sesión + invalidación tras logout |
| `web-07-problem-user-pricing.spec.ts` | 1 | 9.2 s | **Detecta BUG-WEB-01**: `problem_user` duplica precios en el resumen |

La suma de tiempos por archivo supera los 16.4 s de reloj porque los archivos corren en
paralelo (`fullyParallel: true`), cada uno en su propio worker.

**Sobre WEB-07:** está marcado con `test.fail()`. Se ejecuta, **se espera que falle** y
Playwright lo cuenta como *passed* porque falló como se declaró. Si algún día corrigen el
defecto, pasará "inesperadamente" y el pipeline avisará. No es un test desactivado.

### Capturas del flujo principal

`web/screenshots/`, una imagen por paso, tomadas del sitio público real:

| Imagen | Paso |
|---|---|
| `01-login.png` | Pantalla de acceso |
| `02-inventario.png` | Catálogo con los 6 productos |
| `03-carrito.png` | Carrito con Backpack + Bolt T-Shirt |
| `04-datos-envio.png` | Formulario de envío relleno |
| `05-resumen-importes.png` | **Item total $45.98 + Tax $3.68 = Total $49.66** |
| `06-confirmacion.png` | "Thank you for your order!" |

La captura 05 es la prueba visual de la regla de negocio: 29.99 + 15.99 = 45.98, y el
impuesto es el 8 % del subtotal.

---

## API — Restful Booker · 31/31

| Feature | Escenarios | Tiempo | Operación cubierta |
|---|---|---|---|
| API-01 · Autenticación | 5 | 4.36 s | `POST /auth` — token válido + 4 particiones inválidas |
| API-02 · Creación | 10 | 3.29 s | `POST /booking` — alta, contrato, campo opcional, obligatorios ausentes, valores límite |
| API-03 · Consulta | 5 | 2.57 s | `GET /booking` y `/booking/{id}` — listado, id, filtrado, 404, XML |
| API-04 · Actualización | 6 | 5.28 s | `PUT` y `PATCH` — total, parcial, sin token, Basic auth, payload incompleto |
| API-05 · Eliminación | 3 | 3.05 s | `DELETE` — sin token, con token, id inexistente |
| API-06 · Ciclo de vida | 1 | 2.45 s | auth → crear → consultar → listar → actualizar → eliminar → 404 |
| API-07 · Disponibilidad | 1 | 0.32 s | `GET /ping` — health check del entorno |

### Dónde se ve cada validación exigida

El reporte de Karate incluye **la petición y la respuesta completas de cada llamada**
(cabeceras, cuerpo y tiempo), así que cada validación es verificable abriendo el HTML:

| Validación | Dónde verla en el reporte |
|---|---|
| **HTTP status y headers** | `Then status` en todos los escenarios; `Content-Type` en el escenario XML de API-03 |
| **Contenido del response** | API-02: `match response.booking == payload` — la respuesta refleja lo enviado |
| **Schema / contrato** | API-02 y API-03 contra `booking-schema.json` (tipos y estructura, no valores) |
| **Reglas de negocio** | Campos obligatorios y `additionalneeds` opcional (API-02); autorización obligatoria para escritura (API-04, API-05) |
| **Persistencia** | API-04 y API-06 releen el recurso con un `GET` **independiente** tras cada escritura |

### Reportes complementarios

| Archivo | Para qué sirve |
|---|---|
| `karate-summary.html` | Resumen de la suite y punto de entrada |
| `karate-tags.html` | Resultados agrupados por etiqueta (`@smoke`, `@p0`, `@security`…) |
| `karate-timeline.html` | Línea de tiempo de los 4 hilos: muestra el paralelismo real |
| `src.test.java.booker.features.*.html` | Detalle petición/respuesta de cada escenario |

---

## Mobile — My Demo App 2.2.0 · 9/11

Ejecutado contra un **emulador real**: AVD Pixel 6, Android 13 (API 33), acelerado
por WHPX, con el APK de la release oficial (versionCode 25).

| Suite | Casos | Resultado | Qué cubre |
|---|---|---|---|
| MOB-01 · Compra completa | 1 | ✅ | Catálogo → ficha → carrito → login → envío → pago → confirmación |
| MOB-02 · Carrito | 2 | ❌ | Aritmética `total = precio × cantidad` y vaciado |
| MOB-03 · Login | 5 | ✅ | Usuario válido, 3 particiones inválidas y credenciales arbitrarias |
| MOB-04 · Ordenamiento | 3 | ✅ | Precio asc/desc y nombre asc, con oráculo calculado |

**MOB-01, el flujo P0, pasa**: es el escenario que pedía el enunciado
(«selecciona un flujo funcional relevante»).

**MOB-02 queda abierto.** Abre un producto que exige desplazar el catálogo y la
ficha no llega a abrirse; el segundo caso cae en cascada. Es un defecto **del
framework, no de la app**, aislado en `ProductsScreen.openProduct()`. Se deja
visible en lugar de silenciarlo.

### Lo que sólo se descubre ejecutando

Cuatro supuestos del código no sobrevivieron al contacto con la app real:

| Supuesto | Realidad |
|---|---|
| *Reset App State* resetea al pulsarlo | Encadena **dos diálogos** (confirmar + acuse) que comparten `android:id/button1` |
| El título del producto es clicable | **No lo es**: sólo la imagen (`productIV`) |
| El catálogo es una lista | Es una **rejilla de 2 columnas**: dos productos comparten coordenada vertical |
| El menú dice `Webview` / `Biometrics` | En 2.2.0 son `WebView` y `FingerPrint` |

Además, `parentElement()` de WebdriverIO **no funciona en Android**: se apoya en el
ejecutor de JavaScript, que UiAutomator2 no implementa.

### Capturas del emulador

`mobile/screenshots/` — catálogo, ficha, alta en carrito, carrito (**Total: 1 Items
$29.99**) y menú lateral.

---

## Los defectos se reprodujeron en producción

Que las 31 pruebas de API pasen **no significa que la API esté bien**: significa que
asevera su comportamiento **real**, que en 7 puntos se desvía del estándar. Los 8
hallazgos de Web y API de [`../docs/07-hallazgos.md`](../docs/07-hallazgos.md) se
confirmaron contra los entornos públicos, no contra una copia local:

| ID | Comportamiento observado | Esperado |
|---|---|---|
| BUG-WEB-01 | `problem_user`: carrito $39.98 → resumen $79.96 | Que coincidan |
| BUG-API-01 | Credenciales inválidas → `200` con `{"reason":"Bad credentials"}` | `401` |
| BUG-API-02 | Payload sin campo obligatorio → `500` | `400` |
| BUG-API-03 | `totalprice: -100` aceptado | Rechazo por dominio |
| BUG-API-04 | `DELETE` correcto → `201 Created` | `200` o `204` |
| BUG-API-05 | `DELETE` de id inexistente → `405` | `404` |
| BUG-API-06 | Sin cabecera `Accept` → `418 I'm a teapot` | `200` con JSON |
| BUG-API-07 | Respuesta XML servida como `text/html` | `application/xml` |

---

## Evidencia automática ante fallos

Estos reportes son de una ejecución **en verde**. Cuando algo falla, la configuración ya
genera más evidencia sin pedirla:

- **Playwright**: captura, vídeo y **trace** navegable (DOM, red, consola, paso a paso)
  con `npx playwright show-trace`, en `web/reports/artifacts/`.
- **Karate**: el HTML ya incluye petición y respuesta de cada llamada, más JSON de
  Cucumber y JUnit XML.

En los tres workflows los artefactos se suben con `if: always()`: también —y sobre
todo— cuando la ejecución falla.

---

## Cómo regenerar estas evidencias

```bash
# Web
cd web && npm ci && npx playwright install chromium
npx playwright test --project=chromium
npx tsx scripts/capture-evidence.ts

# API
cd api && mvn test
```

Detalle completo, incluida la ejecución sin Maven, en
[`../docs/08-ejecucion-y-evidencias.md`](../docs/08-ejecucion-y-evidencias.md).
