/**
 * Configuración heurística y reglas contables dinámicas asociadas a un ámbito.
 */
export interface ScopeSettings {
    /** Palabras clave adicionales que identifican un concepto o nota como egreso/gasto. */
    expense_keywords?: string[];
    /** Palabras clave que identifican operaciones de canje o trueque en especies. */
    barter_keywords?: string[];
    /** Determina si se infiere automáticamente el tipo (INGRESO/EGRESO) según el texto del concepto. */
    infer_type_from_concept?: boolean;
    [key: string]: any;
}

/**
 * Representa un ámbito o contexto contable (por ejemplo, Personal, Hogar, Proyecto Comercial).
 */
export interface ScopeInterface {
    /** Identificador único del ámbito. */
    scp_uuid: string;
    /** Nombre visible del ámbito. */
    scp_name: string;
    /** Descripción opcional del propósito del ámbito. */
    scp_description?: string | null;
    /** Indica si el ámbito es compartido con otros usuarios. */
    scp_isshared: boolean;
    /** Distintivo de color hexadecimal opcional asociado al ámbito. */
    scp_color?: string | null;
    /** Identificador de ícono opcional para el ámbito. */
    scp_icon?: string | null;
    /** Identificador único del usuario propietario del ámbito. */
    usr_uuidowner: string;
    /** Configuración dinámica de heurística y reglas contables del ámbito. */
    scp_settings?: ScopeSettings;
    /** Indica si el ámbito se encuentra actualmente activo. */
    scp_active: boolean;
    /** Marca de tiempo ISO de cuando se creó el ámbito. */
    scp_createdat?: string;
    /** Marca de tiempo ISO de la última actualización del ámbito. */
    scp_updatedat?: string;
}

/**
 * Contenedor de respuesta estándar de la API para consultas de listados de ámbitos.
 */
export interface ScopeResults {
    /** Indica si la solicitud a la API fue exitosa. */
    success: boolean;
    /** Arreglo de registros de ámbitos devueltos por la API. */
    data: ScopeInterface[];
    /** Mensaje opcional de estado o error devuelto por la API. */
    message?: string;
}
