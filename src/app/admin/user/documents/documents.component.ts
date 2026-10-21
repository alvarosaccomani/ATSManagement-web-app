import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PdfViewerComponent } from '../../../shared/components/pdf-viewer/pdf-viewer.component'
import { FileDetailComponent } from '../../../shared/components/file-detail/file-detail.component'
import { IframeViewerComponent } from '../../../shared/components/iframe-viewer/iframe-viewer.component'
import { PendingVoucherInterface } from '../../../core/interfaces/pending-voucher';
import { TreeViewComponent } from '../../../shared/components/tree-view/tree-view.component';
import { ImageEditorComponent } from '../../../shared/components/image-editor/image-editor.component';
import { TreeInterface } from '../../../core/interfaces/tree';
import { CameraComponent } from '../../../shared/components/camera/camera.component';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OcrService } from '../../../core/services/ocr.service';
import { TreesService } from '../../../core/services/trees.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PendingVouchersService } from '../../../core/services/pending-vouchers.service';
import { SessionService } from '../../../core/services/session.service';

/**
 * Espacio de trabajo de digitalización de documentos, captura por cámara WebRTC, preprocesamiento de imágenes y OCR/IA (`<app-documents>`)
 * en `/admin/user/documents`.
 *
 * @description Implementa una vista de pantalla dividida con un árbol jerárquico filtrado por ámbito (`<app-tree-view>`) a la izquierda,
 * y carga de archivos (`nz-upload`), captura de cámara WebRTC en vivo (`<app-camera>`), recorte/binarización interactiva de imágenes
 * (`<app-image-editor>`) y cuadrícula de comprobantes pendientes a la derecha.
 */
