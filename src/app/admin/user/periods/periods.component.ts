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
import { PeriodInterface } from '../../../core/interfaces/period.interface';

@Component({
  selector: 'app-periods',
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
  templateUrl: './periods.component.html',
  styleUrl: './periods.component.scss'
})
export class PeriodsComponent implements OnInit {
  periods: PeriodInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'per_uuid', title: 'ID', width: '80px' },
    { key: 'period_number', title: 'Período', width: '100px' },
    { key: 'start_date', title: 'Inicio', width: '110px' },
    { key: 'end_date', title: 'Fin', width: '110px' },
    { key: 'due_date', title: 'Vencimiento', width: '110px' },
    { key: 'status', title: 'Estado', width: '110px' },
    { key: 'previous_balance', title: 'Saldo Anterior', width: '140px' },
    { key: 'interest', title: 'Interés', width: '120px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadPeriods();
  }

  loadPeriods(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.periods = [
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          per_periodnumber: 202601,
          per_startdate: "2026-01-01",
          per_enddate: "2026-01-31",
          per_duedate: "2026-02-10",
          sper_uuid: "1",
          sper: {
            sper_uuid: "1",
            sper_name: "Abierto",
            sper_description: null,
            sper_createdat: "2026-02-08T18:57:23.402Z",
            sper_updatedat: "2026-02-08T18:57:23.402Z"
          },
          per_previousbalance: 0,
          per_interest: 0,
          per_createdat: "2026-02-08T15:58:04-03:00",
          per_updatedat: "2026-02-08T15:58:04-03:00"
        },
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "2",
          per_periodnumber: 202602,
          per_startdate: "2026-02-01",
          per_enddate: "2026-02-28",
          per_duedate: "2026-03-10",
          sper_uuid: "2",
          sper: {
            sper_uuid: "2",
            sper_name: "Cerrado",
            sper_description: null,
            sper_createdat: "2026-02-08T18:57:23.402Z",
            sper_updatedat: "2026-02-08T18:57:23.402Z"
          },
          per_previousbalance: 15000,
          per_interest: 150,
          per_createdat: "2026-02-08T16:30:00-03:00",
          per_updatedat: "2026-02-08T16:30:00-03:00"
        },
        {
          usr_uuid: "8b178d01-c06c-56e2-9f18-02c689f3e65e",
          crd_uuid: "2",
          per_uuid: "3",
          per_periodnumber: 202601,
          per_startdate: "2026-01-01",
          per_enddate: "2026-01-31",
          per_duedate: "2026-02-10",
          sper_uuid: "3",
          sper: {
            sper_uuid: "3",
            sper_name: "Pagado",
            sper_description: null,
            sper_createdat: "2026-02-08T18:57:23.402Z",
            sper_updatedat: "2026-02-08T18:57:23.402Z"
          },
          per_previousbalance: 45000,
          per_interest: 450,
          per_createdat: "2026-02-08T17:15:22-03:00",
          per_updatedat: "2026-02-08T17:15:22-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          per_uuid: "4",
          per_periodnumber: 202512,
          per_startdate: "2025-12-01",
          per_enddate: "2025-12-31",
          per_duedate: "2026-01-10",
          sper_uuid: "4",
          sper: {
            sper_uuid: "4",
            sper_name: "Vencido",
            sper_description: null,
            sper_createdat: "2026-02-08T18:57:23.402Z",
            sper_updatedat: "2026-02-08T18:57:23.402Z"
          },
          per_previousbalance: 78500,
          per_interest: 785,
          per_createdat: "2026-02-08T14:20:45-03:00",
          per_updatedat: "2026-02-08T14:20:45-03:00"
        },
        {
          usr_uuid: "0d390f23-e28e-78g4-1h30-24e801h5g87g",
          crd_uuid: "4",
          per_uuid: "5",
          per_periodnumber: 202603,
          per_startdate: "2026-03-01",
          per_enddate: "2026-03-31",
          per_duedate: "2026-04-10",
          sper_uuid: "1",
          sper: {
            sper_uuid: "1",
            sper_name: "Abierto",
            sper_description: null,
            sper_createdat: "2026-02-08T18:57:23.402Z",
            sper_updatedat: "2026-02-08T18:57:23.402Z"
          },
          per_previousbalance: 25000,
          per_interest: 250,
          per_createdat: "2026-02-08T18:00:00-03:00",
          per_updatedat: "2026-02-08T18:00:00-03:00"
        }
      ];
      
      this.total = this.periods.length;
      this.loading = false;
    }, 800);
  }

  // Formatear número de período (YYYYMM → MM/YYYY)
  formatPeriodNumber(periodNumber: number): string {
    const periodStr = periodNumber.toString();
    const year = periodStr.substring(0, 4);
    const month = periodStr.substring(4, 6);
    return `${month}/${year}`;
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Verificar si la fecha de vencimiento está próxima o vencida
  getDueDateStatus(dueDate: string): { color: string; text: string } {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { color: 'error', text: 'Vencido' };
    } else if (diffDays <= 3) {
      return { color: 'warning', text: 'Próximo' };
    } else {
      return { color: 'success', text: 'Al día' };
    }
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

  // Formatear montos monetarios
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Métodos de acción
  createPeriod(): void {
    this._router.navigate(['/admin/user/period/new']);
  }

  editPeriod(period: PeriodInterface): void {
    this._router.navigate(['/admin/user/period/edit', period.per_uuid]);
  }

  deletePeriod(period: PeriodInterface): void {
    this.message.success(`Período eliminado: ${this.formatPeriodNumber(period.per_periodnumber)}`);
    this.periods = this.periods.filter(p => p.per_uuid !== period.per_uuid);
    this.total = this.periods.length;
  }

  viewDetails(period: PeriodInterface): void {
    this.message.info(`Detalles del período: ${this.formatPeriodNumber(period.per_periodnumber)}`);
  }

  closePeriod(period: PeriodInterface): void {
    this.message.success(`Período cerrado: ${this.formatPeriodNumber(period.per_periodnumber)}`);
    // Aquí iría la lógica para cerrar el período
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPeriods();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPeriods();
  }
}