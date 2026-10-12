import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SellerCommissionSummary } from '../../../core/interfaces/commission.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { CommissionsService } from '../../../core/services/commissions.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-seller-commissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzSpinModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './seller-commissions.component.html',
  styleUrl: './seller-commissions.component.scss'
})
export class SellerCommissionsComponent implements OnInit {
  isLoading = false;
  usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
  selectedScopeUuid: string = 'ALL';
  scopes: ScopeInterface[] = [];
  summary: SellerCommissionSummary | null = null;

  constructor(
    private _commissionsService: CommissionsService,
    private _scopesService: ScopesService,
    private _messageService: MessageService
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
          this.loadCommissions();
        }
      }
    });
  }

  loadCommissions(): void {
    this.isLoading = true;
    this._commissionsService.getSellerCommissions(this.usr_uuid, this.selectedScopeUuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.summary = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudieron cargar las comisiones.');
      }
    });
  }

  onScopeChange(scp_uuid: string): void {
    this.selectedScopeUuid = scp_uuid;
    this.loadCommissions();
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
  }
}
