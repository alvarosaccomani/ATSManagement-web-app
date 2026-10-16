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
import { VoucherFeeInterface } from '../../../core/interfaces/voucher-fee';
import { VouchersFeesService } from '../../../core/services/vouchers-fees.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Component for listing and managing voucher installments (quotas/fees).
 * @description Displays a paginated table of installments with due date countdowns, status badges, and CRUD actions.
 */
@Component({
  selector: 'app-vouchers-fees',
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
  templateUrl: './vouchers-fees.component.html',
  styleUrl: './vouchers-fees.component.scss'
})
export class VouchersFeesComponent implements OnInit {
  /** Array of loaded voucher installment records. */
  installments: VoucherFeeInterface[] = [];
  /** Flag indicating whether table data is loading. */
  loading = false;
  /** Current page index (1-based). */
  pageIndex = 1;
  /** Number of rows per page. */
  pageSize = 10;
  /** Total number of installment records. */
  total = 0;

  /** Table column definitions. */
  listOfColumns = [
    { key: 'vouf_uuid', title: 'ID', width: '80px' },
    { key: 'quota_number', title: 'Cuota', width: '100px' },
    { key: 'amount', title: 'Monto', width: '120px' },
    { key: 'due_date', title: 'Vencimiento', width: '120px' },
    { key: 'status', title: 'Estado', width: '110px' },
    { key: 'days_left', title: 'Días Restantes', width: '120px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Initializes the VouchersFeesComponent.
   * @param _router Angular Router service.
   * @param _vouchersFeesService Service for installment CRUD operations.
   * @param message Ng-Zorro toast message service.
   * @param _messageService Custom modal alert service.
   */
  constructor(
    private _router: Router,
    private _vouchersFeesService: VouchersFeesService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Lifecycle hook executed on component initialization.
   * @returns void
   */
  ngOnInit(): void {
    this.loadInstallments();
  }

  /**
   * Loads the installments list from the backend service.
   * @returns void
   */
  loadInstallments(): void {
    this.loading = true;
    this._vouchersFeesService.getVoucherFees('7a067c90-bf5b-45d1-8f07-91b578e2d54d', '1', '1', '1').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.installments = response.data;
          this.total = this.installments.length;
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
   * Formats an ISO date string into `DD/MM/YYYY`.
   * @param dateString ISO date string.
   * @returns Formatted date string.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formats a numeric amount as an Argentine Peso currency string.
   * @param amount Numeric amount.
   * @returns Formatted currency string.
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Returns the Ng-Zorro badge status color for an installment status name.
   * @param statusName Status name string.
   * @returns Badge status color string.
   */
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'pagado': return 'success';
      case 'pendiente': return 'processing';
      case 'vencido': return 'error';
      default: return 'default';
    }
  }

  /**
   * Returns the Ng-Zorro icon name for an installment status name.
   * @param statusName Status name string.
   * @returns Icon name string.
   */
  getStatusIcon(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'pagado': return 'check-circle';
      case 'pendiente': return 'clock-circle';
      case 'vencido': return 'exclamation-circle';
      default: return 'info-circle';
    }
  }

  /**
   * Capitalizes the first letter of a status name.
   * @param name Raw status name.
   * @returns Capitalized status name.
   */
  formatStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Calculates the remaining days until the installment due date and returns badge metadata.
   * @param dueDate Due date string.
   * @returns Object containing day difference, badge color, and label text.
   */
  getDaysLeft(dueDate: string): { days: number; color: string; text: string } {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: diffDays, color: 'error', text: `${Math.abs(diffDays)} días de atraso` };
    } else if (diffDays === 0) {
      return { days: 0, color: 'warning', text: 'Hoy' };
    } else if (diffDays <= 3) {
      return { days: diffDays, color: 'warning', text: `${diffDays} días` };
    } else {
      return { days: diffDays, color: 'success', text: `${diffDays} días` };
    }
  }

  /**
   * Navigates to the installment creation form.
   * @returns void
   */
  createInstallment(): void {
    this._router.navigate(['/admin/user/voucher-fee/new']);
  }

  /**
   * Navigates to the installment edit form.
   * @param installment Installment record to edit.
   * @returns void
   */
  editInstallment(installment: VoucherFeeInterface): void {
    this._router.navigate(['/admin/user/voucher-fee/edit', installment.crd_uuid, installment.per_uuid, installment.vou_uuid, installment.vouf_uuid]);
  }

  /**
   * Prompts for confirmation and deletes an installment record.
   * @param installment Installment record to delete.
   * @returns void
   */
  deleteInstallment(installment: VoucherFeeInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar esta cuota?',
      `Vas a eliminar la cuota número ${installment.vouf_quotanumber}. Esta acción no se puede deshacer.`,
      () => {
        this.loading = true;
        this._vouchersFeesService.deleteVoucherFee(installment.usr_uuid, installment.crd_uuid, installment.per_uuid, installment.vou_uuid, installment.vouf_uuid).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this._messageService.success('Cuota eliminada', 'La cuota se eliminó correctamente');
              this.loadInstallments();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar la cuota');
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema de conexión al eliminar la cuota');
          }
        });
      }
    );
  }

  /**
   * Displays a toast notification with installment details.
   * @param installment Installment record to inspect.
   * @returns void
   */
  viewDetails(installment: VoucherFeeInterface): void {
    this.message.info(`Detalles de la cuota #${installment.vouf_quotanumber}`);
  }

  /**
   * Marks an installment as paid in the UI.
   * @param installment Installment record to update.
   * @returns void
   */
  markAsPaid(installment: VoucherFeeInterface): void {
    installment.voufs.voufs_name = 'pagado';
    this.message.success(`Cuota #${installment.vouf_quotanumber} marcada como pagada`);
  }

  /**
   * Marks an installment as pending in the UI.
   * @param installment Installment record to update.
   * @returns void
   */
  markAsPending(installment: VoucherFeeInterface): void {
    installment.voufs.voufs_name = 'pendiente';
    this.message.info(`Cuota #${installment.vouf_quotanumber} marcada como pendiente`);
  }

  /**
   * Handles table page size changes.
   * @param size New page size.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadInstallments();
  }

  /**
   * Handles table page index changes.
   * @param index New page index.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadInstallments();
  }
}
