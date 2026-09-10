/** Convierte "$29.99" o "Item total: $29.99" en 29.99. */
export function toAmount(text: string | null): number {
  if (!text) throw new Error('No se pudo leer un importe: texto vacío');
  const match = text.replace(',', '').match(/-?\d+(\.\d+)?/);
  if (!match) throw new Error(`No se pudo extraer un importe de: "${text}"`);
  return Number(match[0]);
}

/** Redondeo a 2 decimales evitando errores de coma flotante. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Regla de negocio: impuesto = subtotal * tasa, truncado a 2 decimales. */
export function expectedTax(subtotal: number, rate: number): number {
  return round2(subtotal * rate);
}
