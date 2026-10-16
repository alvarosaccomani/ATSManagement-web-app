import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';

/**
 * Componente de captura de cámara mediante WebRTC (`<app-camera>`).
 *
 * @description Transmite video en vivo desde la cámara trasera del dispositivo, captura instantáneas
 * JPEG de alta resolución en un elemento `<canvas>` de HTML5 y permite previsualizar, volver a tomar o confirmar la fotografía.
 */
@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzIconModule
  ],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements AfterViewInit, OnDestroy, OnChanges {
  /** Imagen opcional existente en formato Base64 para mostrar en modo de vista previa en lugar de iniciar la cámara. */
  @Input() existingImage: string | null = null;
  /** Emite la cadena de la imagen capturada en formato Base64 cuando el usuario confirma la fotografía. */
  @Output() onPhotoSaved = new EventEmitter<string>();
  /** Se emite cuando la vista de la cámara se cierra o se cancela. */
  @Output() onClose = new EventEmitter<void>();

  /** Referencia al elemento nativo `<video>` que muestra la transmisión en vivo de la cámara. */
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  /** Referencia al elemento oculto `<canvas>` utilizado para capturar las instantáneas. */
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  /** Indica si la transmisión en vivo de la cámara está activa actualmente. */
  public isCameraActive = true;
  /** Indica si la transmisión de la cámara se está inicializando. */
  public isLoading = true;
  /** Almacena la instantánea capturada en formato Base64 para una vista previa rápida. */
  public capturedImage: string | null = null; // Almacena la captura para previsualización rápida
  
  /** Instancia activa de `MediaStream` de WebRTC. */
  private mediaStream: MediaStream | null = null;

  constructor() { }

  /**
   * Inicializa la vista del componente mostrando `existingImage` o iniciando la transmisión en vivo de la cámara.
   */
  ngAfterViewInit() {
    if (this.existingImage) {
      this.capturedImage = this.existingImage;
      this.isCameraActive = false;
      this.isLoading = false;
    } else {
      this.startCamera();
    }
  }

  /**
   * Reacciona a los cambios en la propiedad de entrada `existingImage`.
   *
   * @param changes Objeto `SimpleChanges` de Angular.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImage'] && !changes['existingImage'].firstChange) {
      const newImage = changes['existingImage'].currentValue;
      if (newImage) {
        this.capturedImage = newImage;
        this.isCameraActive = false;
      }
    }
  }

  /**
   * Solicita acceso a la cámara trasera del dispositivo en alta resolución (hasta 4K) y reproduce la transmisión.
   */
  public async startCamera() {
    try {
      this.isLoading = true;
      if (this.mediaStream) this.stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 4096 }, 
          height: { ideal: 2160 }
        } 
      });
      this.mediaStream = stream;

      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
        await this.videoElement.nativeElement.play();
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error cámara:', error);
      this.isLoading = false;
    }
  }

  /**
   * Captura el fotograma de video actual en el lienzo (`<canvas>`) a resolución nativa completa y detiene la transmisión de la cámara.
   */
  public capturePhoto(): void {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    // Ajustamos el canvas a la resolución real del stream de video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Extraemos la imagen en alta calidad (JPEG 1.0)
      this.capturedImage = canvas.toDataURL('image/jpeg', 1.0);
    }

    this.isCameraActive = false;
    this.stopCamera();
  }

  /**
   * Emite la imagen capturada en formato Base64 a través de `onPhotoSaved`.
   */
  public savePhoto(): void {
    if (this.capturedImage) {
      // Emitimos la imagen original al padre para que él decida 
      // si pasar por OpenCV y el Editor Aislado.
      this.onPhotoSaved.emit(this.capturedImage);
    }
  }

  /**
   * Descarta la instantánea actual y reinicia la transmisión en vivo de la cámara.
   */
  public retakePhoto(): void {
    this.isCameraActive = true;
    this.capturedImage = null;
    this.startCamera();
  }

  /**
   * Detiene todas las pistas multimedia activas y libera el hardware de la cámara.
   */
  public stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Asegura que la transmisión de la cámara se detenga cuando se destruye el componente.
   */
  ngOnDestroy() {
    this.stopCamera();
  }
}