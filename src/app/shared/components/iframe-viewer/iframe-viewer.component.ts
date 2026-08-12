import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-iframe-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './iframe-viewer.component.html',
  styleUrl: './iframe-viewer.component.scss'
})
export class IframeViewerComponent implements OnInit {
  public safeUrl!: SafeResourceUrl;

  constructor(
    @Inject(NZ_MODAL_DATA) public modalData: { url: string },
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.modalData && this.modalData.url) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.modalData.url);
    }
  }
}
