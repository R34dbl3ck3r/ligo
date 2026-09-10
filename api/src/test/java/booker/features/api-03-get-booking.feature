@api @booking
Feature: API-03 | Consulta de reservas (GET /booking, GET /booking/{id})

# Riesgo cubierto: la consulta alimenta el resto de operaciones y los listados
# del back-office. Se valida contrato, filtrado y comportamiento ante id inexistente.

  Background:
    * url baseUrl
    * def newBooking = read('classpath:booker/common/booking-builder.js')
    * def bookingSchema = read('classpath:booker/data/booking-schema.json')

  @smoke @p0
  Scenario: el listado devuelve identificadores con el contrato esperado
    Given path 'booking'
    When method get
    Then status 200
    And match response == '#[_ > 0]'
    And match each response == { bookingid: '#number' }

  @smoke @p0
  Scenario: se recupera una reserva recién creada por su id
    * def payload = newBooking()
    * def created = call read('classpath:booker/common/create-booking.feature') { booking: '#(payload)' }

    Given path 'booking', created.id
    And header Accept = 'application/json'
    When method get
    Then status 200
    And match response == payload
    And match response == bookingSchema

  @regression @p1
  Scenario: el filtro por nombre y apellido devuelve sólo la reserva buscada
    * def payload = newBooking()
    * def created = call read('classpath:booker/common/create-booking.feature') { booking: '#(payload)' }

    Given path 'booking'
    And param firstname = payload.firstname
    And param lastname = payload.lastname
    When method get
    Then status 200
    And match response contains { bookingid: '#(created.id)' }
    # Los datos del builder son únicos por ejecución: el filtro debe devolver 1
    And match response == '#[1]'

  @regression @p2
  Scenario: consultar un id inexistente devuelve 404
    Given path 'booking', 99999999
    When method get
    Then status 404

  @regression @p2 @contract
  Scenario: la API soporta negociación de contenido XML
    * def payload = newBooking()
    * def created = call read('classpath:booker/common/create-booking.feature') { booking: '#(payload)' }

    # `configure headers` sustituye la cabecera global fijada en karate-config.js
    * configure headers = { Accept: 'application/xml' }
    Given path 'booking', created.id
    When method get
    Then status 200
    # El cuerpo sí es XML válido y se puede consultar con XPath...
    And match response /booking/firstname == payload.firstname
    # En XML todo llega como texto: se compara contra la representación en cadena
    And match response /booking/totalprice == payload.totalprice + ''
    # ...pero HALLAZGO BUG-API-07: la respuesta se sirve como `text/html`
    # en lugar de `application/xml`, lo que rompe a los clientes que parsean
    # según la cabecera. Se asevera el comportamiento real y se reporta.
    And match header Content-Type contains 'text/html'
