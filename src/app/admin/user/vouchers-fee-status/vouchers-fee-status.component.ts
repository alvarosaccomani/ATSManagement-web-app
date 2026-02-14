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
  installmentStatuses: VoucherFeeStatusInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'voufs_uuid', title: 'ID', width: '80px' },
    { key: 'voufs_name', title: 'Nombre', width: '150px' },
    { key: 'voufs_description', title: 'Descripción', width: '250px' },
    { key: 'voufs_createdat', title: 'Creado', width: '180px' },
    { key: 'voufs_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private _vouchersFeeStatusService: VouchersFeeStatusService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadInstallmentStatuses();
  }

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

  // Obtener color del tag según el estado de la cuota
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'pagado': return 'success';
      case 'pendiente': return 'processing';
      case 'vencido': return 'error';
      default: return 'default';
    }
  }

  // Obtener icono según el estado de la cuota
  getStatusIcon(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'pagado': return 'check-circle';
      case 'pendiente': return 'clock-circle';
      case 'vencido': return 'exclamation-circle';
      default: return 'info-circle';
    }
  }

  // Formatear nombre del estado
  formatStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Métodos de acción
  createInstallmentStatus(): void {
    this.message.info('Crear nuevo estado de cuota');
  }

  editInstallmentStatus(status: VoucherFeeStatusInterface): void {
    this.message.info(`Editar estado: ${this.formatStatusName(status.voufs_name)}`);
  }

  deleteInstallmentStatus(status: VoucherFeeStatusInterface): void {
    this.message.success(`Estado eliminado: ${this.formatStatusName(status.voufs_name)}`);
    this.installmentStatuses = this.installmentStatuses.filter(s => s.voufs_uuid !== status.voufs_uuid);
    this.total = this.installmentStatuses.length;
  }

  viewDetails(status: VoucherFeeStatusInterface): void {
    this.message.info(`Detalles de: ${this.formatStatusName(status.voufs_name)}`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadInstallmentStatuses();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadInstallmentStatuses();
  }
}