@Component({
  selector: 'app-documents',
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzSplitterModule,
    NzIconModule,
    NzButtonModule,
    NzUploadModule,
    NzImageModule,
    NzModalModule,
    NzDrawerModule,
    NzSpinModule,
    PdfViewerComponent,
    FileDetailComponent,
    TreeViewComponent,
    ImageEditorComponent,
    CameraComponent
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit {

  /** Nodos del árbol jerárquico que representan Tarjetas -> Períodos de Facturación -> Comprobantes. */
  public treeData: TreeInterface[] = [];
  /** Indica si se están cargando los comprobantes pendientes o los datos del árbol. */
  public isLoading = false;
  /** Whether the current viewport matches mobile resolution (< 768px). */
  public isMobile = false;
  /** Controls visibility of the mobile cards/periods tree drawer. */
  public isTreeDrawerVisible = false;
  /** Label of the selected node displayed on the mobile filter button. */
  public selectedNodeTitle: string = 'Todas las tarjetas';
  /** Imagen de marcador de posición en Base64 de respaldo cuando falla la carga de una miniatura. */
  public fallback: string = 'data:image/png;base64,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';
  /** List of scopes available in the filter selector. */
  public scopes: ScopeInterface[] = [];
  /** Currently selected scope UUID (`'ALL'` by default). */
  public selectedScopeUuid: string = 'ALL';
  /** List of pending vouchers awaiting OCR/AI analysis or confirmation. */
  public pendingVouchers: PendingVoucherInterface[] = [];
  /** Upload queue managed by `nz-upload`. */
  public fileList: NzUploadFile[] = [];
  /** Controls visibility of the `<app-image-editor>` modal. */
  public isEditorVisible = false;
  /** Base64 image currently loaded into `<app-image-editor>`. */
  public imageToEdit: string | null = null;
  /** Controls visibility of the fullscreen `<app-camera>` modal. */
  public isCameraActiveView = false;

  /**
   * Initializes the documents component.
   *
   * @param modal Ng-Zorro modal service.
   * @param drawerService Ng-Zorro drawer service for opening `<app-file-detail>`.
   * @param _treesService Service for fetching the cards/periods/vouchers hierarchy.
   * @param _scopesService Service for fetching user scopes.
   * @param ocrService Service for OpenCV image preprocessing and OCR events.
   * @param _pendingVouchersService Service for managing pending vouchers.
   */
  constructor(
    private modal: NzModalService,
    private drawerService: NzDrawerService,
    private _treesService: TreesService,
    private _scopesService: ScopesService,
    private ocrService: OcrService,
    private _sessionService: SessionService,
    private _pendingVouchersService: PendingVouchersService
  ) { }

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Loads scopes, the hierarchical card tree, and pending vouchers on component initialization.
   */
  ngOnInit(): void {
    this.checkIsMobile();
    this.loadScopes();
    const usrUuid = this.currentUserId;
    if (usrUuid) {
      this.getCardsTree(usrUuid, this.selectedScopeUuid);
      this.getPendingVocuhers(usrUuid);
    }

    this.pendingVouchers = this.pendingVouchers.map((item: any) => ({
      ...item,
      // Añadimos el prefijo MIME para hacerlo usable
      //path: this.addMimeType(item.data, item.name),
      normalizedPath: this.normalizePath(item)
    }));
  }

  /**
   * Listens to viewport size changes to adapt between mobile drawer and desktop splitter.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.checkIsMobile();
  }

  /**
   * Checks whether the current window width is in the mobile breakpoint (< 768px).
   */
  private checkIsMobile(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile && this.isTreeDrawerVisible) {
        this.isTreeDrawerVisible = false;
      }
    }
  }

  /**
   * Opens the mobile card tree drawer.
   */
  public openTreeDrawer(): void {
    this.isTreeDrawerVisible = true;
  }

  /**
   * Closes the mobile card tree drawer.
   */
  public closeTreeDrawer(): void {
    this.isTreeDrawerVisible = false;
  }

  /**
   * Handles node selection from the mobile tree drawer, updates the label and closes the drawer.
   * @param node Selected tree node.
   */
  public onMobileNodeSelected(node: any): void {
    this.selectedNodeTitle = node.title || 'Tarjeta seleccionada';
    this.isTreeDrawerVisible = false;
    this.onNodeSelected(node);
  }

  // --- LÓGICA DE CÁMARA ---
  
  /**
   * Opens the fullscreen WebRTC camera modal (`<app-camera>`).
   */
  public openFullScreenCamera(): void {
    this.isCameraActiveView = true;
  }

  /**
   * Receives the captured Base64 image from `<app-camera>` and opens `<app-image-editor>`.
   *
   * @param base64Image Captured photograph in Base64 format.
   */
  public async handleCameraCapture(base64Image: string) {
    this.isCameraActiveView = false;
    this.imageToEdit = base64Image;
    this.isEditorVisible = true;
  }

  /**
   * Loads the user's scopes and prepends the `'ALL'` filter option.
   */
  public loadScopes(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) return;
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          const allOption: ScopeInterface = {
            scp_uuid: 'ALL',
            scp_name: 'Todos los ámbitos',
            scp_isshared: false,
            usr_uuidowner: usr_uuid,
            scp_active: true,
            scp_color: '#108ee9'
          };
          this.scopes = [allOption, ...response.data];
        }
      },
      error: (err) => console.error('Error fetching scopes:', err)
    });
  }

  /**
   * Reloads the hierarchical cards tree when the selected scope filter changes.
   *
   * @param scopeUuid Selected scope UUID or `'ALL'`.
   */
  public onScopeChange(scopeUuid: string): void {
    this.selectedScopeUuid = scopeUuid;
    const usrUuid = this.currentUserId;
    if (usrUuid) {
      this.getCardsTree(usrUuid, this.selectedScopeUuid);
    }
  }

  /**
   * Fetches the hierarchical cards/periods/vouchers tree from {@link TreesService}.
   *
   * @param usr_uuid User UUID.
   * @param scp_uuid Scope UUID filter (`'ALL'` by default).
   */
  private getCardsTree(usr_uuid: string, scp_uuid: string = 'ALL'): void {
    this._treesService.getCardsTree(usr_uuid, scp_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.treeData = response.data;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Fetches the list of pending vouchers from {@link PendingVouchersService}.
   *
   * @param usr_uuid User UUID.
   */
  private getPendingVocuhers(usr_uuid: string): void {
    this.isLoading = true;
    this._pendingVouchersService.getPendingVouchers(usr_uuid).subscribe(
      (response: any) => {
        if(response.success) {
          this.isLoading = false;
          this.pendingVouchers = response.data;
        } else {
          this.isLoading = false;
        }
      },
      (error: any) => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Intercepts file uploads in `nz-upload`, converts the file to a Data URL,
   * and opens `<app-image-editor>` for images or saves non-image files directly.
   *
   * @param file Uploaded file instance.
   * @returns `false` to prevent automatic HTTP upload by `nz-upload`.
   */
  public beforeUpload = (file: NzUploadFile): boolean => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (file.type?.startsWith('image/')) {
        this.imageToEdit = e.target.result;
        this.isEditorVisible = true;
      } else {
        this.addDocumentToList(file.name, e.target.result);
      }
    };
    reader.readAsDataURL(file as any);
    return false;
  };

  /**
   * Saves the cropped/binarized image emitted by `<app-image-editor>` as a new pending voucher.
   *
   * @param croppedImage Processed Base64 image string.
   */
  public onEditorConfirm(croppedImage: string) {
    this.addDocumentToList(`Ticket_${Date.now()}.png`, croppedImage);
    this.isEditorVisible = false;
  }

  /**
   * Persists a new pending voucher record via {@link PendingVouchersService.savePendingVoucher}.
   *
   * @param name File name for the pending voucher.
   * @param path Base64 data URL of the voucher image/document.
   */
  private addDocumentToList(name: string, path: string) {
    this.isLoading = true;
    const newDoc: PendingVoucherInterface = { usr_uuid: this.currentUserId, pevou_uuid: '', pevou_name: name, pevou_image: path };
    this._pendingVouchersService.savePendingVoucher(newDoc).subscribe(
      (response: any) => {
        if(response.success) {
          this.isLoading = false;
          this.pendingVouchers.push(response.data);
        } else {
          this.isLoading = false;
        }
      },
      (error: any) =>{
          this.isLoading = false;
          let errorMessage = <any>error;
          console.log(errorMessage);
          //this.message.success(errorMessage.error.error);
      }
    )
  }

  /**
   * Normalizes the `pevou_image` property of a pending voucher into a valid URL or MIME-prefixed Base64 string.
   *
   * @param item Pending voucher record.
   * @returns Normalized image or document source string.
   */
  public normalizePath(item: PendingVoucherInterface): string {
    const { pevou_image, pevou_name } = item;

    // Caso 1: Ya es una data URL (tiene prefijo MIME)
    if (pevou_image.startsWith('') && pevou_image.includes(';base64,')) {
      return pevou_image;
    }

    // Caso 2: Parece una URL (empieza con http, https, /, etc.)
    if (
      pevou_image.startsWith('http://') ||
      pevou_image.startsWith('https://') ||
      pevou_image.startsWith('/') ||
      pevou_image.startsWith('./') ||
      pevou_image.startsWith('../')
    ) {
      return pevou_image; // lo dejamos como URL
    }

    // Caso 3: Es base64 SIN prefijo → lo convertimos a data URL
    if (pevou_name) {
      return this.addMimeType(pevou_image, pevou_name);
    }

    // Caso 4: No sabemos qué es → asumimos binario genérico
    return `application/octet-stream;base64,${pevou_image}`;
  }

  /**
   * Prepends the appropriate MIME type header to a raw Base64 string based on file extension.
   *
   * @param base64 Raw Base64 string.
   * @param name Optional file name with extension.
   * @returns MIME-prefixed Base64 string.
   */
  private addMimeType(base64: string, name?: string): string {
    // Si no hay fileName, usamos un tipo genérico
    if (!name) {
      return `application/octet-stream;base64,${base64}`;
    }

    const ext = name.split('.').pop()?.toLowerCase() || '';
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel'
    };
    const mime = mimeMap[ext] || 'application/octet-stream';
    return `${mime};base64,${base64}`;
  }

  /**
   * Determines the file category (`'image' | 'pdf' | 'doc' | 'xls' | 'other'`) of a pending voucher.
   *
   * @param item Pending voucher record.
   * @returns Detected file type category.
   */
  public getFileType(item: PendingVoucherInterface): 'image' | 'pdf' | 'doc' | 'xls' | 'other' {
    const normalizedPath = this.normalizePath(item);

    // Función auxiliar para detectar tipo por extensión
    const getTypeFromExtension = (str: string): 'image' | 'pdf' | 'doc' | 'xls' | 'other' => {
      const lower = str.toLowerCase();
      if (lower.endsWith('.pdf')) return 'pdf';
      if (/\.(jpg|jpeg|png|gif)$/i.test(lower)) return 'image';
      if (/\.(doc|docx)$/i.test(lower)) return 'doc';
      if (/\.(xls|xlsx)$/i.test(lower)) return 'xls';
      return 'other';
    };

    // Si NO es una data URL (es una URL externa o relativa)
    if (normalizedPath.startsWith('')) {
      // 1. Intenta con name
      if (item.pevou_name) {
        const typeFromName = getTypeFromExtension(item.pevou_name);
        if (typeFromName !== 'other') return typeFromName;
      }

      // 2. Si no hay name o no se detectó, intenta con la URL misma
      const typeFromUrl = getTypeFromExtension(normalizedPath);
      return typeFromUrl;
    }

    // Si ES una data URL, usamos el prefijo MIME
    if (normalizedPath.startsWith('image/')) return 'image';
    if (normalizedPath.startsWith('application/pdf')) return 'pdf';
    if (normalizedPath.includes('wordprocessingml')) return 'doc';
    if (normalizedPath.includes('spreadsheetml')) return 'xls';

    return 'other';
  }

  /**
   * Opens a modal preview for a PDF pending voucher using either `<app-iframe-viewer>` or `<app-pdf-viewer>`.
   *
   * @param item Pending voucher record.
   */
  public openPdfPreview(item: PendingVoucherInterface): void {
    let url = this.normalizePath(item);

    // Si es una URL externa (no empieza con data:)
    if (!url.startsWith('data:')) {
      this.modal.create({
        nzTitle: 'PDF',
        nzContent: IframeViewerComponent,
        nzData: { url: url },
        nzWidth: '80%',
        nzFooter: null
      });
      return;
    }

    // Si es base64
    this.modal.create({
      nzTitle: 'Vista previa del PDF',
      nzContent: PdfViewerComponent,
      nzData: { base64Data: url },
      nzWidth: '80%',
      nzFooter: null
    });
  }

  /**
   * Opens a Word or Excel document URL in a new browser tab using Google Docs Viewer.
   *
   * @param url Document URL to preview.
   */
  public openDocPreview(url: string): void {
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(googleViewerUrl, '_blank');
  }

  /**
   * Triggers a browser download for the specified pending voucher file.
   *
   * @param item Pending voucher record to download.
   */
  public downloadFile(item: PendingVoucherInterface): void {
    const link = document.createElement('a');
    link.href = item.pevou_image; // debe ser data URL válida
    link.download = item.pevou_name || 'documento';
    link.click();
  }

  /**
   * Opens the side drawer (`<app-file-detail>`) to inspect the voucher image and run OCR/AI extraction.
   *
   * @param item Pending voucher record to inspect.
   */
  public viewFile(item: PendingVoucherInterface): void {
    this.drawerService.create({
      nzTitle: 'Detalles del archivo',
      nzContent: FileDetailComponent,
      nzData: item,
      nzWidth: '700px',
      nzBodyStyle: {
        padding: '0',
        height: 'calc(100vh - 110px)', // ajusta según tu diseño (header + footer ≈ 110px)
        overflow: 'hidden', // el scroll lo maneja el contenedor interno
        display: 'flex',
        flexDirection: 'column'
      }
    });
  }

  /**
   * Deletes a pending voucher record via {@link PendingVouchersService.deletePendingVoucher} and refreshes the list.
   *
   * @param pendingVoucher Pending voucher record to delete.
   */
  public deleteVoucherPending(pendingVoucher: PendingVoucherInterface) {
    // this._messageService.showCustomMessage({
    //     title: "¿Estás seguro de eliminar el Rubro?",
    //     type: "question",
    //     text: "Estás a punto de eliminar el Rubro.",
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: "Sí, eliminar!",
    //     cancelButtonText: "No, cancelar"
    //   },
    //   (result: any) => {
    //     if (result.value) {
          this._pendingVouchersService.deletePendingVoucher(pendingVoucher.usr_uuid!, pendingVoucher.pevou_uuid!)
            .subscribe(
              response => {
                console.info(response);
                this.getPendingVocuhers(pendingVoucher.usr_uuid);
                //this.message.success(`Banco eliminado: ${bank.ban_name}`);
              },
              error => {
                console.log(<any>error);
              }
            );
    //     }
    //   }
    // );
  }

  /**
   * Callback invoked when a user clicks a node in `<app-tree-view>`.
   *
   * @param node Selected tree node.
   */
  public onNodeSelected(node: any): void {
    console.log('Nodo seleccionado:', node);
    alert(`Seleccionaste: ${node.title}`);
  }

  /**
   * Callback invoked when a user checks or unchecks a node in `<app-tree-view>`.
   *
   * @param event Tree check event payload.
   */
  public onNodeChecked(event: any): void {
    console.log('Nodo checkeado:', event);
    console.log('Nodos checkeados:', event.checkedKeys);
  }
}
