import { PaymentMethodInterface } from "../payment-method";
import { PaymentPeriodStatusInterface } from "../payment-period-status";

/**
 * Representa un registro de pago efectuado sobre un período de facturación de tarjeta.
 */
export interface PaymentPeriodInterface {
  /** Identificador único del usuario propietario del registro de pago. */
  usr_uuid: string;
  /** Identificador único de la tarjeta asociada al período de facturación. */
  crd_uuid: string;
  /** Identificador único del período de facturación que se abona. */
  per_uuid: string;
  /** Identificador único del registro de pago del período. */
  payp_uuid: string;
  /** Fecha ISO en que se realizó el pago. */
  payp_paymentdate: string;
  /** Monto monetario abonado al período de facturación. */
  payp_amountpaid: string;
  /** Identificador único del método de pago utilizado. */
  paym_uuid: string;
  /** Entidad poblada del método de pago. */
  paym: PaymentMethodInterface;
  /** Código de referencia bancaria o de transacción del pago opcional. */
  payp_paymentreference: string | null;
  /** Identificador único del estado del pago del período. */
  payps_uuid: string;
  /** Entidad poblada del estado del pago del período. */
  payps: PaymentPeriodStatusInterface;
  /** Marca de tiempo ISO de cuando se creó el registro. */
  payp_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro. */
  payp_updatedat: string;
}
