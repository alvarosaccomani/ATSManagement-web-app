import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NZ_DRAWER_DATA } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Page, createWorker, recognize } from 'tesseract.js';
import { OcrService } from '../../../core/services/ocr.service';
import { AiService } from '../../../core/services/ai.service';
import { VouchersParserService } from '../../../core/services/vouchers-parser.service';

/**
 * Interfaz `Page` de Tesseract extendida que incluye cuadros delimitadores (bounding boxes) y niveles de confianza a nivel de palabra.
 */
export interface PageWithWords extends Page {
  /** Arreglo de palabras reconocidas con las coordenadas de su cuadro delimitador y nivel de confianza. */
  words?: Array<{
    bbox: [number, number, number, number]; // [x0, y0, x1, y1]
    text: string;
    confidence: number;
    baseline?: any;
  }>;
}

/**
 * Componente de detalle en panel lateral (`<app-file-detail>`) para inspeccionar imágenes de comprobantes, ejecutar OCR con Tesseract.js,
 * analizar campos mediante expresiones regulares y analizar el contenido con IA (`qwen/qwen3-4b:free`).
 */
@Component({
  selector: 'app-file-detail',
  imports: [
    CommonModule,
    NzIconModule,
    NzCollapseModule,
    NzButtonModule
  ],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss'
})
export class FileDetailComponent {

  /** Referencia al elemento `<canvas>` donde se dibujan los cuadros delimitadores de las palabras. */
  @ViewChild('outputImage') outputImage!: ElementRef;
  /** Referencia al elemento `<img>` de origen que contiene la imagen del comprobante. */
  @ViewChild('inputImage') inputImage!: ElementRef;
  /** Indica si la imagen de origen ha terminado de cargarse en el DOM. */
  public imageLoaded: boolean = false;
  /** Controla la visibilidad del panel plegable de vista previa de la imagen. */
  public imageVisible: boolean = false;
  /** Indica si el proceso OCR de Tesseract se está ejecutando actualmente. */
  public loading: any;
  /** Progreso actual del reconocimiento OCR (de 0 a 1). */
  public loadingPercentage!: number;
  /** Contexto de renderizado 2D del elemento `<canvas>` de salida. */
  public cx!: CanvasRenderingContext2D;
  /** Texto sin formato extraído por el OCR de Tesseract. */
  public imageContent: string = '';
  /** Campos estructurados extraídos por {@link VouchersParserService}. */
  public voucherJson: any;
  /** Resultado del análisis de IA devuelto por {@link AiService}. */
  public analisys: string = '';
  /** Indica si hay una solicitud de análisis de IA en curso. */
  public isLoadingAnalisys: boolean = false;

  /**
   * Inicializa el componente de detalle de archivo del panel lateral (drawer).
   *
   * @param drawerData Datos inyectados en el panel lateral de Ng-Zorro (detalles e imagen del comprobante).
   * @param ocrService Servicio para eventos de OCR y preprocesamiento de imágenes.
   * @param _ai Servicio para solicitudes al modelo de chat de IA.
   * @param _vouchersParserService Servicio para el análisis de texto de comprobantes basado en expresiones regulares.
   */
  constructor(
    @Inject(NZ_DRAWER_DATA) public drawerData: any,
    private ocrService: OcrService,
    private _ai: AiService,
    private _vouchersParserService: VouchersParserService
  ) { }

  /**
   * Maneja los cambios de estado de los paneles plegables dentro del panel lateral.
   *
   * @param activeKeys Arreglo de claves de los paneles actualmente expandidos.
   * @param name Identificador de la sección plegable alternada (`'detail' | 'image' | 'text'`).
   */
  public onCollapseChange(activeKeys: string[], name: string): void {
    switch(name) {
      case 'detail':
        break;
      case 'image':
        this.imageVisible = !this.imageVisible;
        break;
      case 'text':
        break;
    };
  }

  /**
   * Actualiza `loadingPercentage` a partir del callback de registro (logger) del worker de Tesseract.
   *
   * @param logger Carga útil de progreso emitida por Tesseract.js.
   */
  public loadingProgress = (logger: any) => {
    console.log(logger);
    this.loadingPercentage = logger.progress
  };

