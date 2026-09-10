@api @booking
Feature: API-04 | Actualización de reservas (PUT y PATCH /booking/{id})

# Riesgo cubierto: una actualización mal aplicada corrompe una reserva ya
# confirmada. Se valida autorización, actualización total, parcial y persistencia.

  Background:
    * url baseUrl
    * def newBooking = read('classpath:booker/common/booking-builder.js')
    # callonce: un único token para toda la feature (rendimiento sin acoplamiento)
    * def auth = callonce read('classpath:booker/common/auth.feature')
    * def token = auth.token
    * def payload = newBooking()
    * def created = call read('classpath:booker/common/create-booking.feature') { booking: '#(payload)' }
    * def bookingId = created.id

  @smoke @p0
  Scenario: PUT reemplaza la reserva completa y el cambio persiste
    * def updated = newBooking({ firstname: 'Actualizado', totalprice: 777, additionalneeds: 'Late checkout' })

    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And request updated
    When method put
    Then status 200
    And match response == updated

    # Persistencia: se vuelve a consultar el recurso en una petición independiente
    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response == updated

  @regression @p1
  Scenario: PATCH modifica sólo los campos enviados
    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    And header Content-Type = 'application/json'
    And request { totalprice: 999 }
    When method patch
    Then status 200
    And match response.totalprice == 999
    And match response.firstname == payload.firstname
    And match response.bookingdates == payload.bookingdates

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response.totalprice == 999
    And match response.lastname == payload.lastname

  @regression @p0 @security
  Scenario Outline: <metodo> sin token es rechazado
    Given path 'booking', bookingId
    And header Content-Type = 'application/json'
    And request { firstname: 'Intruso' }
    When method <metodo>
    Then status 403

    # El recurso no debe haber cambiado
    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response.firstname == payload.firstname

    Examples:
      | metodo |
      | put    |
      | patch  |

  @regression @p1 @security
  Scenario: PUT acepta autenticación básica como alternativa al token
    * def updated = newBooking({ firstname: 'ConBasicAuth' })
    * def buildBasicAuth = read('classpath:booker/common/basic-auth.js')
    * def basic = buildBasicAuth({ username: username, password: password })

    Given path 'booking', bookingId
    And header Authorization = basic
    And header Content-Type = 'application/json'
    And request updated
    When method put
    Then status 200
    And match response.firstname == 'ConBasicAuth'

  @regression @p1
  Scenario: PUT con payload incompleto es rechazado por validación
    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    And header Content-Type = 'application/json'
    And request { firstname: 'Solo nombre' }
    When method put
    Then status 400
