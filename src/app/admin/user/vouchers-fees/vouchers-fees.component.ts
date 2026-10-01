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
  installments: VoucherFeeInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'vouf_uuid', title: 'ID', width: '80px' },
    { key: 'quota_number', title: 'Cuota', width: '100px' },
    { key: 'amount', title: 'Monto', width: '120px' },
    { key: 'due_date', title: 'Vencimiento', width: '120px' },
    { key: 'status', title: 'Estado', width: '110px' },
    { key: 'days_left', title: 'Días Restantes', width: '120px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private _vouchersFeesService: VouchersFeesService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadInstallments();
  }

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

  // Formatear fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Formatear monto
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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

  // Calcular días restantes hasta el vencimiento
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

  // Métodos de acción
  createInstallment(): void {
    this._router.navigate(['/admin/user/voucher-fee/new']);
  }

  editInstallment(installment: VoucherFeeInterface): void {
    this._router.navigate(['/admin/user/voucher-fee/edit', installment.crd_uuid, installment.per_uuid, installment.vou_uuid, installment.vouf_uuid]);
  }

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

  viewDetails(installment: VoucherFeeInterface): void {
    this.message.info(`Detalles de la cuota #${installment.vouf_quotanumber}`);
  }

  markAsPaid(installment: VoucherFeeInterface): void {
    installment.voufs.voufs_name = 'pagado';
    this.message.success(`Cuota #${installment.vouf_quotanumber} marcada como pagada`);
  }

  markAsPending(installment: VoucherFeeInterface): void {
    installment.voufs.voufs_name = 'pendiente';
    this.message.info(`Cuota #${installment.vouf_quotanumber} marcada como pendiente`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadInstallments();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadInstallments();
  }
}
