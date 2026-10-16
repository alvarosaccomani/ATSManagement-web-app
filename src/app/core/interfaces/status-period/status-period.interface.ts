/**
 * Representa un estado paramétrico para un período de facturación (por ejemplo, Abierto, Cerrado, Pagado, Vencido).
 */
export interface StatusPeriodInterface {
  /** Identificador único del estado del período. */
  sper_uuid: string;
  /** Nombre visible del estado del período. */
  sper_name: string;
  /** Descripción opcional del estado del período. */
  sper_description: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  sper_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  sper_updatedat: string;
}
