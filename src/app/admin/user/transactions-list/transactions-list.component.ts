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
import { MessageService } from '../../../core/services/message.service';

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
  isLoading = false;
  transactions: TransactionInterface[] = [];
  filteredTransactions: TransactionInterface[] = [];
  scopes: ScopeInterface[] = [];
  selectedScopeUuid: string = '11111111-1111-1111-1111-111111111111'; // Default Personal Scope
  selectedType: string = 'ALL';
  searchValue: string = '';

  constructor(
    private _transactionsService: TransactionsService,
    private _scopesService: ScopesService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadScopes();
  }

  loadScopes(): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
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

  onScopeChange(scopeUuid: string): void {
    this.selectedScopeUuid = scopeUuid;
    this.loadTransactions();
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.loadTransactions();
  }

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

  newTransaction(): void {
    const queryParams = (this.selectedScopeUuid && this.selectedScopeUuid !== 'ALL')
      ? { scp_uuid: this.selectedScopeUuid }
      : {};
    this._router.navigate(['/admin/user/transaction/new'], { queryParams });
  }

  editTransaction(trx: TransactionInterface): void {
    this._router.navigate(['/admin/user/transaction/edit', trx.trx_uuid]);
  }

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

  getTypeColor(type: string): string {
    switch (type) {
      case 'INGRESO': return 'success';
      case 'EGRESO': return 'error';
      case 'TRANSFERENCIA': return 'processing';
      default: return 'default';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'INGRESO': return 'arrow-down';
      case 'EGRESO': return 'arrow-up';
      case 'TRANSFERENCIA': return 'swap';
      default: return 'info-circle';
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  }
}
