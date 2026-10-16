import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

/**
 * Opciones de configuración para mostrar alertas modales a través de {@link MessageService}.
 */
export interface MessageConfig {
  /** Texto del título del modal. */
  title: string;
  /** Texto descriptivo del cuerpo del modal. */
  text: string;
  /** Tipo de ícono de la alerta. */
  type: 'success' | 'error' | 'warning' | 'info' | 'question';
  /** Etiqueta personalizada para el botón de confirmación. */
  confirmButtonText?: string;
  /** Color hexadecimal para el botón de confirmación. */
  confirmButtonColor?: string;
  /** Indica si se debe mostrar el botón de cancelar. */
  showCancelButton?: boolean;
  /** Color hexadecimal para el botón de cancelar. */
  cancelButtonColor?: string;
  /** Etiqueta personalizada para el botón de cancelar. */
  cancelButtonText?: string;
}

/**
 * Función de retrollamada invocada después de que se resuelve un modal de SweetAlert2.
 */
export type MessageCallback = (result: SweetAlertResult<any>) => void;

/**
 * Servicio contenedor sobre SweetAlert2 para mostrar notificaciones estandarizadas y cuadros de diálogo de confirmación.
 */
@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  /** Valores de configuración predeterminados aplicados a los cuadros de diálogo modales. */
  private defaultConfig: Partial<MessageConfig> = {
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6',
    showCancelButton: false,
    cancelButtonColor: '#d33'
  };

  /**
   * Muestra una alerta modal con el título, tipo de ícono y texto de mensaje especificados.
   *
   * @param title Título del modal.
   * @param type Tipo de ícono de la alerta (`'success' | 'error' | 'warning' | 'info' | 'question'`).
   * @param text Texto del cuerpo del modal.
   * @param callback Función de retrollamada opcional invocada cuando se cierra el cuadro de diálogo.
   */
  public showMessage(title: string, type: MessageConfig['type'], text: string, callback?: MessageCallback): void {
    const config: MessageConfig = {
      title,
      type,
      text,
      ...this.defaultConfig
    };

    this.showCustomMessage(config, callback);
  }

  /**
   * Muestra una alerta modal utilizando un objeto {@link MessageConfig} personalizado.
   *
   * @param config Configuración completa del modal.
   * @param callback Función de retrollamada opcional invocada con el `SweetAlertResult`.
   */
  public showCustomMessage(config: MessageConfig, callback?: MessageCallback): void {
    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.type,
      showCancelButton: config.showCancelButton || false,
      confirmButtonColor: config.confirmButtonColor || '#3085d6',
      confirmButtonText: config.confirmButtonText || 'Aceptar',
      cancelButtonText: config.cancelButtonText || 'Cancelar',
      cancelButtonColor: config.cancelButtonColor || '#d33'
    }).then((result: SweetAlertResult<any>) => {
      console.info('Message result:', result);

      // Ejecutar el callback si se proporciona
      if (callback && typeof callback === 'function') {
        callback(result);
      }
    });
  }

  /**
   * Muestra un cuadro de diálogo modal de éxito.
   *
   * @param title Título del modal.
   * @param text Texto del cuerpo del modal.
   * @param callback Función de retrollamada opcional invocada después del cierre.
   */
  public success(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'success', text, callback);
  }

  /**
   * Muestra un cuadro de diálogo modal de error.
   *
   * @param title Título del modal.
   * @param text Texto del cuerpo del modal.
   * @param callback Función de retrollamada opcional invocada después del cierre.
   */
  public error(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'error', text, callback);
  }

  /**
   * Muestra un cuadro de diálogo modal de advertencia.
   *
   * @param title Título del modal.
   * @param text Texto del cuerpo del modal.
   * @param callback Función de retrollamada opcional invocada después del cierre.
   */
  public warning(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'warning', text, callback);
  }

  /**
   * Muestra un cuadro de diálogo modal informativo.
   *
   * @param title Título del modal.
   * @param text Texto del cuerpo del modal.
   * @param callback Función de retrollamada opcional invocada después del cierre.
   */
  public info(title: string, text: string, callback?: MessageCallback): void {
    this.showMessage(title, 'info', text, callback);
  }

  /**
   * Muestra un cuadro de diálogo de confirmación interactivo con botones de Confirmar y Cancelar.
   *
   * @param title Título del modal.
   * @param text Pregunta o texto del cuerpo del modal.
   * @param confirmCallback Función de retrollamada opcional ejecutada cuando el usuario confirma.
   * @param cancelCallback Función de retrollamada opcional ejecutada cuando el usuario cancela o descarta el diálogo.
   * @param confirmButtonText Etiqueta para el botón de confirmación (por defecto `'Sí'`).
   * @param cancelButtonText Etiqueta para el botón de cancelar (por defecto `'No'`).
   * @param confirmButtonColor Color para el botón de confirmación.
   * @param cancelButtonColor Color para el botón de cancelar.
   */
  public confirm(
    title: string,
    text: string,
    confirmCallback?: () => void,
    cancelCallback?: () => void,
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'No',
    confirmButtonColor: string = '#3085d6',
    cancelButtonColor: string = '#d33'
  ): void {
    Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      cancelButtonText
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed && confirmCallback) {
        confirmCallback();
      } else if (result.isDismissed && cancelCallback) {
        cancelCallback();
      }
    });
  }
}
