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
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente para listar y gestionar períodos de facturación de tarjetas.
 * @description Muestra una tabla paginada de períodos de facturación con rangos de fechas, insignias de estado, saldos anteriores y acciones CRUD.
 */
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
  /** Arreglo de registros de períodos de facturación cargados. */
  periods: PeriodInterface[] = [];
  /** Indicador de si los datos de la tabla se están cargando. */
  loading = false;
  /** Índice de la página actual (basado en 1). */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de períodos. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
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

  /**
   * Inicializa el componente PeriodsComponent.
   * @param _router Servicio Router de Angular.
   * @param _periodsService Servicio para operaciones CRUD de períodos de facturación.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private _router: Router,
    private _periodsService: PeriodsService,
    private _sessionService: SessionService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.loadPeriods();
  }

  /**
   * Carga la lista de períodos de facturación desde el servicio de backend.
   * @returns void
   */
  loadPeriods(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.periods = [];
      this.total = 0;
      this.loading = false;
      return;
    }
    this.loading = true;
    this._periodsService.getPedriods(usr_uuid, '1').subscribe(
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

  /**
   * Formatea un período numérico (`YYYYMM`) como `MM/YYYY`.
   * @param periodNumber Valor numérico del período.
   * @returns Cadena de período formateada.
   */
  formatPeriodNumber(periodNumber: number): string {
    const periodStr = periodNumber.toString();
    const year = periodStr.substring(0, 4);
    const month = periodStr.substring(4, 6);
    return `${month}/${year}`;
  }

  /**
   * Formatea una cadena de fecha ISO como `DD/MM/YYYY`.
   * @param dateString Cadena de fecha ISO.
   * @returns Cadena de fecha formateada.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Evalúa si la fecha de vencimiento de un período está vencida, próxima a vencer o al día.
   * @param dueDate Cadena con la fecha de vencimiento.
   * @returns Objeto que contiene el color de la insignia y el texto del estado.
   */
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

  /**
   * Devuelve el color de estado de insignia de Ng-Zorro para un nombre de estado de período.
   * @param statusName Nombre del estado del período.
   * @returns Cadena con el color de estado de la insignia.
   */
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'abierto': return 'success';
      case 'cerrado': return 'default';
      case 'pagado': return 'processing';
      case 'vencido': return 'error';
      default: return 'default';
    }
  }

  /**
   * Formatea un monto numérico como una cadena de moneda en Pesos Argentinos.
   * @param amount Monto numérico.
   * @returns Cadena de moneda formateada.
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
   * Navega al formulario de creación de período de facturación.
   * @returns void
   */
  createPeriod(): void {
    this._router.navigate(['/admin/user/period/new']);
  }

  /**
   * Navega al formulario de edición de período de facturación.
   * @param period Registro de período de facturación a editar.
   * @returns void
   */
  editPeriod(period: PeriodInterface): void {
    this._router.navigate(['/admin/user/period/edit', period.crd_uuid, period.per_uuid]);
  }

  /**
   * Solicita confirmación y elimina un registro de período de facturación.
   * @param period Registro de período de facturación a eliminar.
   * @returns void
   */
  deletePeriod(period: PeriodInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este período?',
      `Vas a eliminar el período "${this.formatPeriodNumber(period.per_periodnumber)}". Esta acción no se puede deshacer.`,
      () => {
        this.loading = true;
        this._periodsService.deletePeriod(period.usr_uuid, period.crd_uuid, period.per_uuid).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this._messageService.success('Período eliminado', 'El período se eliminó correctamente');
              this.loadPeriods();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar el período');
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema de conexión al eliminar el período');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación emergente con los detalles del período de facturación.
   * @param period Registro de período de facturación a inspeccionar.
   * @returns void
   */
  viewDetails(period: PeriodInterface): void {
    this.message.info(`Detalles del período: ${this.formatPeriodNumber(period.per_periodnumber)}`);
  }

  /**
   * Muestra una notificación emergente de confirmación para el cierre de un período de facturación.
   * @param period Registro de período de facturación a cerrar.
   * @returns void
   */
  closePeriod(period: PeriodInterface): void {
    this.message.success(`Período cerrado: ${this.formatPeriodNumber(period.per_periodnumber)}`);
    // Aquí iría la lógica para cerrar el período
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   * @param size Nuevo tamaño de página.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPeriods();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   * @param index Nuevo índice de página.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPeriods();
  }
}