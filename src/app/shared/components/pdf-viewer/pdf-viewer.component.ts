import { Component, Inject } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  imports: [
    PdfViewerModule
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent {
  constructor(
    @Inject(NZ_MODAL_DATA) public modalData: { base64Data: string }
  ) {
    console.info(this.modalData);
  }
}
