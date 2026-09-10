import { env } from '@config/env';

export type User = {
  username: string;
  password: string;
  /** Comportamiento esperado del usuario según el sistema bajo prueba. */
  behaviour: string;
};

/**
 * Catálogo de usuarios de SauceDemo.
 * El sitio expone distintos perfiles que simulan comportamientos reales
 * (bloqueo, latencia, datos corruptos). Se modelan como datos, no como código.
 */
export const users = {
  standard: {
    username: 'standard_user',
    password: env.password,
    behaviour: 'Flujo feliz, sin anomalías',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: env.password,
    behaviour: 'Credenciales válidas pero cuenta bloqueada',
  },
  problem: {
    username: 'problem_user',
    password: env.password,
    behaviour: 'Datos corruptos (imágenes, precios duplicados en checkout)',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: env.password,
    behaviour: 'Latencia alta artificial',
  },
  error: {
    username: 'error_user',
    password: env.password,
    behaviour: 'Errores JS en acciones concretas',
  },
  visual: {
    username: 'visual_user',
    password: env.password,
    behaviour: 'Defectos visuales/maquetación',
  },
} as const satisfies Record<string, User>;

/** Particiones de equivalencia inválidas para el login (Data Driven Testing). */
export const invalidLogins: ReadonlyArray<{
  id: string;
  username: string;
  password: string;
  expectedError: string;
}> = [
  {
    id: 'usuario vacío',
    username: '',
    password: env.password,
    expectedError: 'Epic sadface: Username is required',
  },
  {
    id: 'password vacío',
    username: users.standard.username,
    password: '',
    expectedError: 'Epic sadface: Password is required',
  },
  {
    id: 'usuario inexistente',
    username: 'unknown_user',
    password: env.password,
    expectedError:
      'Epic sadface: Username and password do not match any user in this service',
  },
  {
    id: 'password incorrecto',
    username: users.standard.username,
    password: 'wrong_password',
    expectedError:
      'Epic sadface: Username and password do not match any user in this service',
  },
  {
    id: 'usuario bloqueado',
    username: users.lockedOut.username,
    password: env.password,
    expectedError: 'Epic sadface: Sorry, this user has been locked out.',
  },
];
