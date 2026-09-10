@api @booking
Feature: API-05 | Eliminación de reservas (DELETE /booking/{id})

# Riesgo cubierto: borrado no autorizado o borrado que no llega a persistir.

  Background:
    * url baseUrl
    * def newBooking = read('classpath:booker/common/booking-builder.js')
    * def auth = callonce read('classpath:booker/common/auth.feature')
    * def token = auth.token
    * def payload = newBooking()
    * def created = call read('classpath:booker/common/create-booking.feature') { booking: '#(payload)' }
    * def bookingId = created.id

  @regression @p0 @security
  Scenario: sin token no se puede eliminar y la reserva sigue existiendo
    Given path 'booking', bookingId
    When method delete
    Then status 403

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response.firstname == payload.firstname

  @smoke @p0
  Scenario: con token la reserva se elimina y deja de estar disponible
    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    When method delete
    # HALLAZGO BUG-API-04: devuelve 201 Created en un borrado.
    # Lo correcto sería 200 OK o 204 No Content.
    Then status 201

    Given path 'booking', bookingId
    When method get
    Then status 404

  @regression @p2
  Scenario: eliminar una reserva inexistente
    Given path 'booking', 99999999
    And header Cookie = 'token=' + token
    When method delete
    # HALLAZGO BUG-API-05: devuelve 405 Method Not Allowed en lugar de 404.
    Then status 405
