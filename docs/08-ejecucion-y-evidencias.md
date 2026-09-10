# 8. Ejecución y evidencias

> Punto evaluado: **"Implementa la solución y genera evidencias de ejecución"** (Reto Web,
> punto 5) y **"Genera evidencias y reportes"** (Reto API, punto 5).

---

## 8.1 Resultados de esta entrega

Ejecución del **9 de septiembre de 2026** contra los **entornos públicos reales** que
indican los enunciados.

| Capa | Sistema bajo prueba | Ejecutado | Resultado | Tiempo | Reporte |
|---|---|---|---|---|---|
| **Web** (Playwright 1.56, Chromium) | `https://www.saucedemo.com` | 25 pruebas | ✅ **25/25** | 17.9 s | `evidence/web/reports/playwright-html/index.html` |
| **Web — sólo `@smoke`** (gate de Pull Request) | idem | 3 pruebas | ✅ **3/3** | 3.4 s | idem |
| **API** (Karate 1.5.1) | `https://restful-booker.herokuapp.com` | 31 escenarios · 7 features | ✅ **31/31** | 7.8 s | `evidence/api/reports/karate/karate-summary.html` |
| **API — sólo `@smoke`** (gate de Pull Request) | idem | 8 escenarios | ✅ **8/8** | 5.3 s | idem |
| **Mobile** (Appium + WDIO) | My Demo App Android | 11 pruebas | ⏸️ No ejecutado (fuera del alcance de estos dos retos; requiere emulador) | — | Código verificado con `tsc --noEmit` ✅ |

Las 25 pruebas Web incluyen **WEB-07, que falla de forma esperada** (`test.fail()`): es el
detector del defecto BUG-WEB-01. Playwright la contabiliza como *passed* porque falló
como se declaró que debía fallar. Si algún día corrigen el defecto, esa prueba pasará
"inesperadamente" y el pipeline avisará.

Capturas del flujo principal en `evidence/web/screenshots/` (6 imágenes, un paso por
imagen), tomadas del sitio público real.

---

## 8.2 Los defectos se reprodujeron en producción

Los 8 hallazgos de [`07-hallazgos.md`](07-hallazgos.md) que corresponden a Web y API
**se confirmaron contra los entornos públicos**, no contra una copia local:

- **BUG-WEB-01** (`problem_user` duplica precios en el resumen): reproducido en
  `www.saucedemo.com`. Es lo que hace fallar a WEB-07.
- **BUG-API-01 … BUG-API-07**: los 31 escenarios pasan precisamente porque aseveran el
  comportamiento **real** de `restful-booker.herokuapp.com` (auth inválida → `200`,
  payload incompleto → `500`, `DELETE` → `201`, borrado inexistente → `405`, XML servido
  como `text/html`, `418` sin cabecera `Accept`, importes negativos aceptados).

---

## 8.3 Evidencias incluidas en el repositorio

```
evidence/
├── web/
│   ├── reports/
│   │   ├── playwright-html/     Reporte HTML navegable (pasos, tiempos, adjuntos)
│   │   └── junit/results.xml    Formato JUnit para integrar con CI
│   └── screenshots/             Flujo principal, un paso por imagen
│       ├── 01-login.png
│       ├── 02-inventario.png
│       ├── 03-carrito.png
│       ├── 04-datos-envio.png
│       ├── 05-resumen-importes.png   <- Item total $45.98 + Tax $3.68 = Total $49.66
│       └── 06-confirmacion.png
└── api/
    └── reports/karate/
        ├── karate-summary.html       Resumen de la suite
        ├── karate-tags.html          Resultados por etiqueta
        ├── karate-timeline.html      Línea de tiempo (paralelismo, 4 hilos)
        └── src.test.java.booker.features.*.html   Detalle petición/respuesta de cada escenario
```

El reporte de Karate incluye **la petición y la respuesta completas de cada llamada**
(cabeceras, cuerpo y tiempo): es la evidencia más útil para discutir un defecto con
desarrollo, porque el reporte *es* el paso a paso reproducible.

