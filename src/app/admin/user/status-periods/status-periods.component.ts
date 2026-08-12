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
import { StatusPeriodInterface } from '../../../core/interfaces/status-period';
import { StatusPeriodsService } from '../../../core/services/status-periods.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-status-periods',
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
  templateUrl: './status-periods.component.html',
  styleUrl: './status-periods.component.scss'
})
export class StatusPeriodsComponent implements OnInit {
  periodStatuses: StatusPeriodInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'sper_uuid', title: 'ID', width: '80px' },
    { key: 'sper_name', title: 'Nombre', width: '150px' },
    { key: 'sper_description', title: 'Descripción', width: '250px' },
    { key: 'sper_createdat', title: 'Creado', width: '180px' },
    { key: 'sper_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private _statusPeriodsService: StatusPeriodsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPeriodStatuses();
  }

  loadPeriodStatuses(): void {
    this.loading = true;
    this._statusPeriodsService.getStatusPeriods().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.periodStatuses = response.data;
          this.total = this.periodStatuses.length;
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

  // Obtener color del tag según el estado
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'abierto': return 'success';
      case 'cerrado': return 'default';
      case 'pagado': return 'processing';
      case 'vencido': return 'error';
      default: return 'default';
    }
  }

  // Métodos de acción
  createPeriodStatus(): void {
    this._router.navigate(['/admin/user/status-period/new']);
  }

  editPeriodStatus(status: StatusPeriodInterface): void {
    this._router.navigate(['/admin/user/status-period/edit', status.sper_uuid]);
  }

  deletePeriodStatus(status: StatusPeriodInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este estado de período?',
      `Estás a punto de eliminar el estado de período "${status.sper_name}". Esta acción no se puede deshacer.`,
      () => {
        this._statusPeriodsService.deleteStatusPeriod(status.sper_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Estado eliminado', `El estado de período "${status.sper_name}" se eliminó correctamente`);
              this.loadPeriodStatuses();
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

  viewDetails(status: StatusPeriodInterface): void {
    this.message.info(`Nombre: ${status.sper_name}\nDescripción: ${status.sper_description || 'Sin descripción'}`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPeriodStatuses();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPeriodStatuses();
  }
}