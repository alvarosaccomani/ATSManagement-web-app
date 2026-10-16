import { PeriodInterface } from "./period.interface";

/**
 * Contenedor de respuesta paginada de la API para consultas de períodos de facturación.
 */
export interface PeriodResults {
  /** Número de página actual o índice del elemento inicial. */
  item: number;
  /** Cantidad de elementos por página. */
  itemOf: number;
  /** Cantidad total de elementos que coinciden con la consulta. */
  numElements: number;
  /** Cantidad total de páginas disponibles. */
  totalPages: number;
  /** Arreglo de registros de períodos de facturación. */
  data: PeriodInterface[]
}