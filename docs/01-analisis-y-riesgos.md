# 1. Análisis de las aplicaciones y riesgos

> Punto evaluado: **"Análisis y riesgo — selección, priorización y cobertura con sentido de negocio"**.

Antes de escribir una sola línea de automatización recorrí las tres aplicaciones y
las modelé como flujos de negocio, no como pantallas. La pregunta que guía todo el
trabajo no es *"¿qué se puede automatizar?"* sino **"¿qué falla nos cuesta dinero,
reputación o exposición legal?"**.

---

## 1.1 Criterio de priorización

Uso una matriz **impacto × probabilidad**, y el resultado se traduce en una etiqueta
que existe también en el código (`@p0`, `@p1`, `@p2`) y que gobierna qué se ejecuta
en cada etapa del pipeline.

| Prioridad | Definición operativa | Dónde se ejecuta |
|---|---|---|
| **P0** | Si falla, el negocio se detiene o se expone: no se puede comprar, se cobra mal, se accede sin permiso. | Pull Request (`@smoke`) y todo lo demás |
| **P1** | Degrada la experiencia o produce datos incorrectos, pero existe camino alternativo. | Merge a `main` (`@regression`) |
| **P2** | Molesto pero tolerable; se corrige en el siguiente sprint. | Nightly |

Un matiz importante: **P0 no es sinónimo de "camino feliz"**. El control de acceso por
URL directa (WEB-06) no forma parte del flujo de compra y sin embargo es P0, porque un
fallo ahí es un incidente de seguridad.

---

## 1.2 Web — SauceDemo (e-commerce)

**Qué hace el sistema:** login → catálogo → carrito → datos de envío → resumen con
impuestos → confirmación. La aplicación mantiene el estado del carrito en
`localStorage` y la sesión en la cookie `session-username`.

**Particularidad clave:** SauceDemo expone seis usuarios que *simulan fallos reales de
producción* (`locked_out_user`, `problem_user`, `performance_glitch_user`,
`error_user`, `visual_user`). Eso no es decoración: es la parte más interesante del
sistema para un QA, porque permite probar cómo se comporta el negocio cuando algo va mal.

| # | Riesgo | Impacto | Prob. | Prioridad | Cubierto por |
|---|---|---|---|---|---|
| R-W1 | El usuario no puede completar la compra (flujo principal roto) | Crítico | Media | **P0** | WEB-01 |
| R-W2 | Se cobra un importe distinto al mostrado en el carrito | Crítico | **Alta** (defecto real detectado) | **P0** | WEB-07 |
| R-W3 | Acceso a áreas privadas sin sesión (deep link) | Crítico | Media | **P0** | WEB-06 |
| R-W4 | Un usuario legítimo no puede entrar / uno bloqueado sí entra | Alto | Media | **P0** | WEB-02 |
| R-W5 | El carrito pierde o duplica artículos al navegar | Alto | Media | **P1** | WEB-03 |
| R-W6 | Se aceptan pedidos con datos de envío incompletos | Alto | Media | **P1** | WEB-04 |
| R-W7 | El impuesto/total se calcula mal | Crítico | Baja | **P0** | WEB-01 (aserción de importes) |
| R-W8 | El ordenamiento del catálogo es incorrecto | Bajo | Media | **P2** | WEB-05 |
| R-W9 | Defectos visuales / imágenes cruzadas (`visual_user`, `problem_user`) | Medio | Alta | **P2** | *No automatizado* — ver §1.5 |
| R-W10 | Latencia inaceptable (`performance_glitch_user`) | Medio | Alta | **P2** | *No automatizado* — ver §1.5 |

---

## 1.3 API — Restful Booker (motor de reservas)

**Qué hace el sistema:** autenticación por token, y CRUD de reservas. Las operaciones
de escritura (`PUT`, `PATCH`, `DELETE`) exigen token o *Basic auth*; las de lectura son
públicas.

El riesgo dominante en una API no es "que el endpoint responda", sino **que responda
mal de forma silenciosa**: un contrato roto, una regla de negocio ausente o una
autorización que no se aplica.

