@ignore
Feature: Obtención de token reutilizable

# Feature auxiliar invocada con `callonce`: el token se genera UNA sola vez por
# ejecución y se comparte entre escenarios. Evita N llamadas a /auth (más rápido)
# sin crear dependencias entre pruebas: cada escenario sigue siendo autónomo.

  Background:
    * url baseUrl

  Scenario: crear token
    Given path 'auth'
    And request { username: '#(username)', password: '#(password)' }
    When method post
    Then status 200
    And match response.token == '#string'
    * def token = response.token
