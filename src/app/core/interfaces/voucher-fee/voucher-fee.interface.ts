import { VoucherFeeStatusInterface } from "../voucher-fee-status";

/**
 * Representa una cuota individual de un comprobante de tarjeta financiado.
 */
export interface VoucherFeeInterface {
  /** Identificador único del usuario propietario del registro de la cuota. */
  usr_uuid: string;
  /** Identificador único de la tarjeta asociada. */
  crd_uuid: string;
  /** Identificador único del período de facturación en el que se factura esta cuota. */
  per_uuid: string;
  /** Identificador único del comprobante padre. */
  vou_uuid: string;
  /** Identificador único del registro de la cuota. */
  vouf_uuid: string;
  /** Número secuencial de la cuota (por ejemplo, 1 de N). */
  vouf_quotanumber: number;
  /** Monto monetario de esta cuota. */
  vouf_quotaamount: number;
  /** Fecha de vencimiento de esta cuota (cadena de fecha ISO). */
  vouf_quotaduedate: string;
  /** UUID del estado de la cuota (por ejemplo, Pendiente, Pagada, Vencida, Cancelada). */
  voufs_uuid: string;
  /** Entidad poblada del estado de la cuota. */
  voufs: VoucherFeeStatusInterface;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  vouf_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  vouf_updatedat: string;
}
