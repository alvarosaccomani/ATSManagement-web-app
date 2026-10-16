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

/**
 * Seller commissions settlement and tracking component (`<app-seller-commissions>`)
 * at `/admin/user/seller-commissions`.
 *
 * @description Displays commercial performance KPIs (`total_sales`, `total_commission`, `sales_count`)
 * and a detailed settlement table of commissionable sales filtered by scope.
 */
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
  /** Indicates whether commission metrics are currently loading. */
  isLoading = false;
  /** Active user UUID. */
  usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
  /** Currently selected scope filter (`'ALL'` by default). */
  selectedScopeUuid: string = 'ALL';
  /** Available scopes for the filter dropdown. */
  scopes: ScopeInterface[] = [];
  /** Seller commission summary data returned by the backend. */
  summary: SellerCommissionSummary | null = null;

  /**
   * Initializes the seller commissions component.
   *
   * @param _commissionsService Service for querying seller commission summaries.
   * @param _scopesService Service for querying user scopes.
   * @param _messageService Service for displaying modal error messages.
   */
  constructor(
    private _commissionsService: CommissionsService,
    private _scopesService: ScopesService,
    private _messageService: MessageService
  ) {}

  /**
   * Loads scopes and commission data on component initialization.
   */
  ngOnInit(): void {
    this.loadScopes();
  }

  /**
   * Fetches user scopes, prepends `'ALL'`, and loads the initial commission summary.
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
          this.loadCommissions();
        }
      }
    });
  }

  /**
   * Fetches the seller commission summary for `selectedScopeUuid` via {@link CommissionsService.getSellerCommissions}.
   */
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

  /**
   * Reloads commission data when the user changes the scope filter.
   *
   * @param scp_uuid Selected scope UUID or `'ALL'`.
   */
  onScopeChange(scp_uuid: string): void {
    this.selectedScopeUuid = scp_uuid;
    this.loadCommissions();
  }

  /**
   * Formats a numeric amount into Argentine Peso (`ARS`) currency notation.
   *
   * @param amount Numeric value to format.
   * @returns Formatted currency string.
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
  }
}
