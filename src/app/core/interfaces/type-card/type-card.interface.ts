/**
 * Representa una clasificación de tipo de tarjeta (por ejemplo, Débito o Crédito).
 */
export interface TypeCardInterface {
  /** Identificador único del tipo de tarjeta (`'1'` para Débito, `'2'` para Crédito). */
  tycrd_uuid: string;
  /** Nombre visible del tipo de tarjeta. */
  tycrd_name: string;
  /** Descripción del tipo de tarjeta. */
  tycrd_description: string;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  tycrd_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  tycrd_updatedat: string;
}
