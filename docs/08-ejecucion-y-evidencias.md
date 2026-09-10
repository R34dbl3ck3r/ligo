# 8. Ejecución y evidencias

> Punto evaluado: **"Implementa la solución y genera evidencias de ejecución"** (Reto Web,
> punto 5), **"Genera evidencias y reportes"** (Reto API, punto 5) e
> **"Implementa los escenarios seleccionados y genera evidencias"** (Reto Mobile, punto 5).

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
| **Mobile** (Appium + WDIO) | My Demo App 2.2.0 · emulador Pixel 6 / Android 13 | 11 pruebas | ⚠️ **9/11** | 3.0 min | `evidence/mobile/reports/allure-report/index.html` |

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
├── api/
│   └── reports/karate/
│       ├── karate-summary.html       Resumen de la suite
│       ├── karate-tags.html          Resultados por etiqueta
│       ├── karate-timeline.html      Línea de tiempo (paralelismo, 4 hilos)
│       └── src.test.java.booker.features.*.html   Detalle petición/respuesta de cada escenario
└── mobile/
    ├── reports/allure-report/        Reporte Allure (pasos, capturas ante fallo)
    └── screenshots/                  Emulador Pixel 6 / Android 13
        ├── 01-catalogo.png
        ├── 02-ficha-producto.png
        ├── 03-anadido-al-carrito.png
        ├── 04-carrito.png            <- Total: 1 Items  $29.99
        └── 05-menu-lateral.png
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

## 8.6 Mobile — ejecutado en emulador real

La capa `mobile/` **sí se ejecutó** en esta entrega, contra un emulador Android
levantado en la máquina de desarrollo:

| | |
|---|---|
| Dispositivo | AVD `qa_pixel6_a33` · perfil Pixel 6 |
| Sistema | Android 13 (API 33) · `google_apis;x86_64` |
| Aceleración | WHPX (arranque en ~40 s, sin ventana) |
| Aplicación | My Demo App **2.2.0** (versionCode 25), APK de la release oficial |
| Resultado | **9 de 11** pruebas · 3.0 min |

**Qué pasa:** MOB-01 (compra completa, P0) ✅ · MOB-03 (login, 5 casos) ✅ ·
MOB-04 (ordenamiento, 3 casos) ✅.

**Qué falla:** MOB-02 (carrito, 2 casos, P1). El escenario abre un producto que
exige desplazar el catálogo; la ficha no llega a abrirse y el segundo caso cae
en cascada. Es un defecto **del framework de pruebas, no de la aplicación**:
está aislado en `ProductsScreen.openProduct()` y no afecta al resto de la suite.
Se deja abierto y documentado en lugar de silenciarlo.

### Lo que sólo aparece ejecutando

Cuatro supuestos del código no sobrevivieron al contacto con la app real. Los
tres primeros se corrigieron; el cuarto sigue abierto:

1. **`Reset App State` encadena dos diálogos** —confirmación y acuse— que
   comparten `android:id/button1`. Sin confirmar ambos, la app se queda en el
   diálogo y ninguna pantalla posterior aparece. Hacía fallar el `beforeEach` de
   las cuatro suites.
2. **El título del producto no es clicable.** En el catálogo sólo lo es la
   imagen (`productIV`). Pulsar el texto no navegaba a ninguna parte.
3. **El catálogo es una rejilla de dos columnas**, no una lista: dos productos
   comparten coordenada vertical, así que emparejar por índice las listas de
   títulos e imágenes es frágil.
4. **Textos de menú desactualizados**: la app 2.2.0 usa `WebView` y `FingerPrint`,
   no `Webview` ni `Biometrics`.

También se descubrió que `parentElement()` de WebdriverIO **no sirve en Android**:
se apoya en el ejecutor de JavaScript, que UiAutomator2 no implementa. La
resolución padre-hijo se hace con XPath relativo anclado en el texto.

### Defecto de CI corregido

`mobile/package-lock.json` estaba **desincronizado** con `package.json` (faltaban
las dependencias opcionales `@img/sharp-*`). `npm ci` fallaba, de modo que los
jobs de mobile de `pull-request.yml` y `nightly.yml` habrían roto en el primer
paso. Lock regenerado y verificado con `npm ci --dry-run`.

### Reproducir

```bash
# 1. SDK: imagen de sistema y AVD
sdkmanager "system-images;android-33;google_apis;x86_64"
avdmanager create avd -n qa_pixel6_a33 -k "system-images;android-33;google_apis;x86_64" -d pixel_6
emulator -avd qa_pixel6_a33 -no-window -no-audio -no-snapshot -gpu swiftshader_indirect

# 2. APK de la última release oficial
cd mobile && mkdir -p apps
curl -sL -o apps/mda.apk "$(curl -s https://api.github.com/repos/saucelabs/my-demo-app-android/releases/latest   | grep browser_download_url | grep '\.apk' | head -1 | cut -d '"' -f 4)"

# 3. Suite
npm ci
APP_PATH=$PWD/apps/mda.apk ANDROID_VERSION=13 npm test
npm run report      # Allure
```
