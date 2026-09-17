# Reporte QA Automation - Web, API y Mobile

Fecha de ejecucion: **9 de septiembre de 2026**  
Entornos: aplicaciones publicas reales y emulador Android local.

## 1. Resumen ejecutivo

Se automatizaron y ejecutaron pruebas funcionales para tres capas del reto: **Web**
(SauceDemo), **API** (Restful Booker) y **Mobile** (My Demo App Android). La solucion
prioriza flujos de mayor impacto de negocio: autenticacion, compra end-to-end, carrito,
checkout, contrato de API, ciclo de vida de reservas y validaciones de estado.

| Capa | Herramienta | Sistema bajo prueba | Casos / escenarios | Resultado | Tiempo | Reporte |
|---|---|---|---:|---|---:|---|
| Web | Playwright + TypeScript | `https://www.saucedemo.com` | 25 | **25/25 passed** | 16.4 s | `evidence/web/reports/playwright-html/index.html` |
| API | Karate DSL + JUnit | `https://restful-booker.herokuapp.com` | 31 | **31/31 passed** | 7.7 s | `evidence/api/reports/karate/karate-summary.html` |
| Mobile | Appium + WebdriverIO | My Demo App 2.2.0, Pixel 6 Android 13 | 11 | **9/11 passed** | 3.0 min | `evidence/mobile/reports/allure-report/index.html` |

Resultado global: **65 de 67 verificaciones pasaron**. Las 2 fallas estan concentradas
en la suite mobile, en escenarios de carrito que dependen de abrir productos mediante
scroll en el catalogo.

## 2. Alcance automatizado

### Web - SauceDemo

Objetivo: validar el flujo critico de compra y controles funcionales alrededor de la
experiencia e-commerce.

| Area | Cobertura |
|---|---|
| Compra end-to-end | Login, catalogo, carrito, datos de envio, resumen de importes y confirmacion |
| Login | Credenciales validas, usuario vacio, password vacio, usuario inexistente, password incorrecto y usuario bloqueado |
| Carrito | Alta, baja, persistencia entre pantallas y sincronizacion del badge |
| Checkout | Validacion de campos obligatorios, cancelacion y continuidad del flujo |
| Inventario | Ordenamiento por nombre y precio |
| Acceso | Redireccion sin sesion y logout |
| Defecto conocido | `problem_user` duplica precios en el resumen de compra |

Evidencias visuales disponibles en `evidence/web/screenshots/`:

- `01-login.png`
- `02-inventario.png`
- `03-carrito.png`
- `04-datos-envio.png`
- `05-resumen-importes.png`
- `06-confirmacion.png`

Nota: el caso `WEB-07` usa `test.fail()` porque documenta un defecto real. Playwright lo
contabiliza como passed porque el fallo es esperado y controlado; si el defecto se corrige,
el pipeline lo reportara como cambio inesperado.

### API - Restful Booker

Objetivo: validar el contrato, codigos HTTP, reglas de negocio y persistencia de reservas.

| Feature | Escenarios | Cobertura |
|---|---:|---|
| API-01 Autenticacion | 5 | `POST /auth`, token valido y particiones invalidas |
| API-02 Creacion | 10 | `POST /booking`, schema, campos obligatorios, campo opcional y valores limite |
| API-03 Consulta | 5 | `GET /booking`, `GET /booking/{id}`, filtros, 404 y XML |
| API-04 Actualizacion | 6 | `PUT`, `PATCH`, token requerido, Basic auth y payload incompleto |
| API-05 Eliminacion | 3 | `DELETE /booking/{id}` con y sin autorizacion, id inexistente |
| API-06 Ciclo de vida | 1 | Crear, consultar, listar, actualizar, eliminar y verificar 404 |
| API-07 Health | 1 | `GET /ping` |

El reporte Karate conserva request, response, headers, body y tiempos por escenario. Es
la evidencia principal para revisar fallas o defectos con desarrollo.

### Mobile - My Demo App Android

Objetivo: validar un flujo funcional relevante en Android y controles basicos de login,
carrito y ordenamiento.

