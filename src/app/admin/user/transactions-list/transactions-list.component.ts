import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { TransactionInterface } from '../../../core/interfaces/transaction.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonInterface } from '../../../core/interfaces/person.interface';
import { TransactionsService } from '../../../core/services/transactions.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { PersonsService } from '../../../core/services/persons.service';
import { CardsService } from '../../../core/services/cards.service';
import { ExcelTransactionsService, ExcelParseResult, ParsedExpenseRow } from '../../../core/services/excel-transactions.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Cash-flow ledger list component (`<app-transactions-list>`) at `/admin/user/transactions`.
 *
 * @description Displays all recorded cash movements with combined filtering by scope,
 * movement type (`INGRESO`, `EGRESO`, `TRANSFERENCIA`), real-time text search,
 * and bulk expense template download and import via Excel.
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
    NzToolTipModule,
    NzModalModule,
    NzAlertModule,
    NzEmptyModule,
    RouterModule
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

  /** Controls visibility of the Excel import modal dialog. */
  isImportModalVisible = false;
  /** Indicates whether an uploaded Excel workbook is currently being parsed. */
  isParsingExcel = false;
  /** Indicates whether the parsed batch of transactions is being persisted to the backend. */
  isImporting = false;
  /** Target scope UUID selected for the bulk expense import. */
  importScopeUuid: string = '';
  /** Default movement type rule for spreadsheet parsing (`'AUTO' | 'EGRESO' | 'INGRESO'`). */
  importMovementType: 'AUTO' | 'EGRESO' | 'INGRESO' = 'EGRESO';
  /** Result of analyzing the uploaded Excel workbook, or `null` if no file is loaded. */
  parseResult: ExcelParseResult | null = null;
  /** Active filter for the Excel preview table (`'ALL' | 'WARNINGS' | 'VALID'`). */
  importPreviewFilter: 'ALL' | 'WARNINGS' | 'VALID' = 'ALL';
  /** Contacts belonging to the selected scope for buyer/supplier mapping. */
  scopePersons: PersonInterface[] = [];
  /** Available cards/accounts for optional funding account mapping. */
  userCards: any[] = [];

  /** Reference to the hidden file input element for triggering file selection. */
  @ViewChild('excelFileInput') excelFileInput?: ElementRef<HTMLInputElement>;

  /**
   * Initializes the transactions list component.
   *
   * @param _transactionsService Service for querying and saving transactions.
   * @param _scopesService Service for querying user scopes.
   * @param _personsService Service for querying contacts in scopes.
   * @param _cardsService Service for querying user accounts and cards.
   * @param _excelService Service for generating and parsing Excel workbooks.
   * @param _sessionService Service for managing user session and identity.
   * @param _messageService Service for displaying modal notifications.
   * @param _router Angular `Router` instance.
   */
  constructor(
    private _transactionsService: TransactionsService,
    private _scopesService: ScopesService,
    private _personsService: PersonsService,
    private _cardsService: CardsService,
    private _excelService: ExcelTransactionsService,
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
   * Obtiene el identificador del usuario autenticado actual desde la sesión.
   *
   * @returns Identificador UUID del usuario.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Indica si el usuario cuenta con ámbitos contables reales configurados o asignados.
   */
  get hasScopes(): boolean {
    return this.scopes.filter(s => s.scp_uuid !== 'ALL').length > 0;
  }

  /**
   * Obtiene la cantidad de filas que poseen advertencias o errores en la planilla analizada.
   */
  get observationsCount(): number {
    if (!this.parseResult) return 0;
    return this.parseResult.rows.filter(r => !r.isValid || (r.errors && r.errors.length > 0)).length;
  }

  /**
   * Obtiene la cantidad de filas perfectamente válidas sin observaciones.
   */
  get validWithoutObservationsCount(): number {
    if (!this.parseResult) return 0;
    return this.parseResult.rows.filter(r => r.isValid && (!r.errors || r.errors.length === 0)).length;
  }

  /**
   * Retorna las filas del archivo Excel filtradas según el criterio seleccionado en el modal.
   */
  get displayedParsedRows(): ParsedExpenseRow[] {
    if (!this.parseResult) return [];
    if (this.importPreviewFilter === 'WARNINGS') {
      return this.parseResult.rows.filter(r => !r.isValid || (r.errors && r.errors.length > 0));
    }
    if (this.importPreviewFilter === 'VALID') {
      return this.parseResult.rows.filter(r => r.isValid && (!r.errors || r.errors.length === 0));
    }
    return this.parseResult.rows;
  }

  /**
   * Fetches user scopes, prepends `'ALL'`, and triggers initial transaction loading.
   */
  loadScopes(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.isLoading = false;
      this.scopes = [];
      this.transactions = [];
      this.filteredTransactions = [];
      return;
    }

    this.isLoading = true;
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
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
        } else {
          this.scopes = [];
          this.selectedScopeUuid = '';
          this.transactions = [];
          this.filteredTransactions = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar ámbitos:', error);
        this.scopes = [];
        this.selectedScopeUuid = '';
        this.transactions = [];
        this.filteredTransactions = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Fetches transactions matching `selectedScopeUuid` and `selectedType` from {@link TransactionsService}.
   */
  loadTransactions(): void {
    if (!this.selectedScopeUuid || !this.hasScopes) {
      this.isLoading = false;
      this.transactions = [];
      this.filteredTransactions = [];
      return;
    }
    this.isLoading = true;
    const typeFilter = this.selectedType === 'ALL' ? undefined : this.selectedType;
    this._transactionsService.getTransactions(this.currentUserId, this.selectedScopeUuid, typeFilter).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.transactions = (response.data || []).sort((a, b) => {
            const diff = new Date(b.trx_datetime).getTime() - new Date(a.trx_datetime).getTime();
            if (diff !== 0) return diff;
            const createdA = a.trx_createdat ? new Date(a.trx_createdat).getTime() : 0;
            const createdB = b.trx_createdat ? new Date(b.trx_createdat).getTime() : 0;
            return createdB - createdA;
          });
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
   * Comparison function for Ng-Zorro table column sorting by date.
   *
   * @param a First transaction record.
   * @param b Second transaction record.
   * @returns Comparison difference number.
   */
  sortDateFn = (a: TransactionInterface, b: TransactionInterface): number => {
    const diff = new Date(a.trx_datetime).getTime() - new Date(b.trx_datetime).getTime();
    if (diff !== 0) return diff;
    const createdA = a.trx_createdat ? new Date(a.trx_createdat).getTime() : 0;
    const createdB = b.trx_createdat ? new Date(b.trx_createdat).getTime() : 0;
    return createdA - createdB;
  };

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
    if (!this.hasScopes) {
      this._messageService.error('Ámbito Requerido', 'Debes configurar o tener asignado al menos un ámbito contable antes de cargar movimientos.');
      return;
    }
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

  /**
   * Loads contacts belonging to the specified scope for buyer/supplier resolution.
   *
   * @param scp_uuid Scope UUID.
   */
  loadScopePersons(scp_uuid: string): void {
    if (!scp_uuid || scp_uuid === 'ALL') {
      this.scopePersons = [];
      return;
    }
    this._personsService.getPersons(scp_uuid).subscribe({
      next: (res) => {
        if (res.success) {
          this.scopePersons = res.data;
        }
      }
    });
  }

  /**
   * Loads payment cards and accounts belonging to the active user.
   */
  loadUserCards(): void {
    const usr_uuid = this.currentUserId;
    this._cardsService.getCards(usr_uuid).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.userCards = res.data.map((c: any) => ({
            value: c.crd_uuid,
            label: c.crd_alias || c.tycrd?.tycrd_name || 'Cuenta'
          }));
        }
      }
    });
  }

  /**
   * Generates and downloads the pre-configured expense Excel template (`.xlsx`).
   */
  downloadTemplate(): void {
    const activeScope = this.scopes.find(s => s.scp_uuid === (this.selectedScopeUuid !== 'ALL' ? this.selectedScopeUuid : '')) 
      || this.scopes.find(s => s.scp_uuid !== 'ALL') 
      || null;

    if (activeScope && (!this.scopePersons.length || this.scopePersons[0]?.scp_uuid !== activeScope.scp_uuid)) {
      this._personsService.getPersons(activeScope.scp_uuid).subscribe({
        next: (res) => {
          const persons = res.success ? res.data : [];
          this._excelService.downloadExpenseTemplate(activeScope, persons, this.userCards);
        },
        error: () => {
          this._excelService.downloadExpenseTemplate(activeScope, [], this.userCards);
        }
      });
    } else {
      this._excelService.downloadExpenseTemplate(activeScope, this.scopePersons, this.userCards);
    }
  }

  /**
   * Exporta las transacciones actualmente filtradas a una planilla Excel (.xlsx).
   */
  exportToExcel(): void {
    if (!this.filteredTransactions || this.filteredTransactions.length === 0) {
      this._messageService.error('Sin datos', 'No hay movimientos para exportar con los filtros actuales.');
      return;
    }

    const activeScope = this.scopes.find(s => s.scp_uuid === this.selectedScopeUuid);
    const scopeName = activeScope ? activeScope.scp_name : 'Todos';

    if (!this.userCards || this.userCards.length === 0) {
      const usr_uuid = this.currentUserId;
      this._cardsService.getCards(usr_uuid).subscribe({
        next: (res: any) => {
          const cards = (res.success && res.data)
            ? res.data.map((c: any) => ({
                value: c.crd_uuid,
                label: c.crd_alias || c.tycrd?.tycrd_name || 'Cuenta'
              }))
            : [];
          this._excelService.exportTransactionsToExcel(this.filteredTransactions, scopeName, cards);
        },
        error: () => {
          this._excelService.exportTransactionsToExcel(this.filteredTransactions, scopeName, []);
        }
      });
    } else {
      this._excelService.exportTransactionsToExcel(this.filteredTransactions, scopeName, this.userCards);
    }
  }

  /**
   * Opens the bulk Excel import modal dialog and prepares references.
   */
  openImportModal(): void {
    const defaultScope = (this.selectedScopeUuid && this.selectedScopeUuid !== 'ALL')
      ? this.selectedScopeUuid
      : (this.scopes.find(s => s.scp_uuid !== 'ALL')?.scp_uuid || '');

    this.importScopeUuid = defaultScope;
    this.parseResult = null;
    this.importPreviewFilter = 'ALL';
    this.isImportModalVisible = true;
    if (this.importScopeUuid) {
      this.loadScopePersons(this.importScopeUuid);
    }
    this.loadUserCards();
  }

  /**
   * Closes the bulk Excel import modal dialog and clears file input.
   */
  closeImportModal(): void {
    this.isImportModalVisible = false;
    this.parseResult = null;
    this.importPreviewFilter = 'ALL';
    if (this.excelFileInput?.nativeElement) {
      this.excelFileInput.nativeElement.value = '';
    }
  }

  /**
   * Handles target scope change within the import modal.
   *
   * @param scp_uuid Newly selected scope UUID.
   */
  onImportScopeChange(scp_uuid: string): void {
    this.importScopeUuid = scp_uuid;
    this.loadScopePersons(scp_uuid);
    if (this.excelFileInput?.nativeElement?.files?.[0]) {
      this.processFile(this.excelFileInput.nativeElement.files[0]);
    }
  }

  /**
   * Updates default movement type strategy and re-parses currently selected file if present.
   *
   * @param type Strategy for classifying transactions (`'AUTO' | 'EGRESO' | 'INGRESO'`).
   */
  onImportMovementTypeChange(type: 'AUTO' | 'EGRESO' | 'INGRESO'): void {
    this.importMovementType = type;
    if (this.excelFileInput?.nativeElement?.files?.[0]) {
      this.processFile(this.excelFileInput.nativeElement.files[0]);
    }
  }

  /**
   * Toggles a single row's transaction type between `'EGRESO'` and `'INGRESO'` in the preview table,
   * reevaluating consistency errors and updating overall aggregates.
   *
   * @param row Parsed expense row to toggle.
   */
  toggleRowType(row: ParsedExpenseRow): void {
    row.trx_type = row.trx_type === 'EGRESO' ? 'INGRESO' : 'EGRESO';

    if (row.trx_type === 'EGRESO') {
      row.errors = row.errors.filter(e => !e.includes('Inconsistencia contable'));
    } else {
      const EXPENSE_KEYWORDS = /compra|filamento|repuesto|arreglo|reparaci[oó]n|hotend|service|cuota\s+m[aá]quina|dominio|pinturer[ií]a|pinzas|chip|busto|cajas\s+para\s+despacho|pack\s+religioso|tarjetas\s+isa|pendrive|stl/i;
      if (EXPENSE_KEYWORDS.test(row.concept || '') || /compr[oó]|me\s+lo\s+cobro|puse\s+bono|gasto/i.test(row.notes || '')) {
        if (!row.errors.some(e => e.includes('Inconsistencia contable'))) {
          row.errors.push('Inconsistencia contable: El concepto o notas corresponden a un GASTO/COMPRA pero la fila está como INGRESO.');
        }
      }
    }

    const isBlockingError = (e: string) =>
      !e.includes('se conservará en notas') &&
      !e.startsWith('Aviso:') &&
      !e.startsWith('Corrección');

    row.isValid = row.errors.filter(isBlockingError).length === 0;

    if (this.parseResult) {
      this.parseResult.validRowsCount = this.parseResult.rows.filter(r => r.isValid).length;
      this.parseResult.invalidRowsCount = this.parseResult.rows.filter(r => !r.isValid).length;
      this.parseResult.totalExpenseAmount = this.parseResult.rows
        .filter(r => r.isValid && r.trx_type === 'EGRESO')
        .reduce((acc, r) => acc + r.amount, 0);
      this.parseResult.totalIncomeAmount = this.parseResult.rows
        .filter(r => r.isValid && r.trx_type === 'INGRESO')
        .reduce((acc, r) => acc + r.amount, 0);
      this.parseResult.totalAmount = this.parseResult.totalExpenseAmount + this.parseResult.totalIncomeAmount;
    }
  }

  /**
   * Handles file selection event from the native file input element.
   *
   * @param event DOM file change event.
   */
  onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  /**
   * Parses an Excel file using {@link ExcelTransactionsService}.
   *
   * @param file Uploaded Excel File object.
   */
  private processFile(file: File): void {
    this.isParsingExcel = true;
    const activeScope = this.scopes.find(s => s.scp_uuid === this.importScopeUuid);
    this._excelService.parseExpenseExcel(
      file,
      this.importScopeUuid,
      this.scopePersons,
      this.userCards,
      this.importMovementType,
      activeScope?.scp_settings
    )
      .then((result) => {
        this.isParsingExcel = false;
        this.parseResult = result;
        this.importPreviewFilter = 'ALL';
      })
      .catch((error) => {
        this.isParsingExcel = false;
        this.parseResult = null;
        console.error(error);
        this._messageService.error('Error al leer Excel', error.message || 'No se pudo interpretar la planilla.');
      });
  }

  /**
   * Submits all valid parsed rows to the backend in a single atomic bulk operation.
   */
  confirmBulkImport(): void {
    if (!this.parseResult || this.parseResult.validRowsCount === 0) {
      this._messageService.error('Sin datos válidos', 'No hay registros válidos para importar.');
      return;
    }

    if (!this.importScopeUuid) {
      this._messageService.error('Ámbito requerido', 'Seleccione el ámbito de destino para registrar los movimientos.');
      return;
    }

    this.isImporting = true;
    const usr_uuid = this.currentUserId;

    const payload = this.parseResult.rows
      .filter(r => r.isValid)
      .map(r => {
        const actorLabel = r.trx_type === 'INGRESO' ? 'Vendedor' : 'Pagó';
        const notes = r.rawBuyer && !r.prs_uuidactor
          ? (r.notes ? `${actorLabel}: ${r.rawBuyer}. ${r.notes}` : `${actorLabel}: ${r.rawBuyer}`)
          : r.notes;

        return {
          scp_uuid: this.importScopeUuid,
          usr_uuidcreator: usr_uuid,
          trx_type: r.trx_type,
          trx_datetime: r.date,
          trx_concept: r.concept,
          trx_amount: r.amount,
          trx_currency: 'ARS',
          crd_uuid: r.crd_uuid,
          prs_uuid: r.prs_uuid,
          prs_uuidactor: r.prs_uuidactor,
          trx_notes: notes
        };
      });

    this._transactionsService.saveBulkTransactions(payload).subscribe({
      next: (response) => {
        this.isImporting = false;
        if (response.success) {
          const importedCount = response.count || payload.length;
          this._messageService.success(
            '¡Importación Exitosa!',
            `Se han importado ${importedCount} movimientos correctamente por un total de ${this.formatAmount(this.parseResult!.totalAmount)}.`,
            () => {
              this.closeImportModal();
              this.loadTransactions();
            }
          );
        } else {
          this._messageService.error('Error al importar', response.message || 'No se pudieron registrar las transacciones.');
        }
      },
      error: (error) => {
        this.isImporting = false;
        console.error(error);
        this._messageService.error('Error al importar', error?.error?.error || 'Ocurrió un error al guardar los movimientos en el servidor.');
      }
    });
  }
}
