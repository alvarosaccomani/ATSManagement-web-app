import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VoucherInterface } from '../../../core/interfaces/voucher';
import { VouchersService } from '../../../core/services/vouchers.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Component for listing and managing card vouchers.
 * @description Displays a paginated table of vouchers with operation type indicators, installment details, and status actions.
 */
@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzTagModule
  ],
  templateUrl: './vouchers.component.html',
  styleUrl: './vouchers.component.scss'
})
export class VouchersComponent implements OnInit {
  /** Array of loaded voucher records. */
  vouchers: VoucherInterface[] = [];
  /** Flag indicating whether table data is loading. */
  loading = false;
  /** Current page index (1-based). */
  pageIndex = 1;
  /** Number of rows per page. */
  pageSize = 10;
  /** Total number of voucher records. */
  total = 0;

  /** Table column definitions. */
  listOfColumns = [
    { key: 'vou_uuid', title: 'ID', width: '80px' },
    { key: 'transaction', title: 'Transacción', width: '140px' },
    { key: 'datetime', title: 'Fecha/Hora', width: '140px' },
    { key: 'amount', title: 'Monto', width: '120px' },
    { key: 'commerce', title: 'Comercio', width: '180px' },
    { key: 'operation_type', title: 'Tipo', width: '110px' },
    { key: 'installments', title: 'Cuotas', width: '100px' },
    { key: 'status', title: 'Estado', width: '110px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Initializes the VouchersComponent.
   * @param _router Angular Router service.
   * @param _vouchersService Service for voucher CRUD operations.
   * @param message Ng-Zorro toast message service.
   * @param _messageService Custom modal alert service.
   */
  constructor(
    private _router: Router,
    private _vouchersService: VouchersService,
    private _sessionService: SessionService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Lifecycle hook executed on component initialization.
   * @returns void
   */
  ngOnInit(): void {
    this.loadVouchers();
  }

  /**
   * Loads the vouchers list from the backend service.
   * @returns void
   */
  loadVouchers(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.vouchers = [];
      this.total = 0;
      this.loading = false;
      return;
    }
    this.loading = true;
    this._vouchersService.getVouchers(usr_uuid, '1', '1').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.vouchers = response.data;
          this.total = this.vouchers.length;
          this.loading = false;
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
   * Formats an ISO datetime string into `DD/MM/YYYY HH:mm`.
   * @param dateTimeString ISO datetime string.
   * @returns Formatted datetime string.
   */
  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Formats an amount string as a localized currency string.
   * @param amount Numeric amount string.
   * @param currency Currency ISO code (e.g., `'ARS'`, `'USD'`).
   * @returns Formatted currency string.
   */
  formatAmount(amount: string, currency: string): string {
    const amountNum = parseFloat(amount);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountNum);
  }

  /**
   * Returns the Ng-Zorro tag color for an operation type name.
   * @param typeName Operation type name.
   * @returns Tag color identifier.
   */
  getOperationTypeColor(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'green';
      case 'devolucion': return 'red';
      case 'extraccion': return 'orange';
      case 'pago_servicio': return 'blue';
      default: return 'default';
    }
  }

  /**
   * Returns the Ng-Zorro icon identifier for an operation type name.
   * @param typeName Operation type name.
   * @returns Icon name string.
   */
  getOperationTypeIcon(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'shopping-cart';
      case 'devolucion': return 'rollback';
      case 'extraccion': return 'bank';
      case 'pago_servicio': return 'pay-circle';
      default: return 'transaction';
    }
  }

  /**
   * Formats an operation type name into title case.
   * @param name Raw operation type name.
   * @returns Formatted operation type name.
   */
  formatOperationTypeName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Returns the Ng-Zorro badge status color for a voucher state name.
   * @param statusName Voucher status name.
   * @returns Status badge color string.
   */
  getVoucherStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'pendiente': return 'processing';
      case 'rechazado': return 'error';
      case 'anulado': return 'default';
      default: return 'default';
    }
  }

  /**
   * Capitalizes the first letter of a voucher status name.
   * @param name Raw status name.
   * @returns Capitalized status name.
   */
  formatVoucherStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Formats the installment summary text for a voucher.
   * @param voucher Voucher record.
   * @returns Human-readable installment description.
   */
  formatInstallments(voucher: VoucherInterface): string {
    if (!voucher.vou_installments) {
      return 'Contado';
    }
    const count = voucher.vou_installmentcount;
    const interest = parseFloat(voucher.vou_installmentinterest);
    return `${count} cuota${count > 1 ? 's' : ''}${interest > 0 ? ' + interés' : ''}`;
  }

  /**
   * Navigates to the voucher creation form.
   * @returns void
   */
  createVoucher(): void {
    this._router.navigate(['/admin/user/voucher/new']);
  }

  /**
   * Navigates to the voucher edit form.
   * @param voucher Voucher record to edit.
   * @returns void
   */
  editVoucher(voucher: VoucherInterface): void {
    this._router.navigate(['/admin/user/voucher/edit', voucher.vou_uuid]);
  }

  /**
   * Prompts for confirmation and deletes a voucher record.
   * @param voucher Voucher record to delete.
   * @returns void
   */
  deleteVoucher(voucher: VoucherInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este comprobante?',
      `Vas a eliminar la transacción "${voucher.vou_transactionnumber}". Esta acción no se puede deshacer.`,
      () => {
        this.loading = true;
        this._vouchersService.deleteVoucher(voucher.usr_uuid, voucher.crd_uuid, voucher.per_uuid, voucher.vou_uuid).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this._messageService.success('Comprobante eliminado', 'El comprobante se eliminó correctamente');
              this.loadVouchers();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar el comprobante');
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema de conexión al eliminar el comprobante');
          }
        });
      }
    );
  }

  /**
   * Displays a toast notification with voucher transaction details.
   * @param voucher Voucher record to inspect.
   * @returns void
   */
  viewDetails(voucher: VoucherInterface): void {
    this.message.info(`Detalles del voucher: ${voucher.vou_transactionnumber}`);
  }

  /**
   * Marks a voucher as confirmed in the UI.
   * @param voucher Voucher record to confirm.
   * @returns void
   */
  confirmVoucher(voucher: VoucherInterface): void {
    voucher.vous.vous_name = 'confirmado';
    this.message.success('Voucher confirmado correctamente');
  }

  /**
   * Marks a voucher as rejected in the UI.
   * @param voucher Voucher record to reject.
   * @returns void
   */
  rejectVoucher(voucher: VoucherInterface): void {
    voucher.vous.vous_name = 'rechazado';
    this.message.error('Voucher rechazado');
  }

  /**
   * Handles table page size changes.
   * @param size New page size.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadVouchers();
  }

  /**
   * Handles table page index changes.
   * @param index New page index.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadVouchers();
  }
}
