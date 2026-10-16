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
import { VoucherFeeStatusInterface } from '../../../core/interfaces/voucher-fee-status';
import { VouchersFeeStatusService } from '../../../core/services/vouchers-fee-status.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Component for listing and managing voucher fee (installment) status records.
 * @description Displays a paginated table of installment statuses with status badges, icons, and CRUD actions.
 */
@Component({
  selector: 'app-vouchers-fee-status',
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
  templateUrl: './vouchers-fee-status.component.html',
  styleUrl: './vouchers-fee-status.component.scss'
})
export class VouchersFeeStatusComponent implements OnInit {
  /** Array of loaded installment status records. */
  installmentStatuses: VoucherFeeStatusInterface[] = [];
  /** Flag indicating whether table data is loading. */
  loading = false;
  /** Current page index (1-based). */
  pageIndex = 1;
  /** Number of rows per page. */
  pageSize = 10;
  /** Total number of installment status records. */
  total = 0;

  /** Table column definitions. */
  listOfColumns = [
    { key: 'voufs_uuid', title: 'ID', width: '80px' },
    { key: 'voufs_name', title: 'Nombre', width: '150px' },
    { key: 'voufs_description', title: 'Descripción', width: '250px' },
    { key: 'voufs_createdat', title: 'Creado', width: '180px' },
    { key: 'voufs_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Initializes the VouchersFeeStatusComponent.
   * @param _router Angular Router service.
   * @param _vouchersFeeStatusService Service for installment status CRUD operations.
   * @param message Ng-Zorro toast message service.
   * @param _messageService Custom modal alert service.
   */
  constructor(
    private _router: Router,
    private _vouchersFeeStatusService: VouchersFeeStatusService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Lifecycle hook executed on component initialization.
   * @returns void
   */
  ngOnInit(): void {
    this.loadInstallmentStatuses();
  }

  /**
   * Loads the installment statuses list from the backend service.
   * @returns void
   */
  loadInstallmentStatuses(): void {
    this.loading = true;
    this._vouchersFeeStatusService.getVoucherFeeStatus().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.installmentStatuses = response.data;
          this.total = this.installmentStatuses.length;
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
   * Returns the Ng-Zorro badge status color for an installment status name.
   * @param statusName Installment status name.
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
   * @param statusName Installment status name.
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
   * Navigates to the installment status creation form.
   * @returns void
   */
  createInstallmentStatus(): void {
    this._router.navigate(['/admin/user/voucher-fee-status/new']);
  }

  /**
   * Navigates to the installment status edit form.
   * @param status Installment status record to edit.
   * @returns void
   */
  editInstallmentStatus(status: VoucherFeeStatusInterface): void {
    this._router.navigate(['/admin/user/voucher-fee-status/edit', status.voufs_uuid]);
  }

  /**
   * Prompts for confirmation and deletes an installment status record.
   * @param status Installment status record to delete.
   * @returns void
   */
  deleteInstallmentStatus(status: VoucherFeeStatusInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este estado de cuota?',
      `Estás a punto de eliminar el estado de cuota "${this.formatStatusName(status.voufs_name)}". Esta acción no se puede deshacer.`,
      () => {
        this._vouchersFeeStatusService.deleteVoucherFeeStatus(status.voufs_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Estado eliminado', `El estado de cuota "${this.formatStatusName(status.voufs_name)}" se eliminó correctamente`);
              this.loadInstallmentStatuses();
            } else {
              this._messageService.error('Error', response.message || 'Error al eliminar el estado');
            }
          },
          error: (error: any) => {
            console.error(error);
            this._messageService.error('Error', 'Error de conexión al intentar eliminar el estado');
          }
        });
      }
    );
  }

  /**
   * Displays a toast notification with installment status details.
   * @param status Installment status record to inspect.
   * @returns void
   */
  viewDetails(status: VoucherFeeStatusInterface): void {
    this.message.info(`Nombre: ${this.formatStatusName(status.voufs_name)}\nDescripción: ${status.voufs_description || 'Sin descripción'}`);
  }

  /**
   * Handles table page size changes.
   * @param size New page size.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadInstallmentStatuses();
  }

  /**
   * Handles table page index changes.
   * @param index New page index.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadInstallmentStatuses();
  }
}