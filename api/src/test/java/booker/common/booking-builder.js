/**
 * Factory de reservas (patrón Test Data Builder).
 *
 * Genera datos únicos por ejecución para que las pruebas puedan correr en
 * paralelo y de forma repetida contra un entorno compartido sin colisionar.
 * Acepta un objeto de sobreescritura para los casos que necesitan un valor
 * concreto (límites, particiones inválidas, etc.).
 */
function (overrides) {
  var uuid = java.util.UUID.randomUUID().toString().substring(0, 8);
  var base = {
    firstname: 'QA' + uuid,
    lastname: 'Aybar' + uuid,
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: '2026-11-01',
      checkout: '2026-11-05'
    },
    additionalneeds: 'Breakfast'
  };

  if (overrides) {
    for (var key in overrides) {
      base[key] = overrides[key];
    }
  }

  return base;
}
