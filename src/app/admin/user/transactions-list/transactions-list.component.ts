import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { TransactionInterface } from '../../../core/interfaces/transaction.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { TransactionsService } from '../../../core/services/transactions.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Cash-flow ledger list component (`<app-transactions-list>`) at `/admin/user/transactions`.
 *
 * @description Displays all recorded cash movements with combined filtering by scope,
 * movement type (`INGRESO`, `EGRESO`, `TRANSFERENCIA`), and real-time text search.
 */
@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzSpinModule,
    NzCardModule,
    NzSegmentedModule,
    NzToolTipModule
  ],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss'
})
export class TransactionsListComponent implements OnInit {
  /** Indicates whether the transactions list is currently loading. */
  isLoading = false;
  /** Unfiltered transactions returned by the backend for the selected scope and type. */
  transactions: TransactionInterface[] = [];
  /** Transactions matching the client-side text search filter. */
  filteredTransactions: TransactionInterface[] = [];
  /** Available scopes for the scope filter dropdown. */
  scopes: ScopeInterface[] = [];
  /** Currently selected scope UUID (`'ALL'` after initialization). */
  selectedScopeUuid: string = 'ALL';
  /** Currently selected movement type filter (`'ALL' | 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'`). */
  selectedType: string = 'ALL';
  /** Current text search query string. */
  searchValue: string = '';

  /**
   * Initializes the transactions list component.
   *
   * @param _transactionsService Service for querying and deleting transactions.
   * @param _scopesService Service for querying user scopes.
   * @param _sessionService Service for managing user session and identity.
   * @param _messageService Service for displaying modal notifications.
   * @param _router Angular `Router` instance.
   */
  constructor(
    private _transactionsService: TransactionsService,
    private _scopesService: ScopesService,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  /**
   * Loads scopes and transactions on component initialization.
   */
  ngOnInit(): void {
    this.loadScopes();
  }

  /**
   * Fetches user scopes, prepends `'ALL'`, and triggers initial transaction loading.
   */
  loadScopes(): void {
    const usr_uuid = this._sessionService.getIdentity()?.usr_uuid;
    if (!usr_uuid) return;
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          const allOption: ScopeInterface = {
            scp_uuid: 'ALL',
            scp_name: 'Todos los ámbitos',
            scp_isshared: false,
            usr_uuidowner: usr_uuid,
            scp_active: true,
            scp_color: '#108ee9'
          };
          this.scopes = [allOption, ...response.data];
          this.selectedScopeUuid = 'ALL';
          this.loadTransactions();
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  /**
   * Fetches transactions matching `selectedScopeUuid` and `selectedType` from {@link TransactionsService}.
   */
  loadTransactions(): void {
    if (!this.selectedScopeUuid) return;
    this.isLoading = true;
    const typeFilter = this.selectedType === 'ALL' ? undefined : this.selectedType;
    this._transactionsService.getTransactions(this.selectedScopeUuid, typeFilter).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.transactions = response.data;
          this.applyFilter();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudieron cargar los movimientos');
      }
    });
  }

  /**
   * Reloads transactions when the selected scope filter changes.
   *
   * @param scopeUuid Selected scope UUID or `'ALL'`.
   */
  onScopeChange(scopeUuid: string): void {
    this.selectedScopeUuid = scopeUuid;
    this.loadTransactions();
  }

  /**
   * Reloads transactions when the selected movement type filter changes.
   *
   * @param type Selected movement type (`'ALL' | 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'`).
   */
  onTypeChange(type: string): void {
    this.selectedType = type;
    this.loadTransactions();
  }

  /**
   * Filters `transactions` by `searchValue` across concept, associated person name, and notes.
   */
  applyFilter(): void {
    if (!this.searchValue.trim()) {
      this.filteredTransactions = [...this.transactions];
      return;
    }
    const term = this.searchValue.toLowerCase();
    this.filteredTransactions = this.transactions.filter(t => 
      t.trx_concept.toLowerCase().includes(term) ||
      (t.prs?.prs_name && t.prs.prs_name.toLowerCase().includes(term)) ||
      (t.trx_notes && t.trx_notes.toLowerCase().includes(term))
    );
  }

  /**
   * Navigates to the new transaction form (`/admin/user/transaction/new`), passing the active scope if selected.
   */
  newTransaction(): void {
    const queryParams = (this.selectedScopeUuid && this.selectedScopeUuid !== 'ALL')
      ? { scp_uuid: this.selectedScopeUuid }
      : {};
    this._router.navigate(['/admin/user/transaction/new'], { queryParams });
  }

  /**
   * Navigates to the edit form for the selected transaction (`/admin/user/transaction/edit/:trx_uuid`).
   *
   * @param trx Transaction record to edit.
   */
  editTransaction(trx: TransactionInterface): void {
    this._router.navigate(['/admin/user/transaction/edit', trx.trx_uuid]);
  }

  /**
   * Prompts for confirmation and deletes the selected transaction record.
   *
   * @param trx Transaction record to delete.
   */
  deleteTransaction(trx: TransactionInterface): void {
    this._messageService.confirm(
      '¿Eliminar Movimiento?',
      `¿Está seguro de eliminar "${trx.trx_concept}" de $ ${trx.trx_amount}?`,
      () => {
        this._transactionsService.deleteTransaction(trx.trx_uuid).subscribe({
          next: (response) => {
            if (response.success) {
              this._messageService.success('Movimiento Eliminado', 'El registro fue eliminado correctamente.');
              this.loadTransactions();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar el movimiento.');
            }
          },
          error: (error) => {
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema al eliminar el movimiento.');
          }
        });
      }
    );
  }

  /**
   * Maps a transaction type to an Ng-Zorro tag status color.
   *
   * @param type Movement type (`'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'`).
   * @returns Tag color string.
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'INGRESO': return 'success';
      case 'EGRESO': return 'error';
      case 'TRANSFERENCIA': return 'processing';
      default: return 'default';
    }
  }

  /**
   * Maps a transaction type to an Ng-Zorro icon name.
   *
   * @param type Movement type (`'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'`).
   * @returns Icon name string.
   */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'INGRESO': return 'arrow-down';
      case 'EGRESO': return 'arrow-up';
      case 'TRANSFERENCIA': return 'swap';
      default: return 'info-circle';
    }
  }

  /**
   * Formats a numeric amount into Argentine Peso (`ARS`) currency notation.
   *
   * @param amount Numeric amount to format.
   * @returns Formatted currency string.
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }
}
