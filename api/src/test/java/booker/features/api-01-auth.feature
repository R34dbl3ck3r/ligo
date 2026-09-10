@api @auth
Feature: API-01 | Autenticación (POST /auth)

# Riesgo cubierto: sin token no se puede modificar ni borrar ninguna reserva.
# Es la puerta de entrada a las operaciones de escritura -> prioridad P0.
# Técnica: partición de equivalencia sobre el par usuario/contraseña.

  Background:
    * url baseUrl

  @smoke @p0
  Scenario: credenciales válidas devuelven un token utilizable
    Given path 'auth'
    And request { username: '#(username)', password: '#(password)' }
    When method post
    Then status 200
    And match response == { token: '#string' }
    And match response.token == '#regex ^[a-f0-9]{15}$'

  @regression @p1
  Scenario Outline: credenciales inválidas no generan token (<caso>)
    Given path 'auth'
    And request { username: '<user>', password: '<pass>' }
    When method post
    # HALLAZGO BUG-API-01: la API responde 200 con {"reason":"Bad credentials"}
    # en lugar de 401. Se asevera el comportamiento real y se documenta el
    # defecto en docs/07-hallazgos.md, en vez de ocultarlo.
    Then status 200
    And match response == { reason: 'Bad credentials' }
    And match response.token == '#notpresent'

    Examples:
      | caso                  | user   | pass         |
      | password incorrecta   | admin  | wrong        |
      | usuario inexistente   | ghost  | password123  |
      | ambos incorrectos     | ghost  | wrong        |
      | credenciales vacías   |        |              |
