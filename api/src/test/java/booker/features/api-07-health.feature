@api @health
Feature: API-07 | Disponibilidad del servicio (GET /ping)

# Se ejecuta en primer lugar en el pipeline: si el entorno no responde,
# el resto de la suite se aborta con un mensaje claro en vez de producir
# 40 fallos rojos que no significan nada (falsos positivos de indisponibilidad).

  @smoke @p0 @health
  Scenario: el servicio responde al health check
    Given url baseUrl
    And path 'ping'
    When method get
    Then status 201
    And assert responseTime < 15000
