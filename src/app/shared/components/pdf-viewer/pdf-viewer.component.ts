import { Component, Input } from '@angular/core';
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
  @Input() base64Data!: string; // debe incluir "data:application/pdf;base64,..."
}
