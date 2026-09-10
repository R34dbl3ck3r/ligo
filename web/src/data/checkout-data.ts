/** Datos de comprador válidos. `faker` no se usa a propósito: ver docs/04. */
export type CheckoutInfo = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export const validCheckoutInfo: CheckoutInfo = {
  firstName: 'Paolo',
  lastName: 'Villanueva',
  postalCode: '15001',
};

/**
 * Tabla de decisión del formulario de checkout.
 * Se cubren las 3 combinaciones de campo obligatorio ausente (una por campo),
 * más el caso válido. No se combinan todas las permutaciones porque la
 * aplicación valida secuencialmente: aportarían coste sin nueva información.
 */
export const checkoutValidationCases: ReadonlyArray<{
  id: string;
  info: CheckoutInfo;
  expectedError: string;
}> = [
  {
    id: 'sin nombre',
    info: { firstName: '', lastName: 'Villanueva', postalCode: '15001' },
    expectedError: 'Error: First Name is required',
  },
  {
    id: 'sin apellido',
    info: { firstName: 'Paolo', lastName: '', postalCode: '15001' },
    expectedError: 'Error: Last Name is required',
  },
  {
    id: 'sin código postal',
    info: { firstName: 'Paolo', lastName: 'Villanueva', postalCode: '' },
    expectedError: 'Error: Postal Code is required',
  },
];
