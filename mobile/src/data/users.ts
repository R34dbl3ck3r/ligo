export type MobileUser = {
  username: string;
  password: string;
  behaviour: string;
};

/**
 * Usuarios de My Demo App. La propia pantalla de login los muestra: son datos
 * de demo, no secretos. Aun así se leen de variable de entorno para no fijar
 * credenciales en el repositorio.
 */
const password = process.env.MDA_PASSWORD ?? '10203040';

export const users = {
  standard: {
    username: 'bod@example.com',
    password,
    behaviour: 'Usuario válido',
  },
  lockedOut: {
    username: 'alice@example.com',
    password,
    behaviour: 'Usuario bloqueado',
  },
  visual: {
    username: 'visual@example.com',
    password,
    behaviour: 'Usuario con defectos visuales',
  },
} as const satisfies Record<string, MobileUser>;

/**
 * Particiones inválidas del login. `field` indica en qué control muestra la
 * app el mensaje: el propio dato describe el comportamiento esperado y el test
 * queda libre de condicionales.
 */
export const invalidLogins: ReadonlyArray<{
  id: string;
  username: string;
  password: string;
  field: 'username' | 'password';
  expectedError: string;
}> = [
  {
    id: 'usuario vacío',
    username: '',
    password,
    field: 'username',
    expectedError: 'Username is required',
  },
  {
    id: 'password vacío',
    username: users.standard.username,
    password: '',
    field: 'password',
    expectedError: 'Enter Password',
  },
  {
    id: 'usuario bloqueado',
    username: users.lockedOut.username,
    password,
    field: 'password',
    expectedError: 'Sorry this user has been locked out.',
  },
];
