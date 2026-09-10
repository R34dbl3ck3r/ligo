@ignore
Feature: Alta de reserva reutilizable (precondición)

# Precondición vía API, no vía UI ni vía otro test: cada escenario crea su
# propio dato y queda aislado del resto (pueden ejecutarse en paralelo).

  Background:
    * url baseUrl

  Scenario: crear
    Given path 'booking'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And request booking
    When method post
    Then status 200
    * def id = response.bookingid
    * def created = response.booking