| # | Riesgo | Impacto | Prob. | Prioridad | Cubierto por |
|---|---|---|---|---|---|
| R-A1 | Cualquiera puede modificar o borrar reservas ajenas | Crítico | Media | **P0** | API-04, API-05 (escenarios `@security`) |
| R-A2 | La reserva creada no persiste o persiste alterada | Crítico | Media | **P0** | API-02, API-06 |
| R-A3 | Cambio de contrato no anunciado (rompe a los consumidores) | Alto | Media | **P1** | API-02, API-03 (`@contract`) |
| R-A4 | Datos inválidos aceptados como válidos (precio negativo, campos faltantes) | Alto | **Alta** (defecto real) | **P1** | API-02 |
| R-A5 | El token no se emite o no se valida | Crítico | Baja | **P0** | API-01 |
| R-A6 | Búsqueda/filtrado devuelve reservas de otro cliente | Alto | Baja | **P1** | API-03 |
| R-A7 | Códigos de estado incorrectos que confunden al integrador | Medio | **Alta** (defecto real) | **P1** | API-01, API-05 |
| R-A8 | Indisponibilidad del entorno (free tier dormido) | Medio | Alta | **P0** operativo | API-07 (health check) |

---

## 1.4 Mobile — My Demo App Android

**Qué hace el sistema:** catálogo → detalle (color y cantidad) → carrito → login →
datos de envío → pago → revisión → confirmación.

En mobile el riesgo técnico se suma al de negocio: **la inestabilidad del entorno**
(emulador, animaciones, teclado, tiempos de arranque) puede producir más fallos que el
propio producto. Por eso la estrategia prioriza *pocos escenarios, muy estables*.

| # | Riesgo | Impacto | Prob. | Prioridad | Cubierto por |
|---|---|---|---|---|---|
| R-M1 | No se puede completar la compra en el móvil | Crítico | Media | **P0** | MOB-01 |
| R-M2 | El total del carrito no corresponde a lo seleccionado | Crítico | Media | **P1** | MOB-02 |
| R-M3 | La app acepta credenciales arbitrarias | Crítico | **Alta** (defecto real) | **P0** | MOB-03 (`@known-issue`) |
| R-M4 | Un usuario bloqueado consigue entrar | Alto | Baja | **P1** | MOB-03 |
| R-M5 | El carrito no se vacía al eliminar el último producto | Medio | Media | **P1** | MOB-02 |
| R-M6 | Ordenamiento incorrecto del catálogo | Bajo | Media | **P2** | MOB-04 |
| R-M7 | Fallos específicos de dispositivo/versión de Android | Alto | Media | **P2** | *Nightly*, matriz en granja de dispositivos |

---

## 1.5 Qué decidí **no** automatizar (y por qué)

Esta sección es tan importante como la anterior. Automatizar todo es una forma cara de
no priorizar.

| Área | Decisión | Justificación |
|---|---|---|
| **Defectos visuales** (`visual_user`, `problem_user`: imágenes cruzadas) | No automatizado con aserciones funcionales | Un `expect` sobre una URL de imagen es frágil y no detecta el problema real (maquetación). La herramienta correcta es *visual regression* (Playwright `toHaveScreenshot` o Percy/Sauce Visual). Lo dejo propuesto para V2 con línea base versionada. |
| **Rendimiento** (`performance_glitch_user`) | No automatizado como test funcional | Medir latencia dentro de un test E2E produce falsos positivos por ruido de CI. Corresponde a una prueba de rendimiento dedicada (k6/Lighthouse) con umbrales propios. |
| **Combinatoria completa del formulario de checkout** | Sólo 3 casos (uno por campo obligatorio) | La aplicación valida secuencialmente; las 7 combinaciones restantes no aportan información nueva. Tabla de decisión reducida. |
| **Todos los productos del catálogo** | 2-3 productos representativos | El comportamiento es idéntico para los 6; multiplicar por 6 multiplica el tiempo, no la cobertura de riesgo. |
| **Enlaces sociales, footer, "About"** | No automatizado | Impacto de negocio nulo o marginal; se cubre con exploración manual. |
| **Biometría, QR, geolocalización, drawing (Mobile)** | No automatizado | Son *demos* de capacidades del dispositivo, ajenas al flujo de compra que se pide evaluar. Además requieren permisos y hardware que disparan el coste de mantenimiento. |
| **Flujo de pago real (Mobile)** | Se usan datos de tarjeta de prueba | No hay pasarela real; validar el formulario es lo que aporta valor. |
| **API: XML en todos los endpoints** | Sólo un escenario de negociación de contenido | Basta para verificar que el mecanismo existe; replicarlo en cada endpoint es redundante. |

---

## 1.6 Resumen de cobertura

| Capa | Escenarios documentados | Automatizados | Ejecutados en esta entrega |
|---|---|---|---|
| Web | 7 casos (25 ejecuciones con DDT) | 7 | ✅ 25/25 |
| API | 7 features (31 escenarios con DDT) | 7 | ✅ 31/31 |
| Mobile | 4 casos (11 ejecuciones con DDT) | 4 | ⏸️ requiere emulador (ver README) |
