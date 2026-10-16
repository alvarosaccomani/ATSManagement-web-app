import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

/**
 * Componente modal (`<app-iframe-viewer>`) que incrusta de forma segura URLs externas dentro de un `<iframe>`.
 */
@Component({
  selector: 'app-iframe-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './iframe-viewer.component.html',
  styleUrl: './iframe-viewer.component.scss'
})
export class IframeViewerComponent implements OnInit {
  /** URL de recurso saneada vinculada al atributo `src` del `<iframe>`. */
  public safeUrl!: SafeResourceUrl;

  /**
   * Inicializa el componente visor de iframe.
   *
   * @param modalData Datos inyectados del modal de Ng-Zorro que contienen la `url` de destino.
   * @param sanitizer Instancia de `DomSanitizer` de Angular utilizada para confiar en la URL del recurso.
   */
  constructor(
    @Inject(NZ_MODAL_DATA) public modalData: { url: string },
    private sanitizer: DomSanitizer
  ) {}

  /**
   * Sanea la URL entrante del modal durante la inicialización.
   */
  ngOnInit(): void {
    if (this.modalData && this.modalData.url) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.modalData.url);
    }
  }
}
