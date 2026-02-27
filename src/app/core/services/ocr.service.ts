import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  public cbImage: EventEmitter<any> = new EventEmitter<any>();
  public cbText: EventEmitter<any> = new EventEmitter<any>();
  private cvReady: Promise<void>;

  constructor() {
    this.cvReady = new Promise((resolve) => {
      const check = setInterval(() => {
        if (typeof cv !== 'undefined' && cv.Mat) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  public async processAndCrop(base64: string): Promise<string> {
    await this.cvReady;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let src = cv.imread(img);
        let gray = new cv.Mat();
        let blurred = new cv.Mat();
        let edged = new cv.Mat();
        let dialated = new cv.Mat();
        let dst = new cv.Mat();

        // 1. Convertir a escala de grises
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // 2. Filtro Bilateral: Difumina el ruido interno (texto) pero mantiene los bordes del papel
        cv.bilateralFilter(gray, blurred, 9, 75, 75, cv.BORDER_DEFAULT);

        // 3. Canny para detectar bordes
        cv.Canny(blurred, edged, 75, 200);

        // 4. Dilatación: Une bordes que puedan estar desconectados para cerrar el contorno del ticket
        let M = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
        cv.dilate(edged, dialated, M);

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(dialated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // 5. Buscar el área más grande (el ticket completo)
        let maxArea = 0;
        let bestRect = null;
        for (let i = 0; i < contours.size(); ++i) {
          let cnt = contours.get(i);
          let area = cv.contourArea(cnt);
          let rect = cv.boundingRect(cnt);
          
          if (area > maxArea && area > 10000) { 
            maxArea = area;
            bestRect = rect;
          }
        }

        // 6. Recortar con un pequeño margen (padding) para no asfixiar el OCR
        if (bestRect) {
          let padding = 20;
          let x = Math.max(0, bestRect.x - padding);
          let y = Math.max(0, bestRect.y - padding);
          let w = Math.min(src.cols - x, bestRect.width + (padding * 2));
          let h = Math.min(src.rows - y, bestRect.height + (padding * 2));
          let roiRect = new cv.Rect(x, y, w, h);
          dst = src.roi(roiRect);
        } else {
          dst = src.clone();
        }

        const canvas = document.createElement('canvas');
        cv.imshow(canvas, dst);
        const result = canvas.toDataURL('image/png');

        // Limpieza de memoria
        src.delete(); gray.delete(); blurred.delete(); edged.delete(); 
        dialated.delete(); dst.delete(); contours.delete(); hierarchy.delete(); M.delete();
        
        resolve(result);
      };
      img.src = base64;
    });
  }
}
