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
import { PeriodInterface } from '../../../core/interfaces/period';
import { PeriodsService } from '../../../core/services/periods.service';

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
    private _periodsService: PeriodsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadPeriods();
  }

  loadPeriods(): void {
    this.loading = true;
    this._periodsService.getPedriods('7a067c90-bf5b-45d1-8f07-91b578e2d54d', '1').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.periods = response.data;
          this.total = this.periods.length;
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
    this._router.navigate(['/admin/user/period/edit', period.crd_uuid, period.per_uuid]);
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