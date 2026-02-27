import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSliderModule } from 'ng-zorro-antd/slider';

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
  @Input() imageBase64: string | null = null;
  @Input() allowBinarize: boolean = false;
  @Output() onConfirm = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  public croppedImageBase64: string | null = null;
  
  // Objeto de transformación para ngx-image-cropper
  // Estado inicial de la transformación
  public initialTransform: ImageTransform = {
    rotate: 0,
    flipH: false,
    flipV: false,
    scale: 1
  };

  public transform: ImageTransform = { ...this.initialTransform };

  // Control del filtro de alto contraste
  public highContrastMode = false;

  public imageCropped(event: ImageCroppedEvent) {
    // Obtenemos el base64 del recorte actual
    this.croppedImageBase64 = event.base64 || null;
  }

  // Métodos de rotación (bidireccional)
  public rotateLeft() {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate || 0) - 90
    };
  }

  public rotateRight() {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate || 0) + 90
    };
  }

  // Zoom
  public zoomIn() { 
    this.transform = { 
      ...this.transform, scale: (this.transform.scale || 1) + 0.1
    };
  }

  public zoomOut() {
    this.transform = {
      ...this.transform, scale: Math.max((this.transform.scale || 1) - 0.1, 0.1)
    };
  }

  // Restablecer imagen al estado inicial
  public resetImage() {
    this.transform = { ...this.initialTransform };
    this.highContrastMode = false;
  }

  // Alternar modo alto contraste
  public toggleHighContrast() {
    // Al cambiar la binarización, el cropper debe re-procesar la imagen
    // No necesitamos hacer nada extra aquí, el CSS binarizará la vista
    // y el cropper tomará la imagen resultante.
  }

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

  // Función auxiliar para binarizar el recorte final usando un Canvas
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
