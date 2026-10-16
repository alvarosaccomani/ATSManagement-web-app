import { TypeCardInterface } from "./type-card.interface";

/**
 * Contenedor de respuesta paginada de la API para consultas de tipos de tarjetas.
 */
export interface TypeCardResults {
  /** Número de página actual o índice del elemento inicial. */
  item: number;
  /** Cantidad de elementos por página. */
  itemOf: number;
  /** Cantidad total de elementos que coinciden con la consulta. */
  numElements: number;
  /** Cantidad total de páginas disponibles. */
  totalPages: number;
  /** Arreglo de registros de tipos de tarjetas. */
  data: TypeCardInterface[]
}