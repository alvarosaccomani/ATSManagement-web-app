import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VoucherFeeInterface } from '../../../core/interfaces/voucher-fee.interface';

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

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadInstallments();
  }

  loadInstallments(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.installments = [
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          vou_uuid: "1",
          vouf_uuid: "1",
          vouf_quotanumber: 1,
          vouf_quotaamount: 100,
          vouf_quotaduedate: "2026-10-02",
          voufs_uuid: "1",
          voufs: {
            voufs_uuid: "1",
            voufs_name: "pendiente",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T19:32:02-03:00",
          vouf_updatedat: "2026-02-10T19:32:02-03:00"
        },
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          vou_uuid: "1",
          vouf_uuid: "2",
          vouf_quotanumber: 2,
          vouf_quotaamount: 100,
          vouf_quotaduedate: "2026-11-02",
          voufs_uuid: "1",
          voufs: {
            voufs_uuid: "1",
            voufs_name: "pendiente",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T19:32:02-03:00",
          vouf_updatedat: "2026-02-10T19:32:02-03:00"
        },
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          vou_uuid: "1",
          vouf_uuid: "3",
          vouf_quotanumber: 3,
          vouf_quotaamount: 100,
          vouf_quotaduedate: "2026-12-02",
          voufs_uuid: "1",
          voufs: {
            voufs_uuid: "1",
            voufs_name: "pendiente",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T19:32:02-03:00",
          vouf_updatedat: "2026-02-10T19:32:02-03:00"
        },
        {
          usr_uuid: "8b178d01-c06c-56e2-9f18-02c689f3e65e",
          crd_uuid: "2",
          per_uuid: "2",
          vou_uuid: "2",
          vouf_uuid: "4",
          vouf_quotanumber: 1,
          vouf_quotaamount: 500,
          vouf_quotaduedate: "2026-09-15",
          voufs_uuid: "2",
          voufs: {
            voufs_uuid: "2",
            voufs_name: "pagado",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T20:15:30-03:00",
          vouf_updatedat: "2026-02-10T20:15:30-03:00"
        },
        {
          usr_uuid: "8b178d01-c06c-56e2-9f18-02c689f3e65e",
          crd_uuid: "2",
          per_uuid: "2",
          vou_uuid: "2",
          vouf_uuid: "5",
          vouf_quotanumber: 2,
          vouf_quotaamount: 500,
          vouf_quotaduedate: "2026-10-15",
          voufs_uuid: "1",
          voufs: {
            voufs_uuid: "1",
            voufs_name: "pendiente",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T20:15:30-03:00",
          vouf_updatedat: "2026-02-10T20:15:30-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          per_uuid: "3",
          vou_uuid: "3",
          vouf_uuid: "6",
          vouf_quotanumber: 1,
          vouf_quotaamount: 1250,
          vouf_quotaduedate: "2025-12-01",
          voufs_uuid: "3",
          voufs: {
            voufs_uuid: "3",
            voufs_name: "vencido",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T21:05:45-03:00",
          vouf_updatedat: "2026-02-10T21:05:45-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          per_uuid: "3",
          vou_uuid: "3",
          vouf_uuid: "7",
          vouf_quotanumber: 2,
          vouf_quotaamount: 1250,
          vouf_quotaduedate: "2026-01-01",
          voufs_uuid: "3",
          voufs: {
            voufs_uuid: "3",
            voufs_name: "vencido",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T21:05:45-03:00",
          vouf_updatedat: "2026-02-10T21:05:45-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          per_uuid: "3",
          vou_uuid: "3",
          vouf_uuid: "8",
          vouf_quotanumber: 3,
          vouf_quotaamount: 1250,
          vouf_quotaduedate: "2026-02-01",
          voufs_uuid: "1",
          voufs: {
            voufs_uuid: "1",
            voufs_name: "pendiente",
            voufs_description: null,
            voufs_createdat: "2026-02-08T22:27:00.835Z",
            voufs_updatedat: "2026-02-08T22:27:00.835Z"
          },
          vouf_createdat: "2026-02-10T21:05:45-03:00",
          vouf_updatedat: "2026-02-10T21:05:45-03:00"
        }
      ];
      
      this.total = this.installments.length;
      this.loading = false;
    }, 800);
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
    this.message.info('Crear nueva cuota');
  }

  editInstallment(installment: VoucherFeeInterface): void {
    this.message.info(`Editar cuota #${installment.vouf_quotanumber}`);
  }

  deleteInstallment(installment: VoucherFeeInterface): void {
    this.message.success(`Cuota #${installment.vouf_quotanumber} eliminada`);
    this.installments = this.installments.filter(i => i.vouf_uuid !== installment.vouf_uuid);
    this.total = this.installments.length;
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
