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
  isLoading = false;
  usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
  selectedScopeUuid: string = 'ALL';
  scopes: ScopeInterface[] = [];
  summary: DashboardSummary | null = null;

  constructor(
    private _dashboardService: DashboardService,
    private _scopesService: ScopesService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadScopes();
  }

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

  onScopeChange(scp_uuid: string): void {
    this.selectedScopeUuid = scp_uuid;
    this.loadSummary();
  }

  newTransaction(): void {
    this._router.navigate(['/admin/user/transaction/new'], {
      queryParams: { scp_uuid: this.selectedScopeUuid !== 'ALL' ? this.selectedScopeUuid : undefined }
    });
  }

  newPerson(): void {
    this._router.navigate(['/admin/user/person/new']);
  }

  newScope(): void {
    this._router.navigate(['/admin/user/scope/new']);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'INGRESO': return 'success';
      case 'EGRESO': return 'error';
      case 'TRANSFERENCIA': return 'processing';
      default: return 'default';
    }
  }
}
