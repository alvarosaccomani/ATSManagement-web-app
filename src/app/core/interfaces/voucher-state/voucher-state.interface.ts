/**
 * Representa un estado paramétrico para un comprobante (por ejemplo, Pendiente, Confirmado, Rechazado, Conciliado).
 */
export interface VoucherStateInterface {
  /** Identificador único del estado del comprobante. */
  vous_uuid: string;
  /** Nombre visible del estado del comprobante. */
  vous_name: string;
  /** Descripción opcional del estado del comprobante. */
  vous_description: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  vous_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  vous_updatedat: string;
}
