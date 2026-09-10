# 2. Diseño de pruebas

> Punto evaluado: **"Diseño de pruebas — uso correcto y justificado de técnicas"**.
> Formato solicitado en el apartado 5.2 del enunciado.

Las tres tablas siguen el formato pedido (ID · Escenario · Prioridad · Técnica ·
Automatizado). Debajo de cada tabla explico **por qué esa técnica** y no otra.

---

## 2.1 Web — SauceDemo (Playwright + TypeScript)

| ID | Escenario | Prioridad | Técnica | Automatizado |
|---|---|---|---|---|
| **WEB-01** | Compra completa: login → catálogo → carrito → datos de envío → resumen → confirmación, verificando subtotal, impuesto (8 %) y total | P0 | Transición de estados + verificación de regla de negocio | **Sí** |
| **WEB-02** | Login: credenciales válidas y 5 particiones inválidas (usuario vacío, password vacío, usuario inexistente, password incorrecto, usuario bloqueado) | P0 | Partición de equivalencia + Data Driven Testing | **Sí** |
| **WEB-03** | Carrito: alta/baja de productos, sincronización del badge, persistencia al navegar a la ficha y vaciado del carrito | P1 | Transición de estados + CRUD | **Sí** |
| **WEB-04** | Checkout: campos obligatorios ausentes (nombre, apellido, código postal), caso válido y cancelación | P1 | Tabla de decisión + Data Driven Testing | **Sí** |
| **WEB-05** | Ordenamiento del catálogo por nombre (A-Z, Z-A) y precio (asc, desc) | P2 | Partición de equivalencia sobre el conjunto de opciones + oráculo calculado | **Sí** |
| **WEB-06** | Acceso por URL directa a 4 rutas protegidas sin sesión, y tras cerrar sesión | P0 | Prueba negativa de seguridad / control de acceso | **Sí** |
| **WEB-07** | Coherencia del precio entre carrito y resumen de compra con `problem_user` | P0 | Prueba de consistencia de datos (oráculo comparativo) | **Sí** — marcado `@known-issue` |
| WEB-08 | Regresión visual del catálogo (`visual_user`) | P2 | Comparación de imágenes con línea base | No — V2 |
| WEB-09 | Latencia percibida (`performance_glitch_user`) | P2 | Prueba de rendimiento con umbral | No — herramienta dedicada |

**Total automatizado: 7 casos → 25 ejecuciones** (el DDT expande WEB-02, WEB-04, WEB-05 y WEB-06).

### Por qué estas técnicas

- **Transición de estados (WEB-01, WEB-03):** el carrito es una máquina de estados
  (vacío → con artículos → confirmado → vacío otra vez). Lo que rompe en producción no
  suele ser una pantalla aislada, sino la transición entre ellas.
- **Partición de equivalencia (WEB-02):** existen tres clases de credenciales
  —válidas, inválidas y campos ausentes—. Un representante por clase basta; añadir una
  segunda contraseña incorrecta cuesta tiempo y no aporta información.
- **Tabla de decisión (WEB-04):** tres campos obligatorios ⇒ 8 combinaciones teóricas.
  Como la aplicación valida **secuencialmente** (se detiene en el primer campo vacío),
  sólo 3 combinaciones son observables. Reducir 8 a 3 es aplicar la técnica, no recortarla.
- **Oráculo calculado (WEB-01, WEB-05):** el resultado esperado se **calcula** a partir
  de los datos (`subtotal × 0.08`, lista ordenada) en lugar de fijarse como literal.
  Si mañana cambia el catálogo o un precio, el test sigue siendo válido.
- **Prueba negativa de seguridad (WEB-06):** el valor está en lo que *no* debe ocurrir.
- **Oráculo comparativo (WEB-07):** no comparo contra un valor fijo, sino contra
  **otra parte del propio sistema** (carrito vs. resumen). Así se detecta la
  incoherencia sin depender de precios concretos.

---

## 2.2 API — Restful Booker (Karate DSL)

| ID | Escenario | Prioridad | Técnica | Automatizado |
|---|---|---|---|---|
| **API-01** | `POST /auth`: token con credenciales válidas + 4 combinaciones inválidas | P0 / P1 | Partición de equivalencia + DDT (`Scenario Outline`) | **Sí** |
| **API-02** | `POST /booking`: alta correcta, contrato, campo opcional, 4 campos obligatorios ausentes, valores límite de `totalprice` (0, 999999, negativo) | P0 / P1 / P2 | Partición de equivalencia + análisis de valores límite + validación de contrato | **Sí** |
| **API-03** | `GET /booking` y `GET /booking/{id}`: contrato del listado, recuperación por id, filtrado por nombre, id inexistente, negociación de contenido XML | P0 / P1 / P2 | Validación de contrato + prueba negativa + negociación de contenido | **Sí** |
| **API-04** | `PUT`/`PATCH /booking/{id}`: reemplazo total, actualización parcial, sin token (403), Basic auth, payload incompleto (400) | P0 / P1 | Transición de estados + prueba de autorización + partición | **Sí** |
| **API-05** | `DELETE /booking/{id}`: sin token, con token, id inexistente | P0 / P2 | Prueba de autorización + prueba negativa | **Sí** |
| **API-06** | Ciclo de vida completo: auth → crear → consultar → listar → actualizar → verificar → eliminar → verificar 404 | P0 | Transición de estados end-to-end + verificación de persistencia | **Sí** |
| **API-07** | `GET /ping`: disponibilidad del servicio y tiempo de respuesta | P0 (operativo) | Health check / smoke de entorno | **Sí** |

