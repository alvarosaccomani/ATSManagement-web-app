/**
 * Representa un estado paramétrico para una cuota de comprobante (por ejemplo, Pendiente, Pagada, Vencida, Cancelada).
 */
export interface VoucherFeeStatusInterface {
  /** Identificador único del estado de la cuota. */
  voufs_uuid: string;
  /** Nombre visible del estado de la cuota. */
  voufs_name: string;
  /** Descripción opcional del estado de la cuota. */
  voufs_description: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  voufs_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  voufs_updatedat: string;
}
