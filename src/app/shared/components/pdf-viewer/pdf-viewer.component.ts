import { Component, Inject } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { PdfViewerModule } from 'ng2-pdf-viewer';

/**
 * Componente modal (`<app-pdf-viewer>`) que renderiza documentos PDF codificados en Base64 utilizando `ng2-pdf-viewer`.
 */
@Component({
  selector: 'app-pdf-viewer',
  imports: [
    PdfViewerModule
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent {
  /**
   * Inicializa el componente modal visor de PDF.
   *
   * @param modalData Datos inyectados del modal de Ng-Zorro que contienen `base64Data`.
   */
  constructor(
    @Inject(NZ_MODAL_DATA) public modalData: { base64Data: string }
  ) {
    console.info(this.modalData);
  }
}