| Suite | Casos | Resultado | Cobertura |
|---|---:|---|---|
| MOB-01 Compra completa | 1 | Passed | Catalogo, ficha, carrito, login, checkout y confirmacion |
| MOB-02 Carrito | 2 | Failed / Broken | Total por cantidad y vaciado del carrito |
| MOB-03 Login | 5 | Passed | Usuario valido, particiones invalidas y credenciales arbitrarias |
| MOB-04 Ordenamiento | 3 | Passed | Precio ascendente, precio descendente y nombre ascendente |

Evidencias visuales disponibles en `evidence/mobile/screenshots/`:

- `01-catalogo.png`
- `02-ficha-producto.png`
- `03-anadido-al-carrito.png`
- `04-carrito.png`
- `05-menu-lateral.png`

Las fallas de `MOB-02` quedan abiertas porque la automatizacion no logra abrir de forma
estable un producto que requiere desplazamiento en el catalogo. El flujo P0 de compra
completa si pasa.

## 3. Hallazgos principales

| ID | Capa | Severidad | Hallazgo | Estado en la suite |
|---|---|---|---|---|
| BUG-WEB-01 | Web | Critica | `problem_user` duplica precios en el resumen de compra | Cubierto con `test.fail()` |
| BUG-API-01 | API | Media | Credenciales invalidas devuelven `200 OK` | Asercion del comportamiento real |
| BUG-API-02 | API | Alta | Payload invalido devuelve `500` en vez de `400` | Asercion del comportamiento real |
| BUG-API-03 | API | Alta | Se aceptan importes negativos | Asercion del comportamiento real |
| BUG-API-04 | API | Baja | `DELETE` exitoso devuelve `201 Created` | Asercion del comportamiento real |
| BUG-API-05 | API | Baja | Borrar recurso inexistente devuelve `405` | Asercion del comportamiento real |
| BUG-API-06 | API | Media | Sin header `Accept`, la API responde `418` | Mitigado configurando headers |
| BUG-API-07 | API | Media | XML se sirve como `text/html` | Asercion del comportamiento real |
| BUG-MOB-01 | Mobile | Critica | La app acepta credenciales arbitrarias | Cubierto como known issue |
| BUG-MOB-02 | Mobile | Media | `Reset App State` no cierra sesion | Mitigado en precondiciones |

Detalle completo: `docs/07-hallazgos.md`.

## 4. Evidencias y artefactos

| Capa | Artefacto | Ruta |
|---|---|---|
| Web | Reporte HTML Playwright | `evidence/web/reports/playwright-html/index.html` |
| Web | Resultado JUnit | `evidence/web/reports/junit/results.xml` |
| Web | Capturas del flujo principal | `evidence/web/screenshots/` |
| API | Resumen Karate | `evidence/api/reports/karate/karate-summary.html` |
| API | Resultados por tags | `evidence/api/reports/karate/karate-tags.html` |
| API | Timeline de ejecucion | `evidence/api/reports/karate/karate-timeline.html` |
| API | Detalle por feature | `evidence/api/reports/karate/src.test.java.booker.features.*.html` |
| Mobile | Reporte Allure | `evidence/mobile/reports/allure-report/index.html` |
| Mobile | Capturas del emulador | `evidence/mobile/screenshots/` |

## 5. Comandos de reproduccion

### Web

```bash
cd web
npm ci
npx playwright install chromium
npm test
```

### API

```bash
cd api
mvn test
```

### Mobile

```bash
cd mobile
npm ci
npx appium driver install uiautomator2
npm test
```

Para mobile se requiere un emulador o dispositivo Android disponible y el APK configurado
mediante `APP_PATH`.

## 6. Conclusiones

La cobertura automatizada valida los caminos criticos de las tres capas y deja evidencia
navegable para auditoria. Web y API quedan en verde con defectos conocidos correctamente
trazados. Mobile cubre el flujo P0 de compra y login, pero mantiene abierta la estabilizacion
de dos escenarios de carrito relacionados con navegacion por scroll en el catalogo.

Recomendacion: usar Web `@smoke` y API `@smoke` como gate de Pull Request, ejecutar la
regresion completa al integrar en `main`, y correr Mobile en nightly sobre emulador o granja
para controlar la variabilidad del entorno Android.
