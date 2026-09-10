# 5. Estrategia de CI/CD

> Punto evaluado: **"Implementar GitHub Actions. Explica qué pruebas ejecutarías en Pull Request, Merge y Nightly/Regression"** (aparece en los tres retos).

El principio que ordena todo el pipeline: **cada etapa tiene un dueño, un tiempo máximo
y una consecuencia distinta**. Si un pipeline tarda más de lo que la gente está dispuesta
a esperar, la gente lo salta.

| Etapa | Workflow | Dispara | Qué ejecuta | Objetivo de tiempo | Si falla |
|---|---|---|---|---|---|
| **Pull Request** | `.github/workflows/pull-request.yml` | `pull_request` a `main`/`develop` | Type-check (web+mobile) · Web `@smoke` (Chromium) · API `@smoke` | **< 10 min** | **Bloquea el merge** |
| **Merge** | `.github/workflows/merge-main.yml` | `push` a `main` | Web `@regression` completa · API completa | < 25 min | Alerta al equipo; se revierte o se corrige en caliente |
| **Nightly** | `.github/workflows/nightly.yml` | Cron 07:00 UTC (02:00 Lima), L-V | Web en Chromium + Firefox + viewport móvil · API completa · **Mobile en emulador Android** | ~45 min | Se triaja por la mañana; no bloquea a nadie |

---

## 5.1 Pull Request — feedback rápido

**Qué ejecuta y por qué:**

- **Type-check de Web y Mobile.** Es la comprobación más barata que existe (segundos) y
  atrapa el error más común en un framework tipado: un Page Object modificado que rompe
  a sus consumidores. Se ejecuta incluso para la capa Mobile, cuyos tests no corren en
  esta etapa: **el código se valida aunque no se ejecute**.
- **Web `@smoke`** (Chromium): el flujo de compra completo y los P0 de login y checkout.
- **API `@smoke`**: 8 escenarios — health check, auth, alta, consulta, actualización,
  borrado y ciclo de vida.

**Qué NO ejecuta y por qué:**

- Cross-browser: multiplica el tiempo por tres para detectar una clase de fallo que rara
  vez se introduce en un PR de lógica.
- Mobile: el arranque del emulador (~5 min) y su fragilidad convertirían el gate en ruido.
- Los P2: por definición no deben bloquear un merge.

**Detalles de implementación que importan:**

- `concurrency` con `cancel-in-progress`: un push nuevo cancela la ejecución anterior del
  mismo PR. Ahorra minutos de CI y evita reportes de una versión que ya no existe.
- Caché de `npm` y de Maven vía `setup-node`/`setup-java`.
- El reporte HTML y el JUnit se suben como artefacto **siempre** (`if: always()`), que es
  justo cuando más se necesitan: cuando ha fallado.

---

## 5.2 Merge — red de seguridad

Al integrar en `main` se ejecuta la regresión completa: todo lo etiquetado
`@regression` en Web (25 ejecuciones) y la suite completa de API (31 escenarios).

- `retries: 1` activo sólo aquí y en nightly (`retries: IS_CI ? 1 : 0`), con
  `trace: 'on-first-retry'`: el reintento es una red, y el trace deja la evidencia para
  investigar por qué hizo falta.
- Un paso de **resumen en el propio job** (`scripts/junit-summary.py`) escribe
  `✅ 25/25 pasaron` en el `GITHUB_STEP_SUMMARY`, para no tener que descargar el
  artefacto sólo para ver el marcador.

---

## 5.3 Nightly — cobertura amplia

Se ejecuta de madrugada, cuando nadie espera:

- **Web en matriz** (`chromium`, `firefox`, `mobile-chrome`) con `fail-fast: false`, para
  que el fallo en un navegador no oculte el resultado de los otros.
- **API completa.**
- **Mobile en emulador Android real** (`reactivecircus/android-emulator-runner`):
  descarga el APK de la última *release* publicada, habilita KVM, arranca un Pixel 6 con
  API 33 sin animaciones y ejecuta la suite.
- Un job final de **notificación** que resume el estado de las tres capas.

---

## 5.4 Gestión de secretos

Ninguna credencial vive en el repositorio. El pipeline las inyecta desde *GitHub Secrets*:

| Secreto | Uso |
|---|---|
| `BOOKER_USERNAME` / `BOOKER_PASSWORD` | Autenticación de la API |
| `SAUCE_USERNAME` / `SAUCE_ACCESS_KEY` | Granja de dispositivos (opcional) |

El código las lee siempre a través de una capa de configuración
(`web/src/config/env.ts`, `api/src/test/java/karate-config.js`,
`mobile/src/data/users.ts`), nunca directamente en un test.

---

## 5.5 Tratamiento de la indisponibilidad de terceros

El enunciado lo pide explícitamente: *"documenta cualquier indisponibilidad o
comportamiento externo que afecte la ejecución"*.

Las tres aplicaciones son servicios públicos de terceros y **pueden caerse o dormirse**
(Restful Booker corre en un *free tier*). La estrategia:

1. **Health check antes de la suite** (`API-07` y un paso `curl` en el workflow de PR).
   Si el entorno no responde, el pipeline emite un `::warning::` explicando que el fallo
   es del entorno, no del código. Sin esto, 31 escenarios rojos parecen 31 defectos.
2. **Timeouts generosos y reintentos configurados** en `karate-config.js`
   (`connectTimeout`/`readTimeout` 20 s, `retry` 3×2 s) para absorber el arranque en frío.
3. **Parametrización del entorno**: cualquier capa puede apuntar a un despliegue local
   o a un *mock* cambiando una variable (`BASE_URL`, `-Dbooker.baseUrl`), sin tocar el
   código. Es la salida cuando el entorno público está caído y no se quiere dejar el
   pipeline en rojo por algo ajeno al producto. La entrega actual, en cambio, **sí se
   ejecutó contra los entornos públicos reales**
   (ver [`08-ejecucion-y-evidencias.md`](08-ejecucion-y-evidencias.md)).
4. **Separación en el reporte**: los fallos de disponibilidad se distinguen de los
   funcionales por la etiqueta `@health` y por el paso previo del workflow.