**Total automatizado: 7 features → 31 escenarios.**

### Validaciones aplicadas (las cinco que pide el enunciado)

| Validación pedida | Dónde y cómo |
|---|---|
| **HTTP status y headers** | En todos los escenarios (`Then status`); cabeceras en API-03 (`Content-Type` en la respuesta XML) |
| **Contenido del response** | `match response.booking == payload` en API-02: la respuesta debe reflejar exactamente lo enviado |
| **Schema o contrato** | `booking-schema.json` con marcadores de tipo de Karate (`#string`, `#number`, `#boolean`, `#regex`) aplicado en API-02 y API-03. Valida **tipos y estructura**, no valores: sobrevive a cambios de datos y detecta cambios de contrato |
| **Reglas de negocio** | Campos obligatorios (API-02), `additionalneeds` opcional, autorización obligatoria para escritura (API-04, API-05), unicidad del filtrado (API-03) |
| **Persistencia** | API-04 y API-06 vuelven a consultar el recurso **en una petición independiente** después de escribir. Un `200 OK` no prueba que el dato se haya guardado; el `GET` posterior sí |

### Por qué estas técnicas

- **Valores límite en `totalprice`:** 0 (mínimo razonable), 999999 (valor alto) y −100
  (fuera del dominio válido). El tercero destapó un defecto real: la API acepta
  importes negativos.
- **`Scenario Outline` en lugar de escenarios repetidos:** el dato se separa de la
  lógica. Añadir una nueva partición inválida es añadir una fila, no un escenario.
- **Contrato separado del contenido:** un `match` contra el payload verifica *este*
  caso; el `match` contra el schema verifica *cualquier* caso. Se necesitan ambos.

---

## 2.3 Mobile — My Demo App Android (Appium + WebdriverIO)

| ID | Escenario | Prioridad | Técnica | Automatizado |
|---|---|---|---|---|
| **MOB-01** | Compra completa: catálogo → detalle → carrito → login → envío → pago → revisión → confirmación | P0 | Transición de estados (flujo funcional principal) | **Sí** |
| **MOB-02** | Carrito: el total refleja la cantidad seleccionada; eliminar el único producto deja el carrito vacío | P1 | Verificación de regla de negocio (precio × cantidad) + transición de estados | **Sí** |
| **MOB-03** | Login: usuario válido, usuario vacío, password vacío, usuario bloqueado, y credenciales arbitrarias | P0 / P1 | Partición de equivalencia + DDT | **Sí** — incluye `@known-issue` |
| **MOB-04** | Ordenamiento del catálogo (precio asc/desc, nombre asc) | P2 | Oráculo calculado sobre la lista mostrada | **Sí** |
| MOB-05 | Biometría, QR, geolocalización, drawing | P2 | Exploratoria manual | No — fuera del flujo de negocio |
| MOB-06 | Matriz de dispositivos y versiones de Android | P2 | Cobertura combinatoria por riesgo | No — nightly en granja de dispositivos |

**Total automatizado: 4 casos → 11 ejecuciones.**

### Por qué estas técnicas

- **Un solo flujo end-to-end (MOB-01):** en mobile, cada test E2E cuesta minutos y
  cada minuto multiplica la probabilidad de un fallo de infraestructura. Uno bien hecho
  vale más que cinco inestables.
- **Verificación aritmética (MOB-02):** comprobar que "aparece el producto" es débil.
  Comprobar que `total == precio × cantidad` verifica la regla de negocio real.
- **Oráculo calculado (MOB-04):** se compara la lista mostrada contra su propia versión
  ordenada. Independiente del catálogo y del idioma del dispositivo.

---

## 2.4 Nomenclatura y trazabilidad en el código

Cada ID de esta tabla existe literalmente en el repositorio:

```
web/tests/web-01-checkout-e2e.spec.ts          -> WEB-01
api/src/test/java/booker/features/api-04-*.feature -> API-04
mobile/tests/mob-02-cart.spec.ts               -> MOB-02
```

y cada test lleva sus etiquetas (`@smoke`, `@regression`, `@p0`, `@security`,
`@known-issue`), que son las que el pipeline usa para decidir qué ejecutar en cada
etapa. La trazabilidad completa está en [`03-matriz-trazabilidad.md`](03-matriz-trazabilidad.md).
