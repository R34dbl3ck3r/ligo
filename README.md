[README.md](https://github.com/user-attachments/files/32038097/README.md)
# Prueba Técnica QA Automation — Web · API · Mobile

Solución completa para la evaluación de automatización de pruebas en tres capas:
**Web** (SauceDemo · Playwright + TypeScript), **API** (Restful Booker · Karate DSL) y
**Mobile** (My Demo App Android · Appium + WebdriverIO), con CI/CD en GitHub Actions.

> **Criterio que guía toda la solución:** no busca cantidad de casos automatizados, sino
> **cubrir lo que tiene impacto de negocio, justificar cada decisión y dejar una base
> mantenible**. Lo que se decidió *no* automatizar está documentado igual de bien que lo
> que sí.

---

## 📊 Estado de la ejecución

Ejecutado el **9 de septiembre de 2026** contra los **entornos públicos reales**.

| Capa | Sistema bajo prueba | Escenarios | Resultado | Reporte |
|---|---|---|---|---|
| Web (Playwright · Chromium) | `www.saucedemo.com` | 25 | ✅ **25/25** en 17.9 s | `evidence/web/reports/playwright-html/index.html` |
| API (Karate 1.5.1) | `restful-booker.herokuapp.com` | 31 | ✅ **31/31** en 7.8 s | `evidence/api/reports/karate/karate-summary.html` |
| Mobile (Appium + WDIO) | My Demo App 2.2.0 · emulador Pixel 6 / Android 13 | 11 | ⚠️ **9/11** en 3.0 min | `evidence/mobile/reports/allure-report/index.html` |

Subconjuntos `@smoke` (el gate que corre en cada Pull Request): Web **3/3**, API **8/8**.

Índice navegable de todas las evidencias: [`evidence/README.md`](evidence/README.md).

**10 defectos reales detectados** y documentados en [`docs/07-hallazgos.md`](docs/07-hallazgos.md):
los 8 de Web y API se reprodujeron **en los entornos públicos** y los 2 de Mobile **en el
emulador**, no en copias locales.

---

## 📚 Documentación

Empieza por aquí: cada documento responde a un punto evaluado del enunciado.

| Documento | Responde a |
|---|---|
| [`01-analisis-y-riesgos.md`](docs/01-analisis-y-riesgos.md) | Análisis de las 3 apps, matriz de riesgos, priorización y **qué decidí no automatizar** |
| [`02-diseno-de-pruebas.md`](docs/02-diseno-de-pruebas.md) | Tablas del apartado 5.2 (ID · Escenario · Prioridad · Técnica · Automatizado) y justificación de cada técnica |
| [`03-matriz-trazabilidad.md`](docs/03-matriz-trazabilidad.md) | Apartado 5.3: requerimiento → caso → test automatizado |
| [`04-decisiones-tecnicas.md`](docs/04-decisiones-tecnicas.md) | **Las 10 preguntas del apartado 6**, con ejemplos del código |
| [`05-estrategia-ci-cd.md`](docs/05-estrategia-ci-cd.md) | Qué se ejecuta en Pull Request, Merge y Nightly, y por qué |
| [`06-guion-video.md`](docs/06-guion-video.md) | Guion minutado para el video del apartado 7 |
| [`07-hallazgos.md`](docs/07-hallazgos.md) | Defectos encontrados, con evidencia y tratamiento en la suite |
| [`08-ejecucion-y-evidencias.md`](docs/08-ejecucion-y-evidencias.md) | Apartado 5.5: reportes, capturas, logs y trace |

---

## 🗂️ Estructura del repositorio

```
.
├── web/                        Playwright + TypeScript (POM + fixtures)
│   ├── playwright.config.ts
│   ├── src/
│   │   ├── config/env.ts       Configuración por entorno
│   │   ├── pages/              Page Objects
│   │   ├── components/         Componentes reutilizables (cabecera)
│   │   ├── fixtures/           Inyección de dependencias
│   │   ├── data/               Usuarios, productos, datos de checkout
│   │   └── utils/              Siembra de estado, aritmética de importes
│   ├── scripts/                Captura de evidencias, resumen JUnit
│   └── tests/                  web-01 … web-07
│
├── api/                        Karate DSL (Java + Maven)
│   ├── pom.xml
│   └── src/test/java/
│       ├── karate-config.js    Entornos, credenciales, cabeceras, timeouts
│       └── booker/
│           ├── BookerRunnerTest.java
│           ├── common/         auth, precondiciones, builder de datos
│           ├── data/           Schema del contrato
│           └── features/       api-01 … api-07
│
├── mobile/                     Appium + WebdriverIO + TypeScript
│   ├── config/                 shared · android local · cloud (granja)
│   ├── src/
│   │   ├── screens/            Screen Objects
│   │   ├── data/               Usuarios, productos, datos de checkout
│   │   └── utils/selectors.ts  Estrategia de localizadores
│   └── tests/                  mob-01 … mob-04
│
├── docs/                       Documentación de la evaluación
├── evidence/                   Reportes, capturas y resultados
└── .github/workflows/          pull-request · merge-main · nightly
```

---

## ✅ Prerrequisitos

| Herramienta | Versión | Necesaria para |
|---|---|---|
| Node.js | ≥ 20 | Web y Mobile |
| Java JDK | 17 o 21 | API (Karate) y Appium |
| Maven | ≥ 3.9 | API |
| Android SDK + emulador o dispositivo | API 30+ | Mobile |
| Appium | 2.x (se instala con `npm ci` en `mobile/`) | Mobile |

---

## 🚀 Ejecución

### Web

```bash
cd web
npm ci
npx playwright install --with-deps chromium

npm test                 # suite completa
npm run test:smoke       # sólo @smoke  (lo que corre en un Pull Request)
npm run test:regression  # sólo @regression
npm run report           # abre el reporte HTML

# Contra otro entorno:
BASE_URL=https://www.saucedemo.com npm test
```

### API

```bash
cd api
mvn test                                        # suite completa
mvn test -Dkarate.options="--tags @smoke"       # sólo smoke
mvn test -Dbooker.baseUrl=http://localhost:3001 # otro entorno
# Reporte: target/karate-reports/karate-summary.html
```

<details>
<summary>Alternativa sin acceso a Maven Central (jar standalone de Karate)</summary>

```bash
curl -L -o karate.jar \
  https://github.com/karatelabs/karate/releases/download/v1.5.1/karate-1.5.1.jar
java -cp karate.jar:src/test/java com.intuit.karate.Main src/test/java/booker/features -T 4
```
</details>

### Mobile

```bash
cd mobile
npm ci
npx appium driver install uiautomator2

# 1. Descargar el APK desde las releases de saucelabs/my-demo-app-android
mkdir -p apps && mv ~/Downloads/mda-*.apk apps/

# 2. Arrancar un emulador (o conectar un dispositivo) y comprobarlo
adb devices

# 3. Ejecutar
npm test
APP_PATH=$PWD/apps/mda-2.2.0-25.apk ANDROID_DEVICE=emulator-5554 npm test
```

---

## 🔐 Variables de entorno

Ninguna credencial está en el repositorio. Todas tienen un valor por defecto público
(el que las propias aplicaciones de demo documentan) y se pueden sobreescribir:

| Variable | Capa | Por defecto |
|---|---|---|
| `BASE_URL` | Web | `https://www.saucedemo.com` |
| `SAUCE_PASSWORD` | Web | `secret_sauce` |
| `BOOKER_BASE_URL` / `-Dbooker.baseUrl` | API | `https://restful-booker.herokuapp.com` |
| `BOOKER_USERNAME` / `BOOKER_PASSWORD` | API | `admin` / `password123` |
| `APP_PATH`, `ANDROID_DEVICE`, `ANDROID_VERSION` | Mobile | ver `config/wdio.android.local.conf.ts` |
| `MDA_PASSWORD` | Mobile | `10203040` |
| `SAUCE_USERNAME` / `SAUCE_ACCESS_KEY` | Mobile (cloud) | — |

En CI llegan desde **GitHub Secrets**.

---

## 🏷️ Etiquetas y selección de pruebas

| Etiqueta | Significado |
|---|---|
| `@smoke` | Camino crítico. Se ejecuta en cada Pull Request |
| `@regression` | Suite completa. Se ejecuta al integrar en `main` |
| `@p0` `@p1` `@p2` | Prioridad por riesgo de negocio |
| `@security` | Control de acceso y autorización |
| `@contract` | Validación de contrato/schema |
| `@health` | Disponibilidad del entorno |
| `@known-issue` | Documenta un defecto real detectado (ver `docs/07`) |

---

## 🔄 CI/CD

| Workflow | Dispara | Ejecuta | Objetivo |
|---|---|---|---|
| `pull-request.yml` | PR a `main`/`develop` | Type-check + Web `@smoke` + API `@smoke` | < 10 min · **bloquea el merge** |
| `merge-main.yml` | Push a `main` | Web `@regression` + API completa | < 25 min |
| `nightly.yml` | Cron 02:00 (Lima), L-V | Web en 3 navegadores + API + **Mobile en emulador** | ~45 min |

Detalle y justificación en [`docs/05-estrategia-ci-cd.md`](docs/05-estrategia-ci-cd.md).

---

## ⚠️ Alcance y limitaciones

- Las tres aplicaciones son **servicios públicos de terceros**: pueden estar caídos.
- La suite incluye un *health check* (`@health`) y timeouts generosos para
  distinguir un fallo del entorno de un defecto del producto.
- **Mobile pasa 9 de 11**: MOB-02 (carrito, P1) queda abierto por un defecto del propio
  framework al abrir productos que exigen desplazar el catálogo. Está aislado en
  `ProductsScreen.openProduct()` y documentado en [`docs/08`](docs/08-ejecucion-y-evidencias.md) §8.6.
- **Regresión visual y rendimiento** quedan fuera del alcance por decisión documentada
  (ver [`docs/01`](docs/01-analisis-y-riesgos.md) §1.5), no por omisión.
- **No hay credenciales, tokens ni datos sensibles** en el repositorio.
