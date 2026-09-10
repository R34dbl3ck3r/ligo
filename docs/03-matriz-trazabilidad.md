# 3. Matriz de trazabilidad

> Punto evaluado: **apartado 5.3 — "Relaciona: Requerimiento o flujo → Caso de prueba → Test automatizado"**.

La matriz responde a tres preguntas que un líder técnico hace siempre:
*¿qué requisito cubre este test?*, *¿qué queda sin cubrir?* y *si este test falla,
qué parte del negocio está en riesgo?*

---

## 3.1 Web — SauceDemo

| Requerimiento / flujo | Riesgo | Caso | Test automatizado (archivo → nombre) | Etiquetas |
|---|---|---|---|---|
| RF-W1 · El usuario se autentica para acceder al catálogo | R-W4 | WEB-02 | `web/tests/web-02-login.spec.ts` → *credenciales válidas dan acceso al catálogo* | `@smoke @p0` |
| RF-W2 · El sistema rechaza credenciales inválidas con un mensaje claro | R-W4 | WEB-02 | `web-02-login.spec.ts` → *login rechazado: …* (5 variantes) | `@regression @p0` |
| RF-W3 · El usuario añade y quita productos del carrito | R-W5 | WEB-03 | `web-03-cart.spec.ts` → *añadir y quitar productos…* | `@regression @p1` |
| RF-W4 · El carrito conserva su contenido al navegar | R-W5 | WEB-03 | `web-03-cart.spec.ts` → *el carrito persiste al navegar…* | `@regression @p1` |
| RF-W5 · El carrito puede vaciarse | R-W5 | WEB-03 | `web-03-cart.spec.ts` → *eliminar el último producto…* | `@regression @p2` |
| RF-W6 · El checkout exige nombre, apellido y código postal | R-W6 | WEB-04 | `web-04-checkout-validation.spec.ts` → *no permite continuar…* (3 variantes) | `@regression @p1` |
| RF-W7 · Con datos válidos se avanza al resumen | R-W1 | WEB-04 | `web-04-checkout-validation.spec.ts` → *con los tres campos completos…* | `@smoke @p1` |
| RF-W8 · Cancelar el checkout devuelve al carrito sin perder productos | R-W5 | WEB-04 | `web-04-checkout-validation.spec.ts` → *cancelar devuelve al carrito…* | `@regression @p2` |
| RF-W9 · El resumen calcula subtotal, impuesto (8 %) y total | R-W7 | WEB-01 | `web-01-checkout-e2e.spec.ts` → paso 5 *Verificar el resumen y los importes* | `@smoke @p0` |
| RF-W10 · El pedido se confirma y el carrito queda vacío | R-W1 | WEB-01 | `web-01-checkout-e2e.spec.ts` → pasos 6 y 7 | `@smoke @p0` |
| RF-W11 · El catálogo se ordena por nombre y precio | R-W8 | WEB-05 | `web-05-inventory-sort.spec.ts` → *ordena por …* (4 variantes) | `@regression @p2` |
| RF-W12 · Las rutas privadas exigen sesión activa | R-W3 | WEB-06 | `web-06-access-control.spec.ts` → *sin sesión, /… redirige al login* (4 rutas) | `@regression @p0 @security` |
| RF-W13 · Cerrar sesión invalida el acceso | R-W3 | WEB-06 | `web-06-access-control.spec.ts` → *cerrar sesión invalida el acceso…* | `@regression @p1 @security` |
| RF-W14 · El precio mostrado en el carrito es el que se cobra | R-W2 | WEB-07 | `web-07-problem-user-pricing.spec.ts` → *el subtotal del resumen coincide…* | `@regression @p0 @known-issue` |

---

## 3.2 API — Restful Booker

