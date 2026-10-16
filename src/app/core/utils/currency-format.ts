/**
 * Formatea un monto numérico en una cadena de moneda con prefijo de dólar y separadores de miles.
 *
 * @param value El valor numérico a formatear.
 * @returns Una cadena formateada como `$ 1,234.56`, o una cadena vacía si `value` es nulo o indefinido.
 */
export const formatterDollar = (value: number): string =>
  value !== null && value !== undefined
    ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '';

/**
 * Convierte una cadena de moneda formateada en dólares nuevamente en un valor numérico sin formato.
 *
 * @param value La cadena de moneda formateada que contiene `$` y/o separadores de coma.
 * @returns El monto numérico analizado.
 */
export const parserDollar = (value: string): number => +value.replace(/\$\s?|(,*)/g, '');
