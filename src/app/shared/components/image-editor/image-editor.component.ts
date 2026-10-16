import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSliderModule } from 'ng-zorro-antd/slider';

/**
 * Componente interactivo de edición de imágenes (`<app-image-editor>`) para recortar, rotar, hacer zoom
 * y aplicar contraste de umbral binario (binarización) a fotografías de comprobantes antes del OCR.
 */
@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageCropperComponent,
    NzIconModule,
    NzButtonModule,
    NzToolTipModule,
    NzSwitchModule,
    NzSliderModule
  ],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent {
  /** Imagen de origen en formato Base64 para cargar en el recortador. */
  @Input() imageBase64: string | null = null;
  /** Indica si se debe mostrar el interruptor de binarización de alto contraste en la barra de herramientas. */
  @Input() allowBinarize: boolean = false;
  /** Emite la cadena final de la imagen recortada (y opcionalmente binarizada) en formato Base64. */
  @Output() onConfirm = new EventEmitter<string>();
  /** Se emite cuando el usuario cancela la edición. */
  @Output() onCancel = new EventEmitter<void>();

  /** Almacena la salida actual de la imagen recortada en formato Base64. */
  public croppedImageBase64: string | null = null;
  
  /** Estado de transformación inicial predeterminado para `ngx-image-cropper`. */
  public initialTransform: ImageTransform = {
    rotate: 0,
    flipH: false,
    flipV: false,
    scale: 1
  };

  /** Estado de transformación activo actual aplicado al recortador de imágenes. */
  public transform: ImageTransform = { ...this.initialTransform };

  /** Indica si la umbralización binaria de alto contraste está habilitada. */
  public highContrastMode = false;

  /**
   * Callback que se invoca cada vez que el usuario ajusta el cuadro de recorte.
   *
   * @param event Evento del recortador que contiene la imagen recortada en formato Base64.
   */
  public imageCropped(event: ImageCroppedEvent) {
    // Obtenemos el base64 del recorte actual
    this.croppedImageBase64 = event.base64 || null;
  }

  /**
   * Rota la imagen 90 grados en sentido antihorario.
   */
  public rotateLeft() {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate || 0) - 90
    };
  }

  /**
   * Rota la imagen 90 grados en sentido horario.
   */
  public rotateRight() {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate || 0) + 90
    };
  }

  /**
   * Acerca la imagen incrementando la escala en pasos de 0.1.
   */
  public zoomIn() { 
    this.transform = { 
      ...this.transform, scale: (this.transform.scale || 1) + 0.1
    };
  }

  /**
   * Aleja la imagen reduciendo la escala en pasos de 0.1 (mínimo 0.1).
   */
  public zoomOut() {
    this.transform = {
      ...this.transform, scale: Math.max((this.transform.scale || 1) - 0.1, 0.1)
    };
  }

  /**
   * Restablece todas las transformaciones de rotación, zoom y alto contraste a su estado inicial.
   */
  public resetImage() {
    this.transform = { ...this.initialTransform };
    this.highContrastMode = false;
  }

  /**
   * Alterna el modo de vista previa de binarización de alto contraste.
   */
  public toggleHighContrast() {
    // Al cambiar la binarización, el cropper debe re-procesar la imagen
    // No necesitamos hacer nada extra aquí, el CSS binarizará la vista
    // y el cropper tomará la imagen resultante.
  }

  /**
   * Confirma la edición, aplicando opcionalmente binarización a nivel de píxel si `highContrastMode` está activo,
   * y emite la cadena Base64 resultante mediante `onConfirm`.
   */
  public confirm() {
    if (this.croppedImageBase64) {
      // Si el modo alto contraste está activo, binarizamos la imagen final antes de enviarla
      if (this.highContrastMode) {
        this.binarizeFinalImage(this.croppedImageBase64).then(binarizedBase64 => {
          this.onConfirm.emit(binarizedBase64);
        });
      } else {
        this.onConfirm.emit(this.croppedImageBase64);
      }
    }
  }

  /**
   * Convierte una imagen en formato Base64 a blanco y negro puro (umbral binario = 128) utilizando un `<canvas>` fuera de pantalla.
   *
   * @param base64 Imagen de origen recortada en formato Base64.
   * @returns Una promesa que se resuelve con la imagen PNG binarizada en formato Base64.
   */
  private binarizeFinalImage(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Algoritmo de binarización simple (Otsu o Umbral Fijo)
          const threshold = 128; // Umbral medio
          
          for (let i = 0; i < data.length; i += 4) {
            // Convertir a escala de grises (luminosidad)
            const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            // Aplicar umbral
            const val = avg >= threshold ? 255 : 0;
            data[i] = val;     // R
            data[i + 1] = val; // G
            data[i + 2] = val; // B
            // data[i+3] is Alpha (keep it)
          }
          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(base64); // Fallback
        }
      };
      img.src = base64;
    });
  }
}
