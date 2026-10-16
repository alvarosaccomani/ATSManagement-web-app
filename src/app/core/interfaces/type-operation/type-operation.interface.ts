/**
 * Representa un tipo de operación de comprobante (por ejemplo, Compra en comercio, Suscripción, Reintegro).
 */
export interface TypeOperationInterface {
  /** Identificador único del tipo de operación. */
  tyop_uuid: string;
  /** Nombre visible del tipo de operación. */
  tyop_name: string;
  /** Descripción opcional del tipo de operación. */
  tyop_description: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  tyop_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  tyop_updatedat: string;
}
