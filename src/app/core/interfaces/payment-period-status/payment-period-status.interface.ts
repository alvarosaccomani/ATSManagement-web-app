/**
 * Representa un estado paramétrico para un pago de período (por ejemplo, En proceso, Confirmado, Rechazado, Reembolsado).
 */
export interface PaymentPeriodStatusInterface {
  /** Identificador único del estado de pago del período. */
  payps_uuid: string;
  /** Nombre visible del estado. */
  payps_name: string;
  /** Descripción opcional del estado. */
  payps_description: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  payps_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  payps_updatedat: string;
}
