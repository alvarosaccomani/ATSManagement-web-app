/**
 * Representa un contacto o persona (vendedor, socio, cliente, proveedor, etc.) dentro de un ámbito.
 */
export interface PersonInterface {
    /** Identificador único del registro de persona. */
    prs_uuid: string;
    /** Identificador único del ámbito al que pertenece esta persona. */
    scp_uuid: string;
    /** UUID opcional del usuario de la plataforma vinculado si el contacto también es usuario de la aplicación. */
    usr_uuidlinked?: string | null;
    /** Nombre completo o razón social de la persona. */
    prs_name: string;
    /** Roles separados por comas o clasificación principal (por ejemplo, `VENDEDOR,CLIENTE`). */
    prs_type: string;
    /** Número de teléfono de contacto opcional. */
    prs_phone?: string | null;
    /** Dirección de correo electrónico de contacto opcional. */
    prs_email?: string | null;
    /** Identificador tributario o documento opcional (CUIT, CUIL o DNI). */
    prs_taxid?: string | null;
    /** Porcentaje de comisión de ventas opcional (0 a 100). */
    prs_commissionrate?: number | null;
    /** Indica si el registro de la persona se encuentra activo. */
    prs_active: boolean;
    /** Marca de tiempo ISO de creación del registro. */
    prs_createdat?: string;
    /** Marca de tiempo ISO de la última actualización del registro. */
    prs_updatedat?: string;
}

/**
 * Contenedor de respuesta estándar de la API para consultas de listados de personas.
 */
export interface PersonResults {
    /** Indica si la solicitud a la API fue exitosa. */
    success: boolean;
    /** Arreglo de registros de personas devueltos por la API. */
    data: PersonInterface[];
    /** Mensaje opcional de estado o error devuelto por la API. */
    message?: string;
}
