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
import { VoucherStateInterface } from '../../../core/interfaces/voucher-state';
import { VouchersStatesService } from '../../../core/services/vouchers-states.service';
import { MessageService } from '../../../core/services/message.service';

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

  constructor(
    private _router: Router,
    private _vouchersStatesService: VouchersStatesService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadVoucherStatuses();
  }

  loadVoucherStatuses(): void {
    this.loading = true;
    this._vouchersStatesService.getVoucherStates().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.voucherStatuses = response.data;
          this.total = this.voucherStatuses.length;
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
    this._router.navigate(['/admin/user/voucher-state/new']);
  }

  editVoucherStatus(status: VoucherStateInterface): void {
    this._router.navigate(['/admin/user/voucher-state/edit', status.vous_uuid]);
  }

  deleteVoucherStatus(status: VoucherStateInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este estado de comprobante?',
      `Estás a punto de eliminar el estado de comprobante "${this.formatStatusName(status.vous_name)}". Esta acción no se puede deshacer.`,
      () => {
        this._vouchersStatesService.deleteVoucherState(status.vous_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Estado eliminado', `El estado de comprobante "${this.formatStatusName(status.vous_name)}" se eliminó correctamente`);
              this.loadVoucherStatuses();
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

  viewDetails(status: VoucherStateInterface): void {
    this.message.info(`Nombre: ${this.formatStatusName(status.vous_name)}\nDescripción: ${status.vous_description || 'Sin descripción'}`);
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