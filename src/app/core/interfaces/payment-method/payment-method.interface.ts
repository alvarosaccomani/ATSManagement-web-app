/**
 * Representa un método de pago (por ejemplo, Efectivo, Transferencia Bancaria, Tarjeta de Crédito, Débito Automático).
 */
export interface PaymentMethodInterface {
  /** Identificador único del método de pago. */
  paym_uuid: string;
  /** Nombre visible del método de pago. */
  paym_name: string;
  /** Descripción opcional del método de pago. */
  paym_description: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  paym_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  paym_updatedat: string;
}
