import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { OcrService } from '../../../core/services/ocr.service'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzIconModule,
    ImageCropperComponent
  ],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() existingImage: string | null = null;
  @Output() onPhotoSaved = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  public isCameraActive = true;
  public isLoading = true;
  public capturedImage: string | null = null; // La foto original (para el cropper)
  public croppedImage: string | null = null;  // El resultado del recorte manual
  public isEditing = false; // Controla si mostramos el editor manual
  
  private mediaStream: MediaStream | null = null;

  constructor(
    private ocrService: OcrService
  ) { }

  ngAfterViewInit() {
    if (this.existingImage) {
      this.croppedImage = this.existingImage;
      this.isCameraActive = false;
      this.isLoading = false;
    } else {
      this.startCamera();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImage'] && !changes['existingImage'].firstChange) {
      const newImage = changes['existingImage'].currentValue;
      if (newImage) {
        this.croppedImage = newImage;
        this.isCameraActive = false;
        this.isEditing = false;
      }
    }
  }

  public async startCamera() {
    try {
      this.isLoading = true;
      if (this.mediaStream) this.stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Preferir cámara trasera en móviles
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

  public async capturePhoto(): Promise<void> {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const rawImage = canvas.toDataURL('image/jpeg', 1.0);
    this.stopCamera();
    this.isLoading = true;

    // --- PASO 1: OpenCV (Autocrop sugerido) ---
    // Procesamos con tu método processAndCrop para que el cropper 
    // ya arranque con una sugerencia inteligente del ticket.
    try {
      this.capturedImage = await this.ocrService.processAndCrop(rawImage);
    } catch (e) {
      this.capturedImage = rawImage; // Fallback a original
    }

    this.isCameraActive = false;
    this.isEditing = true; // --- PASO 2: Abrir editor manual ---
    this.isLoading = false;
  }

  // Se dispara cada vez que el usuario mueve los puntos de recorte
  public imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl || event.base64 || null;
  }

  public savePhoto(): void {
    if (this.croppedImage) {
      this.onPhotoSaved.emit(this.croppedImage);
    }
  }

  public retakePhoto(): void {
    this.isCameraActive = true;
    this.isEditing = false;
    this.capturedImage = null;
    this.croppedImage = null;
    this.startCamera();
  }

  public stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}