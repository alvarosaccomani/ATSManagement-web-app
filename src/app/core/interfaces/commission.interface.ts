import { TransactionInterface } from "./transaction.interface";

/**
 * Resumen consolidado de comisiones y desglose de ventas para un usuario o vendedor.
 */
export interface SellerCommissionSummary {
    /** Identificador único del usuario propietario de los registros. */
    usr_uuid: string;
    /** Monto bruto total de ventas en todas las transacciones comisionables. */
    total_sales: number;
    /** Monto total de comisiones generadas en todas las transacciones comisionables. */
    total_commission: number;
    /** Cantidad total de ventas comisionables registradas. */
    sales_count: number;
    /** Lista de transacciones individuales de venta que generaron comisiones. */
    sales: TransactionInterface[];
}

/**
 * Contenedor de respuesta estándar de la API para consultas de comisiones de vendedores.
 */
export interface SellerCommissionResults {
    /** Indica si la solicitud a la API fue exitosa. */
    success: boolean;
    /** Datos del resumen de comisiones del vendedor. */
    data: SellerCommissionSummary;
    /** Mensaje opcional de estado o error devuelto por la API. */
    message?: string;
}
