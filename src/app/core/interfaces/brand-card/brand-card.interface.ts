/**
 * Representa una marca o red de tarjeta (por ejemplo, Visa, Mastercard, American Express).
 */
export interface BrandCardInterface {
  /** Identificador único de la marca de tarjeta. */
  brcrd_uuid: string;
  /** Nombre de la marca de tarjeta. */
  brcrd_name: string;
  /** Descripción de la marca de tarjeta. */
  brcrd_description: string;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  brcrd_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  brcrd_updatedat: string;
}
