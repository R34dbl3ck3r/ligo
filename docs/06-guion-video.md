# 6. Guion del video (10–15 min)

> Punto evaluado: **apartado 7 del enunciado**. El objetivo declarado no es la calidad
> de la presentación, sino que se entienda **cómo analizo, diseño y construyo**.

**Regla para grabar:** hablar de decisiones, no de sintaxis. Mostrar el código sólo
cuando ilustre una decisión. Todo lo que aparece abajo está en el repositorio, así que
no hay que preparar nada extra.

---

## Minuto 0:00 – 1:30 · Contexto y estrategia (30 s de intro, 60 s de estrategia)

Qué decir:

> "Tres capas, tres tecnologías, un mismo criterio: **priorizar por riesgo de negocio**.
> No busqué cobertura amplia, busqué cubrir lo que cuesta dinero si falla."

Mostrar: `docs/01-analisis-y-riesgos.md`, tabla de criterio P0/P1/P2.

Frase clave: *"P0 no es sinónimo de camino feliz: el control de acceso por URL directa
no es parte del flujo de compra y es P0, porque un fallo ahí es un incidente de seguridad."*

---

## 1:30 – 3:00 · Escenarios seleccionados y lo que dejé fuera

Mostrar: `docs/02-diseno-de-pruebas.md` (las tres tablas) y §1.5 de análisis.

Puntos a cubrir:
- 7 casos Web / 7 features API / 4 casos Mobile → **25 + 31 + 11 ejecuciones**.
- La técnica de cada uno y **por qué esa y no otra**: tabla de decisión reducida de 8 a
  3 casos porque la app valida secuencialmente.
- **Lo no automatizado**: visual y rendimiento, con el motivo (la herramienta correcta es
  otra, no un `expect`).

---

## 3:00 – 5:30 · Arquitectura de las tres capas

Mostrar el árbol del repositorio y luego, en pantalla:

1. **Web** — `pages.fixture.ts`: cómo el test declara sólo lo que necesita.
   ```ts
   async ({ loggedIn, cartPage, checkoutOverviewPage }) => { … }
   ```
   Y `header.component.ts`: por qué la cabecera es un *componente* y no una página.

2. **API** — `karate-config.js` (entornos, credenciales por variable, cabecera global) y
   `booking-builder.js` (Test Data Builder con UUID).

3. **Mobile** — `selectors.ts`: la política de localizadores en un solo archivo,
   con la jerarquía `accessibility id → resource-id → UiSelector`.

Frase clave: *"Un patrón distinto por capa, elegido por el problema de cada una.
Forzar el mismo patrón en las tres es el error más común."*

---

## 5:30 – 7:30 · Las partes importantes del código

Tres fragmentos, no más:

1. **`web/tests/web-01-checkout-e2e.spec.ts`** — el oráculo calculado:
   ```ts
   expect(tax).toBe(expectedTax(expectedSubtotal, env.taxRate));
   expect(total).toBe(round2(subtotal + tax));
   ```
   *"No verifico que llegue a la confirmación; verifico que el importe sea el correcto."*

2. **`web/src/utils/session.ts`** — siembra de estado por cookie + localStorage.
   *"Así el test de checkout no depende del test de login. 25 ejecuciones en 38 segundos."*

3. **`api/src/test/java/booker/features/api-06-lifecycle.feature`** — persistencia:
   *"Un 200 OK no prueba que el dato se guardó. El GET posterior, sí."*

---

## 7:30 – 10:00 · Ejecución en vivo y evidencias

1. Lanzar `npm test` en `web/` → 25/25 en pantalla.
2. Abrir el reporte HTML de Playwright: pasos, tiempos, y el trace de un fallo.
3. Lanzar Karate → 31/31 y abrir `karate-summary.html`: mostrar la petición y la
   respuesta completas de un escenario.
4. Mencionar Mobile: código verificado con `tsc`, ejecución preparada en el workflow
   nightly (emulador Pixel 6 / API 33).

**Ser explícito con el condicionante del entorno** (`docs/08`): el proxy bloqueaba los
sitios públicos, se levantaron las mismas aplicaciones desde su código fuente oficial y
sólo cambió una variable de entorno. *"Que el destino fuera parametrizable desde el
diseño es lo que permitió salvarlo sin tocar una línea de test."*

---

## 10:00 – 12:00 · Decisiones técnicas (las 10 preguntas)

Ir a `docs/04-decisiones-tecnicas.md` y resolver en bloque, con un ejemplo cada una:

| Pregunta | Respuesta en una frase |
|---|---|
| Patrón | POM + fixtures en Web; features reutilizables en API; Screen Object en Mobile |
| Datos | Constantes tipadas + DDT + *builder* con UUID; credenciales por variable de entorno |
| Dependencias | Siembra de estado y datos propios por test; nada de encadenar por UI |
| Flaky | Cero esperas fijas, localizadores estables, `retries` sólo en CI con trace, cuarentena con fecha límite |
| Localizadores | `data-test` en Web; `accessibility id → resource-id` en Mobile; XPath prohibido |
| Smoke vs Regression | Smoke = P0 del camino crítico en PR (<10 min); regresión completa en merge; nightly con cross-browser y mobile |
| Escalado | Todo parametrizado, paralelismo activo, granja de dispositivos ya configurada |

Contar **un caso real de flakiness resuelto**: el icono `open-menu` de SauceDemo estaba
cubierto por el botón real y el click se interceptaba. *"La solución no fue reintentar,
fue cambiar el localizador al elemento que recibe el evento."*

---

## 12:00 – 13:30 · CI/CD y hallazgos

- `docs/05`: la tabla PR / Merge / Nightly con sus tiempos objetivo y su consecuencia.
  *"Si un pipeline tarda más de lo que la gente está dispuesta a esperar, la gente lo salta."*
- Por qué Mobile no está en el gate de PR.
- `docs/07-hallazgos.md`: **9 defectos reales**, destacando dos:
  - **BUG-WEB-01**: `problem_user` duplica el precio en el resumen → se cobra el doble.
  - **BUG-MOB-01**: la app móvil acepta cualquier credencial.
  - Y cómo los trato: `test.fail()` para que el pipeline **avise cuando se corrijan**.

---

## 13:30 – 15:00 · Qué mejoraría en una V2

Los tres primeros de la lista de `docs/04` §10, con el porqué:

1. **Regresión visual** — es el hueco de cobertura más grande que dejé consciente.
2. **Reporte unificado con histórico** — para responder con datos a "¿estamos mejor que
   el sprint pasado?".
3. **Sharding en CI** — bajar la regresión a la mitad de tiempo.

Cierre:

> "Lo que quería demostrar no es cuántos tests sé escribir, sino **por qué escribí estos
> y no otros**, y que la solución es ejecutable, mantenible y honesta sobre sus límites."

---

## Checklist antes de grabar

- [ ] Los dos entornos locales levantados (o acceso a los sitios públicos)
- [ ] `web/`, `api/` y `mobile/` con dependencias instaladas
- [ ] Reporte HTML de Playwright y `karate-summary.html` ya generados, para no esperar en vivo
- [ ] Terminal con fuente grande y el repositorio abierto en el editor
- [ ] Duración: si se pasa de 15 min, recortar la ejecución en vivo (mostrar el reporte ya generado)
