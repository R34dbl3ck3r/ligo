@api @booking
Feature: API-02 | Creación de reservas (POST /booking)

# Riesgo cubierto: es la operación que da de alta el negocio. Un fallo aquí
# significa reservas perdidas o creadas con datos incorrectos.
# Técnicas: partición de equivalencia, valores límite y validación de contrato.

  Background:
    * url baseUrl
    * def newBooking = read('classpath:booker/common/booking-builder.js')
    * def bookingSchema = read('classpath:booker/data/booking-schema.json')

  @smoke @p0
  Scenario: se crea una reserva y la respuesta refleja exactamente lo enviado
    * def payload = newBooking()

    Given path 'booking'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And request payload
    When method post
    Then status 200
    And match response.bookingid == '#number'
    # Validación funcional: la respuesta debe devolver el mismo recurso creado
    And match response.booking == payload

  @regression @p1 @contract
  Scenario: la reserva creada cumple el contrato publicado
    * def payload = newBooking()

    Given path 'booking'
    And request payload
    When method post
    Then status 200
    # Validación contractual: tipos y estructura, independientes de los valores
    And match response.booking == bookingSchema

  @regression @p1
  Scenario: additionalneeds es opcional
    * def payload = newBooking()
    * remove payload.additionalneeds

    Given path 'booking'
    And request payload
    When method post
    Then status 200
    And match response.booking.additionalneeds == '#notpresent'
    And match response.booking.firstname == payload.firstname

  @regression @p1
  Scenario Outline: falta el campo obligatorio <campo>
    * def payload = newBooking()
    * eval delete payload['<campo>']

    Given path 'booking'
    And request payload
    When method post
    # HALLAZGO BUG-API-02: la API responde 500 (error interno) ante un payload
    # inválido, cuando lo correcto sería 400 con el detalle del campo faltante.
    Then status 500

    Examples:
      | campo       |
      | firstname   |
      | lastname    |
      | totalprice  |
      | depositpaid |

  @regression @p2
  Scenario Outline: valores límite de totalprice (<descripcion>)
    * def payload = newBooking({ totalprice: <precio> })

    Given path 'booking'
    And request payload
    When method post
    Then status 200
    And match response.booking.totalprice == <precio>

    Examples:
      | descripcion         | precio     |
      | mínimo válido (0)   | 0          |
      | valor alto          | 999999     |

  @regression @p2
  Scenario: se acepta un precio negativo (regla de negocio no validada)
    * def payload = newBooking({ totalprice: -100 })

    Given path 'booking'
    And request payload
    When method post
    # HALLAZGO BUG-API-03: la API acepta importes negativos. No hay regla de
    # negocio que impida una reserva con precio < 0.
    Then status 200
    And match response.booking.totalprice == -100
