/**
 * Construye la cabecera `Authorization: Basic ...` a partir de las credenciales
 * de configuración. Se aísla en un helper para no repetir la codificación
 * Base64 (y su interoperabilidad Java/JS) dentro de los `.feature`.
 */
function (credentials) {
  var Base64 = Java.type('java.util.Base64');
  var raw = credentials.username + ':' + credentials.password;
  var bytes = new java.lang.String(raw).getBytes('UTF-8');
  return 'Basic ' + Base64.getEncoder().encodeToString(bytes);
}