---

## 8.4 Evidencia automática ante fallos (lo que ocurre en CI)

No hay que pedirla: está configurada.

| Herramienta | Qué se genera al fallar | Dónde |
|---|---|---|
| Playwright | Captura de pantalla, vídeo y **trace** (DOM, red, consola, paso a paso navegable con `npx playwright show-trace`) | `web/reports/artifacts/` |
| Playwright | Reporte HTML y JUnit siempre | `web/reports/` |
| Karate | HTML con petición/respuesta de cada llamada + JSON de Cucumber + JUnit XML | `api/target/karate-reports/` |
| Appium/WDIO | Captura adjunta al reporte Allure (`afterTest`) + log del servidor Appium | `mobile/reports/` |

En los tres workflows los artefactos se suben con `if: always()`, es decir, **también
—y sobre todo— cuando la ejecución falla**.

---

## 8.5 Cómo reproducir esta ejecución

```bash
# --- Web ---
cd web
npm ci
npx playwright install chromium
npx playwright test --project=chromium          # 25/25
npm run test:smoke -- --project=chromium        # 3/3  (lo que corre en un PR)
npm run report                                  # abre el reporte HTML

# Evidencias visuales
npx tsx scripts/capture-evidence.ts

# --- API ---
cd api
mvn test                                        # 31/31
mvn test -Dkarate.options="--tags @smoke"       # 8/8   (lo que corre en un PR)
# Reporte: target/karate-reports/karate-summary.html
```

`BASE_URL` y `-Dbooker.baseUrl` apuntan por defecto a los entornos públicos; se
sobreescriben para ejecutar contra un despliegue local o de staging sin tocar código.

<details>
<summary>Ejecución sin Maven (jar standalone de Karate)</summary>

Así se ejecutó esta entrega, porque la máquina no tenía Maven en el `PATH`. El resultado
es idéntico: mismo motor, mismos `.feature`, mismo reporte.

```bash
cd api
curl -L -o karate.jar \
  https://github.com/karatelabs/karate/releases/download/v1.5.1/karate-1.5.1.jar

# Linux/macOS  (separador de classpath ':')
java -cp karate.jar:src/test/java com.intuit.karate.Main src/test/java/booker/features -T 4
# Windows      (separador de classpath ';')
java -cp "karate.jar;src/test/java" com.intuit.karate.Main src/test/java/booker/features -T 4

# Sólo smoke
java -cp "karate.jar;src/test/java" com.intuit.karate.Main src/test/java/booker/features -t @smoke -T 4
```

Requiere **JDK 17 o superior** (esta ejecución usó OpenJDK 24). `karate.jar` está en
`.gitignore`: es una descarga, no una dependencia versionada.
</details>

<details>
<summary>Reutilizar un Chrome ya instalado en lugar de descargar Chromium</summary>

El script de evidencias acepta `BROWSER_CHANNEL` para usar un navegador ya presente en la
máquina (útil cuando la descarga de Playwright está bloqueada o es muy lenta):

```bash
BROWSER_CHANNEL=chrome npx tsx scripts/capture-evidence.ts
```

Para la suite completa, esta ejecución usó un override local no versionado
(`web/playwright.local.config.ts`, en `.gitignore`) que extiende la configuración
entregada y sólo cambia el navegador a `channel: 'chrome'`:

```bash
npx playwright test --config=playwright.local.config.ts
```

**La configuración entregada (`playwright.config.ts`) no se tocó.** En CI no se usa nada
de esto: los workflows instalan el navegador con `npx playwright install --with-deps`,
que es la forma reproducible.
</details>

---

## 8.6 Nota sobre Mobile

La capa `mobile/` (Appium + WebdriverIO) proviene de un alcance anterior y **no forma
parte de los dos retos de esta entrega** (Web y API). Se conserva en el repositorio
porque el workflow `nightly.yml` la incluye y su código está verificado estáticamente,
pero no se ejecutó: un emulador Android requiere virtualización por hardware (KVM), no
disponible en esta máquina.
