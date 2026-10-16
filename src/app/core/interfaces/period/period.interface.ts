import { StatusPeriodInterface } from "../status-period";

/**
 * Representa un período mensual de resumen o facturación para una tarjeta.
 */
export interface PeriodInterface {
  /** Identificador único del usuario propietario del período. */
  usr_uuid: string;
  /** Identificador único de la tarjeta asociada. */
  crd_uuid: string;
  /** Identificador único del período de facturación. */
  per_uuid: string;
  /** Número secuencial del período de facturación. */
  per_periodnumber: number;
  /** Fecha de inicio del período (cadena de fecha ISO). */
  per_startdate: string;
  /** Fecha de cierre o finalización del período (cadena de fecha ISO). */
  per_enddate: string;
  /** Fecha de vencimiento de pago del resumen (cadena de fecha ISO). */
  per_duedate: string;
  /** UUID del estado del período (por ejemplo, Abierto, Cerrado, Pagado, Vencido). */
  sper_uuid: string;
  /** Entidad poblada del estado del período. */
  sper: StatusPeriodInterface;
  /** Saldo anterior impago trasladado a este período. */
  per_previousbalance: number;
  /** Tasa o monto de interés devengado durante este período. */
  per_interest: number;
  /** Marca de tiempo ISO de cuando se creó el registro del período. */
  per_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro del período. */
  per_updatedat: string;
}