  /**
   * Prepara las dimensiones y el contexto del `<canvas>` de salida para que coincidan con el tamaño natural de la imagen, y luego inicia el OCR.
   */
  public initSetup = () => {
    const canvasElement = this.outputImage.nativeElement;
    const imageElement = this.inputImage.nativeElement;
    const {naturalWidth, naturalHeight} = imageElement;
    this.cx = canvasElement.getContext('2d');
    this.cx.lineWidth = 5;
    this.cx.lineCap = 'square';
    this.cx.strokeStyle = 'green';
    canvasElement.width = naturalWidth;
    canvasElement.height = naturalHeight;
    this.initialization();
  };

  /**
   * Dibuja rectángulos delimitadores en el `<canvas>` alrededor de los elementos de texto reconocidos.
   *
   * @param dataIn Datos de página de OCR que contienen el texto y los cuadros delimitadores.
   */
  public draw = (dataIn: any) => {
    let words;
    if(dataIn.text) {
      words = dataIn.text.split('\n');
    }
    words.forEach((w: any) => {
      const bounding = w.bbox; // [1,1,2,2]
      if(bounding) {
        console.log(bounding);
        this.cx.strokeStyle = 'red';
        this.cx.strokeRect(bounding.x0, bounding.y0, bounding.x1 - bounding.x0, bounding.y1 - bounding.y0);
        this.cx.beginPath();
        // this.cx.moveTo(w.baseline.x0, w.baseline.y0);
        // this.cx.lineTo(w.baseline.x1, w.baseline.y1);
        this.cx.stroke();
      }
    });
  };

  /**
   * Inicializa un worker de Tesseract.js en español (`spa`), reconoce el texto de la imagen del comprobante,
   * dibuja los cuadros delimitadores y emite la página reconocida mediante {@link OcrService}.
   *
   * @returns Una promesa que se resuelve con el objeto {@link PageWithWords} reconocido y el arreglo de palabras.
   */
  public initialization = async (): Promise<{ data: PageWithWords; words: any[] }> => {
    this.loading = true;
    this.loadingPercentage = 0;

    const imageElement = this.inputImage.nativeElement;

    try {
      const worker = await createWorker('spa', 1, {
        logger: (m) => this.loadingProgress(m)
      });

      await worker.setParameters({
        tessjs_create_word_boxes: '1'
      });

      const { data } = await worker.recognize(imageElement);
      const page = data as PageWithWords; // 👈 tipado seguro

      this.draw(page); // pasa page en lugar de data
      console.log('FINALIZO ----------------->', page);
      this.imageContent = page.text;
      
      this.ocrService.cbText.emit(page);

      await worker.terminate();

      return {
        data: page,
        words: page.words || []
      };
    } catch (error) {
      console.error('Error en OCR:', error);
      throw error;
    } finally {
      this.loading = false;
      this.loadingPercentage = 0;
    }
  };

  /**
   * Callback que se activa cuando el elemento `<img>` de origen termina de cargarse.
   */
  public loadedImage = () => {
    // this.initialization();
    this.imageLoaded = true;
    console.log('IMAGEN LISTA');
  };

  /**
   * Inicia la lectura OCR en la imagen cargada y analiza el texto extraído con {@link VouchersParserService}.
   */
  public readImage(): void {
    this.initSetup();
    this.voucherJson = this._vouchersParserService.parseText(this.imageContent);
  }

  /**
   * Envía el texto OCR reconocido a {@link AiService} (`qwen/qwen3-4b:free`) para su análisis semántico.
   */
  public getJsonDocument(): void {
    this.isLoadingAnalisys = true;
    let chat = {
      model: "qwen/qwen3-4b:free",
      message: `decime de que pude ser el texto que te paso: ${this.imageContent}`
    }
    this._ai.chatModel(chat).subscribe(
      response => {
        this.isLoadingAnalisys = false;
        console.info(response);
        this.analisys = response;
      },
      error =>{
          this.isLoadingAnalisys = false;
          let errorMessage = <any>error;
          console.log(errorMessage);
          if(errorMessage != null) {
              //this.showMessage("Error", errorMessage.error.error);
          }
      }
    )
  }
}
