import { PaymentPeriodStatusInterface } from "./payment-period-status.interface";

/**
 * Contenedor de respuesta paginada de la API para consultas de estados de pago de períodos.
 */
export interface PaymentPeriodStatusResults {
  /** Número de página actual o índice del elemento inicial. */
  item: number;
  /** Cantidad de elementos por página. */
  itemOf: number;
  /** Cantidad total de elementos que coinciden con la consulta. */
  numElements: number;
  /** Cantidad total de páginas disponibles. */
  totalPages: number;
  /** Arreglo de registros de estados de pago de períodos. */
  data: PaymentPeriodStatusInterface[]
}