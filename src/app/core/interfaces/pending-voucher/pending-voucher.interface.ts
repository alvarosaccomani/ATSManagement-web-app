/**
 * Representa un borrador de comprobante cargado o fotografiado a la espera de procesamiento OCR/IA o confirmación.
 */
export interface PendingVoucherInterface {
  /** Identificador único del usuario propietario del comprobante pendiente. */
  usr_uuid: string;
  /** Identificador único opcional del comprobante pendiente. */
  pevou_uuid?: string;
  /** Nombre de archivo o etiqueta generada para la imagen del comprobante pendiente. */
  pevou_name: string;
  /** Datos de imagen codificados en Base64 o URL del comprobante capturado. */
  pevou_image: string;
  /** Cadena JSON serializada opcional con los campos estructurados extraídos mediante OCR/IA. */
  pevou_unreadcontent?: string;
  /** Texto sin procesar opcional extraído de la imagen del comprobante mediante OCR. */
  pevou_unreadtext?: string;
  /** Marca de tiempo ISO de cuando se creó el comprobante pendiente. */
  pevou_createdat?: string;
  /** Marca de tiempo ISO de la última actualización del comprobante pendiente. */
  pevou_updatedat?: string;
}