import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VoucherStateInterface } from '../../../core/interfaces/voucher-state.interface';

@Component({
  selector: 'app-vouchers-states',
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
  templateUrl: './vouchers-states.component.html',
  styleUrl: './vouchers-states.component.scss'
})
export class VouchersStatesComponent implements OnInit {
  voucherStatuses: VoucherStateInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'vous_uuid', title: 'ID', width: '80px' },
    { key: 'vous_name', title: 'Nombre', width: '150px' },
    { key: 'vous_description', title: 'Descripción', width: '250px' },
    { key: 'vous_createdat', title: 'Creado', width: '180px' },
    { key: 'vous_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadVoucherStatuses();
  }

  loadVoucherStatuses(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.voucherStatuses = [
        {
          vous_uuid: "2",
          vous_name: "anulado",
          vous_description: null,
          vous_createdat: "2026-02-08T17:56:04-03:00",
          vous_updatedat: "2026-02-08T17:56:04-03:00"
        },
        {
          vous_uuid: "1",
          vous_name: "confirmado",
          vous_description: null,
          vous_createdat: "2026-02-08T17:56:04-03:00",
          vous_updatedat: "2026-02-08T17:56:04-03:00"
        },
        {
          vous_uuid: "3",
          vous_name: "disputado",
          vous_description: null,
          vous_createdat: "2026-02-08T17:56:04-03:00",
          vous_updatedat: "2026-02-08T17:56:04-03:00"
        },
        {
          vous_uuid: "4",
          vous_name: "pendiente",
          vous_description: null,
          vous_createdat: "2026-02-08T17:56:04-03:00",
          vous_updatedat: "2026-02-08T17:56:04-03:00"
        }
      ];
      
      this.total = this.voucherStatuses.length;
      this.loading = false;
    }, 800);
  }

  // Obtener color del tag según el estado del comprobante
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'anulado': return 'default';
      case 'disputado': return 'warning';
      case 'pendiente': return 'processing';
      default: return 'default';
    }
  }

  // Obtener icono según el estado del comprobante
  getStatusIcon(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'check-circle';
      case 'anulado': return 'stop';
      case 'disputado': return 'question-circle';
      case 'pendiente': return 'clock-circle';
      default: return 'info-circle';
    }
  }

  // Formatear nombre del estado
  formatStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Métodos de acción
  createVoucherStatus(): void {
    this.message.info('Crear nuevo estado de comprobante');
  }

  editVoucherStatus(status: VoucherStateInterface): void {
    this.message.info(`Editar estado: ${this.formatStatusName(status.vous_name)}`);
  }

  deleteVoucherStatus(status: VoucherStateInterface): void {
    this.message.success(`Estado eliminado: ${this.formatStatusName(status.vous_name)}`);
    this.voucherStatuses = this.voucherStatuses.filter(s => s.vous_uuid !== status.vous_uuid);
    this.total = this.voucherStatuses.length;
  }

  viewDetails(status: VoucherStateInterface): void {
    this.message.info(`Detalles de: ${this.formatStatusName(status.vous_name)}`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadVoucherStatuses();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadVoucherStatuses();
  }
}