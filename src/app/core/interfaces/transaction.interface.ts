import { ScopeInterface } from './scope.interface';
import { PersonInterface } from './person.interface';

/**
 * Representa un movimiento contable de flujo de caja (`INGRESO`, `EGRESO` o `TRANSFERENCIA`).
 */
export interface TransactionInterface {
    /** Identificador único de la transacción. */
    trx_uuid: string;
    /** Identificador único del ámbito al que pertenece la transacción. */
    scp_uuid: string;
    /** Relación de ámbito poblada opcionalmente. */
    scp?: ScopeInterface;
    /** Identificador único del usuario que creó la transacción. */
    usr_uuidcreator: string;
    /** Tipo de movimiento (`INGRESO`, `EGRESO` o `TRANSFERENCIA`). */
    trx_type: string;
    /** Fecha y hora en que ocurrió la transacción. */
    trx_datetime: string | Date;
    /** Monto monetario de la transacción. */
    trx_amount: number;
    /** Código de moneda (por ejemplo, `ARS`, `USD`). */
    trx_currency: string;
    /** UUID opcional de la tarjeta o cuenta de origen. */
    crd_uuid?: string | null;
    /** UUID opcional de la tarjeta o cuenta de destino (requerido cuando `trx_type === 'TRANSFERENCIA'`). */
    target_crduuid?: string | null;
    /** Concepto breve o descripción de la transacción. */
    trx_concept: string;
    /** UUID opcional de la persona o contacto asociado (por ejemplo, vendedor o cliente). */
    prs_uuid?: string | null;
    /** Relación de persona poblada opcionalmente. */
    prs?: PersonInterface;
    /** Porcentaje de comisión opcional aplicado a la transacción. */
    trx_commissionrate?: number | null;
    /** Monto de comisión calculado opcionalmente devengado en la transacción. */
    trx_commissionamount?: number | null;
    /** Notas u observaciones adicionales opcionales. */
    trx_notes?: string | null;
    /** Marca de tiempo ISO de cuando se creó la transacción. */
    trx_createdat?: string;
    /** Marca de tiempo ISO de la última actualización de la transacción. */
    trx_updatedat?: string;
}

/**
 * Contenedor de respuesta estándar de la API para consultas de listados de transacciones.
 */
export interface TransactionResults {
    /** Indica si la solicitud a la API fue exitosa. */
    success: boolean;
    /** Arreglo de registros de transacciones devueltos por la API. */
    data: TransactionInterface[];
    /** Mensaje opcional de estado o error devuelto por la API. */
    message?: string;
}
