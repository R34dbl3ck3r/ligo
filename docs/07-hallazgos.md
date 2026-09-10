# 7. Hallazgos (defectos detectados)

> El enunciado no pide un informe de bugs, pero un ejercicio de QA que no reporta
> ninguno es sospechoso. Estos son los defectos que la automatización detectó, con su
> evidencia y su tratamiento en la suite.

**Cómo trato un defecto en la suite:** nunca lo escondo comentando el test, y nunca
codifico el comportamiento erróneo como si fuera el esperado sin decirlo. Uso dos
mecanismos:

- `test.fail()` (Playwright): el test se ejecuta, se espera que falle, y el pipeline
  **avisa cuando el defecto se corrige** (el test pasaría "inesperadamente"). Es un
  detector de cambio en ambos sentidos.
- **Aserción del comportamiento real + comentario con el ID del hallazgo**: cuando el
  defecto es de contrato (un código de estado equivocado), asevero lo que la API hace
  hoy para que la suite sea estable, y dejo el defecto documentado y trazado. Si mañana
  lo corrigen, el test falla y obliga a revisarlo conscientemente.

---

## Web — SauceDemo

### BUG-WEB-01 · `problem_user` duplica los precios en el resumen de compra
- **Severidad:** Crítica · **Prioridad:** P0
- **Pasos:** iniciar sesión con `problem_user`, añadir *Sauce Labs Backpack* ($29.99) y
  *Sauce Labs Bike Light* ($9.99), ir al carrito (subtotal $39.98), continuar al resumen.
- **Esperado:** `Item total: $39.98`
- **Obtenido:** `Item total: $79.96` (cada artículo se suma dos veces)
- **Impacto:** se cobra al cliente el doble de lo que aceptó en el carrito. Riesgo
  económico y legal directo.
- **Test:** `web/tests/web-07-problem-user-pricing.spec.ts` (`test.fail()`, `@known-issue`)

---

## API — Restful Booker

### BUG-API-01 · Credenciales inválidas devuelven `200 OK`
- **Severidad:** Media · **Prioridad:** P1
- **Obtenido:** `200 OK` con `{"reason":"Bad credentials"}`
- **Esperado:** `401 Unauthorized`
- **Impacto:** un cliente que sólo comprueba el código de estado creerá que se autenticó.
- **Test:** `api-01-auth.feature` → *credenciales inválidas no generan token*

### BUG-API-02 · Payload inválido devuelve `500 Internal Server Error`
- **Severidad:** Alta · **Prioridad:** P1
- **Pasos:** `POST /booking` sin `firstname` (o sin `lastname`, `totalprice`, `depositpaid`)
- **Obtenido:** `500` · **Esperado:** `400 Bad Request` indicando el campo faltante
- **Impacto:** un error del cliente se presenta como un fallo del servidor; contamina la
  monitorización y no da información para corregir la petición.
- **Test:** `api-02-create-booking.feature` → *falta el campo obligatorio …*

### BUG-API-03 · Se aceptan importes negativos
- **Severidad:** Alta · **Prioridad:** P1
- **Pasos:** `POST /booking` con `totalprice: -100` → `200 OK`, reserva creada
- **Impacto:** no existe validación de dominio sobre el importe. Permite reservas con
  valor negativo.
- **Test:** `api-02-create-booking.feature` → *se acepta un precio negativo*

### BUG-API-04 · `DELETE` exitoso devuelve `201 Created`
- **Severidad:** Baja · **Prioridad:** P2
- **Esperado:** `200 OK` o `204 No Content` · **Obtenido:** `201 Created`
- **Impacto:** rompe la semántica REST y confunde a los integradores.
- **Test:** `api-05-delete-booking.feature`

### BUG-API-05 · Borrar un recurso inexistente devuelve `405`
- **Severidad:** Baja · **Prioridad:** P2
- **Esperado:** `404 Not Found` · **Obtenido:** `405 Method Not Allowed`
- **Test:** `api-05-delete-booking.feature` → *eliminar una reserva inexistente*

