import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NZ_DRAWER_DATA } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Page, createWorker, recognize } from 'tesseract.js';
import { OcrService } from '../../../core/services/ocr.service';
import { AiService } from '../../../core/services/ai.service';

export interface PageWithWords extends Page {
  words?: Array<{
    bbox: [number, number, number, number]; // [x0, y0, x1, y1]
    text: string;
    confidence: number;
    baseline?: any;
  }>;
}

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

  @ViewChild('outputImage') outputImage!: ElementRef;
  @ViewChild('inputImage') inputImage!: ElementRef;
  public imageLoaded: boolean = false;
  public imageVisible: boolean = false;
  public loading: any;
  public loadingPercentage!: number;
  public cx!: CanvasRenderingContext2D;
  public imageContent: string = '';
  public analisys: string = '';
  public isLoadingAnalisys: boolean = false;

  constructor(
    @Inject(NZ_DRAWER_DATA) public drawerData: any,
    private ocrService: OcrService,
    private _ai: AiService
  ) { }

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

  public loadingProgress = (logger: any) => {
    console.log(logger);
    this.loadingPercentage = logger.progress
  };

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

  public loadedImage = () => {
    // this.initialization();
    this.imageLoaded = true;
    console.log('IMAGEN LISTA');
  };

  public readImage(): void {
    this.initSetup();
  }

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
