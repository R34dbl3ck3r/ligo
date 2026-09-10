# Capa API — Restful Booker (Karate DSL)

## Estructura

```
src/test/java/
├── karate-config.js              Entornos, credenciales, cabeceras y timeouts
└── booker/
    ├── BookerRunnerTest.java     Runner JUnit 5 (paralelo x4)
    ├── common/
    │   ├── auth.feature          Token compartido (`callonce`)
    │   ├── create-booking.feature Precondición reutilizable
    │   ├── booking-builder.js    Test Data Builder (datos únicos por ejecución)
    │   └── basic-auth.js         Codificación de la cabecera Basic
    ├── data/
    │   └── booking-schema.json   Contrato de la reserva
    └── features/
        ├── api-01-auth.feature
        ├── api-02-create-booking.feature
        ├── api-03-get-booking.feature
        ├── api-04-update-booking.feature
        ├── api-05-delete-booking.feature
        ├── api-06-lifecycle.feature
        └── api-07-health.feature
```

## Ejecución

```bash
mvn test                                          # todo
mvn test -Dkarate.options="--tags @smoke"         # sólo smoke
mvn test -Dkarate.options="--tags @security"      # sólo autorización
mvn test -Dbooker.baseUrl=http://localhost:3001   # otro entorno
```

Reporte: `target/karate-reports/karate-summary.html` (incluye petición y respuesta
completas de cada llamada, más el `curl` equivalente).

## Por qué Karate

El enunciado lo exige, pero además encaja: es un DSL declarativo donde la aserción de
JSON (`match`) y la validación de contrato por tipos son de primera clase, con
paralelismo y reportes incluidos y sin necesidad de escribir POJOs ni serializadores.

## Convenciones

- **Un feature por recurso/operación**, con el ID del caso en el nombre del archivo.
- **`callonce`** sólo para recursos idempotentes (el token). Nunca para datos que un
  escenario modifica.
- **Cada escenario crea sus propios datos** con `booking-builder.js`, lo que permite
  ejecutar en paralelo contra un entorno compartido.
- Los defectos detectados se aseveran con su comportamiento real y un comentario
  `HALLAZGO BUG-API-XX` que enlaza con `docs/07-hallazgos.md`.
