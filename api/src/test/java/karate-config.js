/**
 * Configuración global de Karate.
 *
 * - `karate.env` selecciona el entorno (-Dkarate.env=demo|local|qa).
 * - Las credenciales NO se versionan como secreto: en la API pública de
 *   Restful Booker son datos de demo documentados, pero se leen igualmente de
 *   propiedades/variables de entorno para que en un proyecto real lleguen
 *   desde GitHub Secrets sin tocar el código.
 * - `configure retry` da una política de reintento explícita para endpoints
 *   lentos (el entorno demo está en un free tier que puede tardar en despertar).
 */
function fn() {
  var env = karate.env || 'demo';
  karate.log('karate.env =', env);

  var config = {
    env: env,
    baseUrl: 'https://restful-booker.herokuapp.com',
    username: karate.properties['booker.username'] || java.lang.System.getenv('BOOKER_USERNAME') || 'admin',
    password: karate.properties['booker.password'] || java.lang.System.getenv('BOOKER_PASSWORD') || 'password123'
  };

  if (env === 'local') {
    config.baseUrl = karate.properties['booker.baseUrl'] || java.lang.System.getenv('BOOKER_BASE_URL') || 'http://localhost:3001';
  }

  if (karate.properties['booker.baseUrl']) {
    config.baseUrl = karate.properties['booker.baseUrl'];
  } else if (java.lang.System.getenv('BOOKER_BASE_URL')) {
    config.baseUrl = java.lang.System.getenv('BOOKER_BASE_URL');
  }

  // La API sólo sabe serializar la respuesta si recibe un Accept conocido:
  // sin esta cabecera devuelve 418 "I'm a teapot" (ver docs/07-hallazgos.md,
  // BUG-API-06). Se fija globalmente para no repetirla en cada escenario.
  karate.configure('headers', { Accept: 'application/json' });

  karate.configure('connectTimeout', 20000);
  karate.configure('readTimeout', 20000);
  // Reintento de sincronización: sólo para condiciones asíncronas explícitas
  // (`retry until`), nunca como parche global a tests inestables.
  karate.configure('retry', { count: 3, interval: 2000 });

  return config;
}
