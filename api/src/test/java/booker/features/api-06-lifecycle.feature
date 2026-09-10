@api @e2e
Feature: API-06 | Ciclo de vida completo y persistencia de la reserva

# Escenario de mayor valor de negocio: recorre el flujo de referencia
# Autenticación -> Crear -> Consultar -> Actualizar -> Eliminar,
# verificando la PERSISTENCIA en cada paso con una petición independiente.
# Técnica: prueba de transición de estados sobre el recurso `booking`.

  Background:
    * url baseUrl
    * def newBooking = read('classpath:booker/common/booking-builder.js')

  @smoke @p0
  Scenario: una reserva se crea, se consulta, se actualiza y se elimina
    # 1. Autenticación
    Given path 'auth'
    And request { username: '#(username)', password: '#(password)' }
    When method post
    Then status 200
    * def token = response.token

    # 2. Creación
    * def payload = newBooking()
    Given path 'booking'
    And header Content-Type = 'application/json'
    And request payload
    When method post
    Then status 200
    * def bookingId = response.bookingid
    And match response.booking == payload

    # 3. Consulta: el dato persiste tal cual se creó
    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response == payload

    # 4. Aparece en el listado de identificadores
    Given path 'booking'
    And param firstname = payload.firstname
    When method get
    Then status 200
    And match response contains { bookingid: '#(bookingId)' }

    # 5. Actualización total
    * def updated = newBooking({ firstname: payload.firstname, totalprice: 1234 })
    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    And header Content-Type = 'application/json'
    And request updated
    When method put
    Then status 200

    # 6. La actualización persiste
    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response.totalprice == 1234

    # 7. Eliminación
    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    When method delete
    Then status 201

    # 8. El recurso ya no existe (persistencia del borrado)
    Given path 'booking', bookingId
    When method get
    Then status 404
