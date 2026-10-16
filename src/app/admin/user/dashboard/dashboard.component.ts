import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { DashboardSummary } from '../../../core/interfaces/dashboard.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente de Panel de Control Financiero (`<app-dashboard>`) en `/admin/user/dashboard`.
 *
 * @description Muestra indicadores clave de rendimiento (KPI) financieros globales o filtrados por ámbito (Ingresos Totales, Egresos Totales,
 * Saldo Neto de Caja, Total de Transacciones), una tabla de resumen de saldos por ámbito y las 10 transacciones más recientes.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule,
    NzProgressModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  /** Indica si las métricas del panel de control se están cargando actualmente. */
  isLoading = false;
  /** UUID del usuario activo. */
  usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
  /** Filtro de ámbito seleccionado actualmente (`'ALL'` o un `scp_uuid` específico). */
  selectedScopeUuid: string = 'ALL';
  /** Ámbitos disponibles para el menú desplegable de filtro. */
  scopes: ScopeInterface[] = [];
  /** Datos consolidados del resumen financiero devueltos por el backend. */
  summary: DashboardSummary | null = null;

  /**
   * Inicializa el componente de panel de control financiero.
   *
   * @param _dashboardService Servicio para obtener las métricas de resumen del panel de control.
   * @param _scopesService Servicio para obtener los ámbitos del usuario.
   * @param _messageService Servicio para mostrar mensajes modales de error.
   * @param _router Instancia de `Router` de Angular.
   */
  constructor(
    private _dashboardService: DashboardService,
    private _scopesService: ScopesService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  /**
   * Carga los ámbitos del usuario y el resumen inicial del panel de control al iniciar el componente.
   */
  ngOnInit(): void {
    this.loadScopes();
  }

  /**
   * Obtiene los ámbitos disponibles desde {@link ScopesService}, antepone la opción `'ALL'` y carga el resumen.
   */
  loadScopes(): void {
    this._scopesService.getScopes(this.usr_uuid).subscribe({
      next: (response) => {
        if (response.success) {
          const allOption: ScopeInterface = {
            scp_uuid: 'ALL',
            scp_name: 'Todos los ámbitos',
            scp_isshared: false,
            usr_uuidowner: this.usr_uuid,
            scp_active: true,
            scp_color: '#108ee9'
          };
          this.scopes = [allOption, ...response.data];
          this.loadSummary();
        }
      }
    });
  }

  /**
   * Obtiene el resumen del panel de control financiero para `selectedScopeUuid`.
   */
  loadSummary(): void {
    this.isLoading = true;
    this._dashboardService.getSummary(this.usr_uuid, this.selectedScopeUuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.summary = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar el resumen del dashboard.');
      }
    });
  }

  /**
   * Se ejecuta cuando el usuario selecciona un filtro de ámbito diferente; recarga el resumen del panel de control.
   *
   * @param scp_uuid UUID del ámbito seleccionado o `'ALL'`.
   */
  onScopeChange(scp_uuid: string): void {
    this.selectedScopeUuid = scp_uuid;
    this.loadSummary();
  }

  /**
   * Navega al formulario de nueva transacción (`/admin/user/transaction/new`), pasando el ámbito activo si está seleccionado.
   */
  newTransaction(): void {
    this._router.navigate(['/admin/user/transaction/new'], {
      queryParams: { scp_uuid: this.selectedScopeUuid !== 'ALL' ? this.selectedScopeUuid : undefined }
    });
  }

  /**
   * Navega al formulario de nuevo contacto/persona (`/admin/user/person/new`).
   */
  newPerson(): void {
    this._router.navigate(['/admin/user/person/new']);
  }

  /**
   * Navega al formulario de nuevo ámbito (`/admin/user/scope/new`).
   */
  newScope(): void {
    this._router.navigate(['/admin/user/scope/new']);
  }

  /**
   * Formatea un monto numérico en notación de moneda Peso Argentino (`ARS`).
   *
   * @param amount Valor numérico a formatear.
   * @returns Cadena de moneda formateada.
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  /**
   * Devuelve el color de estado de insignia de Ng-Zorro correspondiente a un tipo de transacción.
   *
   * @param type Tipo de transacción (`'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'`).
   * @returns Nombre del color de etiqueta (`'success' | 'error' | 'processing' | 'default'`).
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'INGRESO': return 'success';
      case 'EGRESO': return 'error';
      case 'TRANSFERENCIA': return 'processing';
      default: return 'default';
    }
  }
}