### BUG-API-06 · Sin cabecera `Accept` la API responde `418 I'm a teapot`
- **Severidad:** Media · **Prioridad:** P1
- **Pasos:** `GET /booking/{id}` sin cabecera `Accept`
- **Obtenido:** `418` · **Esperado:** `200` con JSON por defecto
- **Impacto:** cualquier cliente que no fije `Accept` explícitamente falla sin motivo
  aparente. **Fue un hallazgo de la propia implementación de la suite**: los primeros
  escenarios fallaban con 418 hasta identificar la causa.
- **Mitigación en el framework:** `karate.configure('headers', { Accept: 'application/json' })`
  en `karate-config.js`, documentado en el propio archivo.

### BUG-API-07 · La respuesta XML se sirve como `text/html`
- **Severidad:** Media · **Prioridad:** P1
- **Pasos:** `GET /booking/{id}` con `Accept: application/xml`
- **Obtenido:** cuerpo XML correcto pero `Content-Type: text/html; charset=utf-8`
- **Esperado:** `Content-Type: application/xml`
- **Impacto:** los clientes que eligen el parser según la cabecera fallan.
- **Test:** `api-03-get-booking.feature` → *la API soporta negociación de contenido XML*

---

## Mobile — My Demo App Android

### BUG-MOB-01 · La aplicación no valida las credenciales
- **Severidad:** Crítica · **Prioridad:** P0
- **Pasos:** iniciar sesión con `cualquiera@example.com` / `contrasena-inventada`
- **Obtenido:** acceso concedido; sólo `alice@example.com` está bloqueado
- **Impacto:** no existe autenticación real. Cualquiera completa un pedido.
- **Test:** `mobile/tests/mob-03-login.spec.ts` → *acepta credenciales arbitrarias*
  (`@known-issue`), aseverando el comportamiento actual como detector de cambio.
- **Estado:** ✅ **confirmado en emulador real** (Pixel 6 · Android 13 · app 2.2.0).

### BUG-MOB-02 · «Reset App State» no cierra la sesión iniciada
- **Severidad:** Media · **Prioridad:** P2
- **Pasos:** iniciar sesión → menú → *Reset App State* → confirmar → abrir el menú
- **Obtenido:** el menú sigue mostrando *Log Out*: la sesión permanece abierta
- **Esperado:** que una opción llamada «reiniciar el estado de la app» devuelva
  también la sesión a su estado inicial
- **Impacto:** un usuario que use esa opción para «empezar de cero» sigue
  autenticado sin saberlo. En automatización obliga a que cada escenario
  garantice su propia precondición de sesión.
- **Detectado:** ejecutando `mob-03-login.spec.ts` contra el emulador: el segundo
  caso fallaba porque *Log In* ya no existía en el menú.
- **Tratamiento:** `MenuScreen.openLogin()` deja siempre el mismo punto de
  partida, cierre o no la sesión el reset.

---

## Resumen

| ID | Capa | Severidad | Estado en la suite |
|---|---|---|---|
| BUG-WEB-01 | Web | Crítica | `test.fail()` — falla de forma esperada |
| BUG-API-01 | API | Media | Comportamiento real aseverado + documentado |
| BUG-API-02 | API | Alta | Comportamiento real aseverado + documentado |
| BUG-API-03 | API | Alta | Comportamiento real aseverado + documentado |
| BUG-API-04 | API | Baja | Comportamiento real aseverado + documentado |
| BUG-API-05 | API | Baja | Comportamiento real aseverado + documentado |
| BUG-API-06 | API | Media | Mitigado en configuración + documentado |
| BUG-API-07 | API | Media | Comportamiento real aseverado + documentado |
| BUG-MOB-01 | Mobile | Crítica | Comportamiento real aseverado + documentado · confirmado en emulador |
| BUG-MOB-02 | Mobile | Media | Precondición robusta en el framework + documentado |

> Nota: parte de estos comportamientos son *intencionados* en aplicaciones de
> demostración pensadas para practicar automatización. Los reporto igual, porque el
> criterio correcto de un QA no es adivinar la intención del autor, sino **contrastar el
> comportamiento contra lo que la documentación y los estándares establecen**.
