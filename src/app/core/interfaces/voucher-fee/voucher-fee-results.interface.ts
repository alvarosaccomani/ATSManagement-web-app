import { VoucherFeeInterface } from "./voucher-fee.interface";

/**
 * Contenedor de respuesta paginada de la API para consultas de cuotas de comprobantes.
 */
export interface VoucherFeeResults {
  /** Número de página actual o índice del elemento inicial. */
  item: number;
  /** Cantidad de elementos por página. */
  itemOf: number;
  /** Cantidad total de elementos que coinciden con la consulta. */
  numElements: number;
  /** Cantidad total de páginas disponibles. */
  totalPages: number;
  /** Arreglo de registros de cuotas de comprobantes. */
  data: VoucherFeeInterface[]
}