/**
 * Representa una entidad bancaria registrada en el catálogo paramétrico.
 */
export interface BankInterface {
  /** Identificador único del usuario propietario o creador del registro del banco. */
  usr_uuid: string;
  /** Identificador único del banco. */
  ban_uuid: string;
  /** Nombre de la entidad bancaria. */
  ban_name: string;
  /** Descripción o detalles adicionales del banco. */
  ban_description: string;
  /** Marca de tiempo ISO de creación del registro del banco. */
  ban_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro del banco. */
  ban_updatedat: string;
}
