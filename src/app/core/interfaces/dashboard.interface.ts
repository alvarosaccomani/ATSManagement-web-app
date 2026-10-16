/**
 * Desglose de balance financiero para un ámbito operativo (contexto) individual.
 */
export interface ScopeBalanceSummary {
  /** Identificador único del ámbito. */
  scp_uuid: string;
  /** Nombre visible del ámbito. */
  scp_name: string;
  /** Código de color hexadecimal opcional que identifica al ámbito. */
  scp_color?: string | null;
  /** Total de ingresos registrados dentro de este ámbito. */
  total_income: number;
  /** Total de egresos registrados dentro de este ámbito. */
  total_expense: number;
  /** Balance neto (`total_income - total_expense`) para este ámbito. */
  balance: number;
}

/**
 * Resumen de indicadores financieros (KPI) global o filtrado por ámbito mostrado en el panel principal.
 */
export interface DashboardSummary {
  /** Identificador único del usuario autenticado. */
  usr_uuid: string;
  /** UUID del ámbito opcional al filtrar el panel por un único contexto. */
  scp_uuid?: string | null;
  /** Monto total de ingresos para el filtro activo. */
  total_income: number;
  /** Monto total de egresos para el filtro activo. */
  total_expense: number;
  /** Balance neto de caja (`total_income - total_expense`). */
  net_balance: number;
  /** Cantidad total de transacciones que coinciden con el filtro activo. */
  transaction_count: number;
  /** Transacciones más recientes ordenadas cronológicamente. */
  recent_transactions: any[];
  /** Desglose de balances agrupado por ámbito. */
  scopes_summary: ScopeBalanceSummary[];
}

/**
 * Contenedor de respuesta estándar de la API para solicitudes de resumen del panel principal.
 */
export interface DashboardResults {
  /** Indica si la solicitud a la API fue exitosa. */
  success: boolean;
  /** Datos del resumen del panel principal. */
  data: DashboardSummary;
  /** Mensaje opcional de estado o error devuelto por la API. */
  message?: string;
}
