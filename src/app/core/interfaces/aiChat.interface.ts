/**
 * Estructura de carga útil para enviar solicitudes de completado de chat al servicio de IA.
 */
export interface AIChatInterface {
  /** Identificador del modelo LLM de destino (por ejemplo, `qwen/qwen3-4b:free`). */
  model: string;
  /** Contenido del mensaje o prompt enviado al modelo. */
  message: string;
}