| Requerimiento / flujo | Riesgo | Caso | Test automatizado (feature → escenario) | Etiquetas |
|---|---|---|---|---|
| RF-A1 · El servicio está disponible | R-A8 | API-07 | `api-07-health.feature` → *el servicio responde al health check* | `@smoke @p0 @health` |
| RF-A2 · Credenciales válidas generan un token | R-A5 | API-01 | `api-01-auth.feature` → *credenciales válidas devuelven un token utilizable* | `@smoke @p0` |
| RF-A3 · Credenciales inválidas no generan token | R-A5 | API-01 | `api-01-auth.feature` → *credenciales inválidas no generan token* (4 variantes) | `@regression @p1` |
| RF-A4 · Se crea una reserva y la respuesta refleja lo enviado | R-A2 | API-02 | `api-02-create-booking.feature` → *se crea una reserva y la respuesta refleja…* | `@smoke @p0` |
| RF-A5 · La reserva creada cumple el contrato publicado | R-A3 | API-02 | `api-02-create-booking.feature` → *la reserva creada cumple el contrato* | `@regression @p1 @contract` |
| RF-A6 · `additionalneeds` es opcional | R-A4 | API-02 | `api-02-create-booking.feature` → *additionalneeds es opcional* | `@regression @p1` |
| RF-A7 · Los campos obligatorios se validan | R-A4 | API-02 | `api-02-create-booking.feature` → *falta el campo obligatorio …* (4 variantes) | `@regression @p1` |
| RF-A8 · `totalprice` acepta el rango de negocio | R-A4 | API-02 | `api-02-create-booking.feature` → *valores límite de totalprice* + *precio negativo* | `@regression @p2` |
| RF-A9 · El listado devuelve identificadores | R-A6 | API-03 | `api-03-get-booking.feature` → *el listado devuelve identificadores…* | `@smoke @p0` |
| RF-A10 · Se recupera una reserva por id | R-A2 | API-03 | `api-03-get-booking.feature` → *se recupera una reserva recién creada…* | `@smoke @p0` |
| RF-A11 · El filtrado por nombre devuelve sólo lo buscado | R-A6 | API-03 | `api-03-get-booking.feature` → *el filtro por nombre y apellido…* | `@regression @p1` |
| RF-A12 · Un id inexistente devuelve 404 | R-A7 | API-03 | `api-03-get-booking.feature` → *consultar un id inexistente devuelve 404* | `@regression @p2` |
| RF-A13 · La API soporta XML | R-A3 | API-03 | `api-03-get-booking.feature` → *negociación de contenido XML* | `@regression @p2 @contract` |
| RF-A14 · `PUT` reemplaza la reserva y persiste | R-A2 | API-04 | `api-04-update-booking.feature` → *PUT reemplaza la reserva completa…* | `@smoke @p0` |
| RF-A15 · `PATCH` modifica sólo lo enviado | R-A2 | API-04 | `api-04-update-booking.feature` → *PATCH modifica sólo los campos enviados* | `@regression @p1` |
| RF-A16 · La escritura exige autorización | R-A1 | API-04 | `api-04-update-booking.feature` → *PUT/PATCH sin token es rechazado* | `@regression @p0 @security` |
| RF-A17 · Se admite Basic auth | R-A1 | API-04 | `api-04-update-booking.feature` → *PUT acepta autenticación básica* | `@regression @p1 @security` |
| RF-A18 · `PUT` valida el payload | R-A4 | API-04 | `api-04-update-booking.feature` → *PUT con payload incompleto…* | `@regression @p1` |
| RF-A19 · El borrado exige autorización | R-A1 | API-05 | `api-05-delete-booking.feature` → *sin token no se puede eliminar…* | `@regression @p0 @security` |
| RF-A20 · El borrado persiste | R-A2 | API-05 | `api-05-delete-booking.feature` → *con token la reserva se elimina…* | `@smoke @p0` |
| RF-A21 · Borrar un id inexistente no rompe el servicio | R-A7 | API-05 | `api-05-delete-booking.feature` → *eliminar una reserva inexistente* | `@regression @p2` |
| RF-A22 · Ciclo de vida completo de una reserva | R-A2 | API-06 | `api-06-lifecycle.feature` → *una reserva se crea, se consulta, se actualiza y se elimina* | `@smoke @p0` |

---

## 3.3 Mobile — My Demo App Android

| Requerimiento / flujo | Riesgo | Caso | Test automatizado (archivo → nombre) | Etiquetas |
|---|---|---|---|---|
| RF-M1 · Se puede comprar un producto de principio a fin | R-M1 | MOB-01 | `mobile/tests/mob-01-purchase-flow.spec.ts` → *permite comprar un producto…* | `@smoke @regression @p0` |
| RF-M2 · El total refleja precio × cantidad | R-M2 | MOB-02 | `mob-02-cart.spec.ts` → *el total refleja la cantidad seleccionada* | `@regression @p1` |
| RF-M3 · El carrito se vacía al eliminar el último producto | R-M5 | MOB-02 | `mob-02-cart.spec.ts` → *eliminar el único producto…* | `@regression @p1` |
| RF-M4 · Un usuario válido inicia sesión | R-M4 | MOB-03 | `mob-03-login.spec.ts` → *un usuario válido inicia sesión correctamente* | `@smoke @p1` |
| RF-M5 · Se validan los campos obligatorios del login | R-M4 | MOB-03 | `mob-03-login.spec.ts` → *rechaza el login: …* (3 variantes) | `@regression @p1` |
| RF-M6 · Un usuario bloqueado no puede entrar | R-M4 | MOB-03 | `mob-03-login.spec.ts` → *rechaza el login: usuario bloqueado* | `@regression @p1` |
| RF-M7 · Las credenciales se validan contra el backend | R-M3 | MOB-03 | `mob-03-login.spec.ts` → *acepta credenciales arbitrarias* | `@known-issue @p0 @security` |
| RF-M8 · El catálogo se ordena | R-M6 | MOB-04 | `mob-04-sorting.spec.ts` → *ordena por …* (3 variantes) | `@regression @p2` |

---

## 3.4 Cobertura y huecos conocidos

| Riesgo identificado | ¿Cubierto? | Comentario |
|---|---|---|
| R-W9 · Defectos visuales | ❌ | Requiere *visual regression* con línea base (propuesto para V2) |
| R-W10 · Rendimiento | ❌ | Requiere prueba de rendimiento dedicada, no un test funcional |
| R-M7 · Fragmentación de dispositivos | ⚠️ Parcial | El framework ya soporta granja de dispositivos (`wdio.android.cloud.conf.ts`); falta ejecutarlo en la matriz |
| Accesibilidad (WCAG) | ❌ | No solicitado; sería el siguiente incremento natural (axe-core en Playwright) |

**Los huecos son decisiones documentadas, no descuidos.**
