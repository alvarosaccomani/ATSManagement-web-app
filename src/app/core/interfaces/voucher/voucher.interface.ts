import { TypeOperationInterface } from "../type-operation";
import { VoucherStateInterface } from "../voucher-state";

/**
 * Representa un cupón de compra con tarjeta o comprobante de transacción.
 */
export interface VoucherInterface {
  /** Identificador único del usuario propietario del comprobante. */
  usr_uuid: string;
  /** Identificador único de la tarjeta utilizada para la transacción. */
  crd_uuid: string;
  /** Identificador único del período de facturación asociado al comprobante. */
  per_uuid: string;
  /** Identificador único del comprobante. */
  vou_uuid: string;
  /** Código de autorización impreso en el comprobante. */
  vou_authorizationnumber: string;
  /** Número de transacción o recibo. */
  vou_transactionnumber: string;
  /** Fecha y hora de la transacción (cadena ISO). */
  vou_datetime: string;
  /** Monto base de la transacción. */
  vou_amount: string;
  /** Código de moneda de la transacción. */
  vou_currency: string;
  /** Nombre del comercio o tienda. */
  vou_commercename: string;
  /** Número de identificación tributaria del comercio (CUIT). */
  vou_commercecuit: string;
  /** Categoría o rubro del comercio. */
  vou_commercecategory: string;
  /** UUID del tipo de operación. */
  tyop_uuid: string;
  /** Entidad poblada del tipo de operación. */
  tyop: TypeOperationInterface;
  /** Indica si la compra fue financiada en cuotas. */
  vou_installments: boolean;
  /** Cantidad total de cuotas (1 si es en un solo pago). */
  vou_installmentcount: number;
  /** Porcentaje de tasa de interés de financiación aplicado a las cuotas. */
  vou_installmentinterest: string;
  /** Código de terminal de punto de venta (POS) opcional. */
  vou_poscode: string | null;
  /** Código de referencia externa opcional. */
  vou_reference: string | null;
  /** UUID del estado del comprobante (por ejemplo, Pendiente, Confirmado, Rechazado, Conciliado). */
  vous_uuid: string;
  /** Entidad poblada del estado del comprobante. */
  vous: VoucherStateInterface;
  /** Referencia de imagen opcional o cadena Base64/URL del comprobante digitalizado. */
  vou_image: string | null;
  /** Notas u observaciones opcionales sobre el comprobante. */
  vou_notes: string | null;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  vou_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  vou_updatedat: string;
}
