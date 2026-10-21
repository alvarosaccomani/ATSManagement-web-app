import { ScopeInterface } from './scope.interface';
import { PersonInterface } from './person.interface';
import { CardInterface } from './card/card.interface';
import { TransactionInterface } from './transaction.interface';

/**
 * Categorías habituales sugeridas para gastos fijos y recurrentes.
 */
export type FixedExpenseCategory =
  | 'SERVICIOS'
  | 'ALQUILER'
  | 'IMPUESTOS'
  | 'SUSCRIPCIONES'
  | 'SUELDOS'
  | 'SEGUROS'
  | 'MANTENIMIENTO'
  | 'OTRO';

/**
 * Entidad que representa una plantilla o definición de un Gasto Fijo / Servicio Recurrente.
 */
export interface FixedExpenseInterface {
  /** Identificador único del gasto fijo (UUID v4). */
  fex_uuid: string;

  /** Identificador único del ámbito contable al que pertenece. */
  scp_uuid: string;

  /** Relación de ámbito contable poblada opcionalmente. */
  scp?: ScopeInterface;

  /** Identificador único del usuario creador. */
  usr_uuid: string;

  /** Nombre identificatorio del servicio o gasto (Ej: "Internet Fibra Óptica", "Alquiler Galpón", "Monotributo"). */
  fex_name: string;

  /** Categoría funcional del gasto. */
  fex_category?: FixedExpenseCategory | string | null;

  /** Día estimado de débito o vencimiento en el mes (1 a 31). */
  fex_dueday: number;

  /** Monto de referencia o valor del último período abonado. */
  fex_referenceamount?: number | null;

  /** Código de divisa (por defecto 'ARS'). */
  fex_currency: string;

  /** UUID de la cuenta o tarjeta predeterminada para el débito/pago. */
  crd_uuid?: string | null;

  /** Relación de tarjeta o cuenta bancaria asociada opcionalmente. */
  crd?: CardInterface;

  /** UUID del proveedor o beneficiario asociado (tabla prs_persons). */
  prs_uuid?: string | null;

  /** Relación de persona o proveedor asociada opcionalmente. */
  prs?: PersonInterface;

  /** UUID del socio que habitualmente se hace cargo de pagarlo de su bolsillo. */
  prs_uuidactor?: string | null;

  /** Relación del socio pagador asociado opcionalmente. */
  actor?: PersonInterface;

  /** Indica si el servicio está adherido a débito automático bancario/tarjeta. */
  fex_isautodebit: boolean;

  /** Indica si el sistema debe generar automáticamente el egreso contable en la fecha prevista. */
  fex_autogenerate: boolean;

  /** Indica si la regla de gasto fijo se encuentra activa. */
  fex_active: boolean;

  /** Notas, número de cliente, NIS, número de medidor o instrucciones de pago. */
  fex_notes?: string | null;

  /** Fecha y hora de creación de la plantilla. */
  fex_createdat?: string;

  /** Fecha y hora de última modificación. */
  fex_updatedat?: string;

  /**
   * Estado de liquidación calculado dinámicamente para el período consultado.
   * - `PAID`: Ya existe un egreso contable registrado para este período.
   * - `PENDING`: Aún no se ha registrado el pago en el período seleccionado.
   */
  status?: 'PAID' | 'PENDING';

  /** Transacción contable del egreso que saldó este gasto en el período consultado. */
  paid_transaction?: TransactionInterface | null;
}

/**
 * Payload requerido para dar de alta o modificar un Gasto Fijo.
 */
export interface FixedExpenseInputDTO {
  scp_uuid: string;
  usr_uuid: string;
  fex_name: string;
  fex_category?: string | null;
  fex_dueday: number;
  fex_referenceamount?: number | null;
  fex_currency?: string;
  crd_uuid?: string | null;
  prs_uuid?: string | null;
  prs_uuidactor?: string | null;
  fex_isautodebit?: boolean;
  fex_autogenerate?: boolean;
  fex_notes?: string | null;
}

/**
 * Payload requerido para registrar el pago o liquidación mensual de un Gasto Fijo.
 */
export interface PayFixedExpenseDTO {
  /** Monto real abonado en el período correspondiente. */
  trx_amount: number;

  /** Fecha y hora en que se efectuó el pago o se debitó de la cuenta. */
  trx_datetime?: string | Date;

  /** UUID de la cuenta o tarjeta utilizada (opcional, por defecto usa la configurada en la plantilla). */
  crd_uuid?: string | null;

  /** UUID del socio o actor que pagó de su bolsillo si aplica. */
  prs_uuidactor?: string | null;

  /** Observaciones del pago o número de comprobante/factura. */
  trx_notes?: string | null;

  /** UUID del usuario que registra el movimiento en el sistema. */
  usr_uuidcreator: string;
}

/**
 * Respuesta devuelta por la API al consultar el listado de gastos fijos.
 */
export interface FixedExpensesResults {
  success: boolean;
  data: FixedExpenseInterface[];
  message?: string;
}

/**
 * Respuesta devuelta por la API al registrar el pago mensual.
 */
export interface PayFixedExpenseResult {
  success: boolean;
  message?: string;
  transaction: TransactionInterface;
}
