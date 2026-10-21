import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { FixedExpensesService } from '../../../core/services/fixed-expenses.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { CardsService } from '../../../core/services/cards.service';
import { PersonsService } from '../../../core/services/persons.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import {
  FixedExpenseInterface,
  FixedExpenseInputDTO,
  PayFixedExpenseDTO,
  FixedExpenseCategory
} from '../../../core/interfaces/fixed-expense.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { CardInterface } from '../../../core/interfaces/card/card.interface';
import { PersonInterface } from '../../../core/interfaces/person.interface';

/**
 * Componente principal para la administración de Gastos Fijos y Servicios Recurrentes.
 * Permite el control del presupuesto mensual, seguimiento de débitos automáticos,
 * liquidación con actualización de importe real y visualización de KPIs financieros.
 */
@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTagModule,
    NzSpinModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzModalModule,
    NzSwitchModule,
    NzToolTipModule,
    NzBadgeModule,
    NzDividerModule,
    NzDatePickerModule,
    NzAlertModule,
    NzProgressModule
  ],
  templateUrl: './fixed-expenses.component.html',
  styleUrl: './fixed-expenses.component.scss'
})
export class FixedExpensesComponent implements OnInit {

  /** Indicador de estado de carga global de datos. */
  isLoading = false;

  /** Indicador de procesamiento de guardado en modales. */
  isSaving = false;

  /** Lista completa de gastos fijos retornados por la API para el ámbito y período seleccionados. */
  fixedExpenses: FixedExpenseInterface[] = [];

  /** Lista filtrada por texto, estado o tipo de débito para la grilla visual. */
  filteredExpenses: FixedExpenseInterface[] = [];

  /** Ámbitos contables disponibles para el usuario actual. */
  scopes: ScopeInterface[] = [];

  /** Ámbito contable actualmente seleccionado para el análisis. */
  selectedScopeUuid: string = '';

  /** Período mensual bajo análisis en formato 'YYYY-MM' (por defecto el mes actual). */
  selectedPeriod: string = '';

  /** Texto de búsqueda rápida para filtrar la grilla en tiempo real. */
  searchTerm: string = '';

  /** Filtro de estado de pago ('ALL' | 'PENDING' | 'PAID'). */
  statusFilter: 'ALL' | 'PENDING' | 'PAID' = 'ALL';

  /** Filtro por tipo de débito ('ALL' | 'AUTODEBIT' | 'MANUAL'). */
  debitFilter: 'ALL' | 'AUTODEBIT' | 'MANUAL' = 'ALL';

  /** Cuentas y tarjetas bancarias disponibles del usuario para asociar pagos. */
  cards: CardInterface[] = [];

  /** Contactos y personas asociadas al ámbito (proveedores y socios). */
  persons: PersonInterface[] = [];

  // ==========================================
  // KPIs Y MÉTRICAS MENSUALES
  // ==========================================
  totalBudgeted = 0;
  totalPaid = 0;
  totalPending = 0;
  paidCount = 0;
  totalCount = 0;
  progressPercentage = 0;

  // ==========================================
  // MODAL REGISTRAR PAGO
  // ==========================================
  isPayModalVisible = false;
  payForm!: FormGroup;
  selectedExpenseForPayment: FixedExpenseInterface | null = null;

  // ==========================================
  // MODAL ALTA / EDICIÓN DE PLANTILLA
  // ==========================================
  isTemplateModalVisible = false;
  isEditingTemplate = false;
  editingFexUuid: string | null = null;
  templateForm!: FormGroup;

  /** Categorías predefinidas para clasificación de gastos fijos. */
  readonly categories: { value: FixedExpenseCategory; label: string; color: string }[] = [
    { value: 'SERVICIOS', label: 'Servicios (Luz, Gas, Internet)', color: 'blue' },
    { value: 'ALQUILER', label: 'Alquiler & Inmuebles', color: 'purple' },
    { value: 'IMPUESTOS', label: 'Impuestos & Tasas (AFIP/ARBA)', color: 'red' },
    { value: 'SUSCRIPCIONES', label: 'Suscripciones & Software', color: 'cyan' },
    { value: 'SUELDOS', label: 'Sueldos & Honorarios', color: 'magenta' },
    { value: 'SEGUROS', label: 'Seguros & Pólizas', color: 'orange' },
    { value: 'MANTENIMIENTO', label: 'Mantenimiento & Limpieza', color: 'gold' },
    { value: 'OTRO', label: 'Otros Gastos Fijos', color: 'default' }
  ];

  constructor(
    private _fb: FormBuilder,
    private _fixedExpensesService: FixedExpensesService,
    private _scopesService: ScopesService,
    private _cardsService: CardsService,
    private _personsService: PersonsService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.selectedPeriod = this.getCurrentPeriodString();
    this.loadInitialData();
  }

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  private getUsrUuid(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
  }

  /**
   * Inicializa la estructura y validaciones de los formularios reactivos.
   */
  private initForms(): void {
    // Formulario de Pago Mensual
    this.payForm = this._fb.group({
      trx_amount: [null, [Validators.required, Validators.min(0.01)]],
      trx_datetime: [new Date(), [Validators.required]],
      crd_uuid: [null],
      prs_uuidactor: [null],
      trx_notes: ['']
    });

    // Formulario de Plantilla de Gasto Fijo
    this.templateForm = this._fb.group({
      fex_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      fex_category: ['SERVICIOS', [Validators.required]],
      fex_dueday: [10, [Validators.required, Validators.min(1), Validators.max(31)]],
      fex_referenceamount: [0, [Validators.required, Validators.min(0)]],
      fex_currency: ['ARS', [Validators.required]],
      crd_uuid: [null],
      prs_uuid: [null],
      prs_uuidactor: [null],
      fex_isautodebit: [false],
      fex_autogenerate: [false],
      fex_notes: ['']
    });
  }

  /**
   * Carga los ámbitos contables, tarjetas y contactos para el usuario activo.
   */
  public loadInitialData(): void {
    const usrUuid = this.getUsrUuid();
    this.isLoading = true;

    this._scopesService.getScopes(usrUuid).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.scopes = res.data;
          this.selectedScopeUuid = this.scopes[0].scp_uuid;
          this.loadScopeDependencies();
          this.loadFixedExpenses();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar ámbitos contables:', err);
        this.isLoading = false;
      }
    });

    this._cardsService.getCards(usrUuid).subscribe({
      next: (res) => {
        if (res.data) {
          this.cards = res.data;
        }
      },
      error: (err) => console.error('Error al cargar tarjetas/cuentas:', err)
    });
  }

  /**
   * Carga las personas y contactos vinculados al ámbito contable activo.
   */
  public loadScopeDependencies(): void {
    if (!this.selectedScopeUuid) return;
    this._personsService.getPersons(this.selectedScopeUuid).subscribe({
      next: (res) => {
        if (res.data) {
          this.persons = res.data;
        }
      },
      error: (err) => console.error('Error al cargar contactos del ámbito:', err)
    });
  }

  /**
   * Manejador al cambiar de ámbito contable.
   */
  public onScopeChange(): void {
    this.loadScopeDependencies();
    this.loadFixedExpenses();
  }

  /**
   * Carga la lista de gastos fijos y su estado en el mes seleccionado.
   */
  public loadFixedExpenses(): void {
    if (!this.selectedScopeUuid) return;

    this.isLoading = true;
    this._fixedExpensesService.getFixedExpenses(this.selectedScopeUuid, this.selectedPeriod).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.fixedExpenses = res.data || [];
          this.calculateKpis();
          this.applyFilters();
        } else {
          this._messageService.error('Error', res.message || 'No se pudieron obtener los gastos fijos');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al consultar gastos fijos:', err);
        this._messageService.error('Error', 'Hubo un inconveniente al cargar los gastos fijos');
      }
    });
  }

  /**
   * Calcula los totales presupuestados, abonados y pendientes para el mes.
   */
  private calculateKpis(): void {
    this.totalBudgeted = 0;
    this.totalPaid = 0;
    this.totalPending = 0;
    this.paidCount = 0;
    this.totalCount = this.fixedExpenses.length;

    for (const item of this.fixedExpenses) {
      const refAmount = Number(item.fex_referenceamount) || 0;
      this.totalBudgeted += refAmount;

      if (item.status === 'PAID') {
        this.paidCount++;
        const paidAmount = Number(item.paid_transaction?.trx_amount) || refAmount;
        this.totalPaid += paidAmount;
      } else {
        this.totalPending += refAmount;
      }
    }

    this.progressPercentage = this.totalCount > 0
      ? Math.round((this.paidCount / this.totalCount) * 100)
      : 0;
  }

  /**
   * Aplica los filtros combinados de búsqueda por texto, estado y débito automático.
   */
  public applyFilters(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();

    this.filteredExpenses = this.fixedExpenses.filter(item => {
      // Filtro de texto
      const matchesText = !term ||
        item.fex_name.toLowerCase().includes(term) ||
        (item.fex_category && item.fex_category.toLowerCase().includes(term)) ||
        (item.fex_notes && item.fex_notes.toLowerCase().includes(term));

      // Filtro de estado
      const matchesStatus =
        this.statusFilter === 'ALL' ||
        item.status === this.statusFilter;

      // Filtro de débito automático
      const matchesDebit =
        this.debitFilter === 'ALL' ||
        (this.debitFilter === 'AUTODEBIT' && item.fex_isautodebit) ||
        (this.debitFilter === 'MANUAL' && !item.fex_isautodebit);

      return matchesText && matchesStatus && matchesDebit;
    });
  }

  // ==========================================
  // NAVEGACIÓN DE PERÍODOS
  // ==========================================

  /**
   * Retorna la cadena del mes actual en formato YYYY-MM.
   */
  private getCurrentPeriodString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Avanza al mes siguiente y refresca los datos.
   */
  public nextPeriod(): void {
    const [yearStr, monthStr] = this.selectedPeriod.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year++;
    }
    this.selectedPeriod = `${year}-${String(month).padStart(2, '0')}`;
    this.loadFixedExpenses();
  }

  /**
   * Retrocede al mes anterior y refresca los datos.
   */
  public prevPeriod(): void {
    const [yearStr, monthStr] = this.selectedPeriod.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year--;
    }
    this.selectedPeriod = `${year}-${String(month).padStart(2, '0')}`;
    this.loadFixedExpenses();
  }

  /**
   * Restablece la consulta al mes en curso.
   */
  public resetToCurrentPeriod(): void {
    this.selectedPeriod = this.getCurrentPeriodString();
    this.loadFixedExpenses();
  }

  /**
   * Obtiene una etiqueta legible en español para el período (ej: "Octubre 2026").
   */
  public getPeriodLabel(): string {
    if (!this.selectedPeriod) return '';
    const [yearStr, monthStr] = this.selectedPeriod.split('-');
    const month = parseInt(monthStr, 10);
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[month - 1]} ${yearStr}`;
  }

  // ==========================================
  // MODAL REGISTRO DE PAGO
  // ==========================================

  /**
   * Abre el modal para liquidar/pagar un gasto fijo en el mes seleccionado.
   */
  public openPaymentModal(item: FixedExpenseInterface): void {
    this.selectedExpenseForPayment = item;

    // Calcular fecha por defecto respetando el día de vencimiento dentro del período seleccionado
    const [yearStr, monthStr] = this.selectedPeriod.split('-');
    const defaultDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, item.fex_dueday || 1);

    this.payForm.reset({
      trx_amount: item.fex_referenceamount || null,
      trx_datetime: defaultDate,
      crd_uuid: item.crd_uuid || null,
      prs_uuidactor: item.prs_uuidactor || null,
      trx_notes: item.fex_notes ? `Pago ${item.fex_name} - ${item.fex_notes}` : `Pago mensual de ${item.fex_name}`
    });

    this.isPayModalVisible = true;
  }

  /**
   * Cierra el modal de pago mensual.
   */
  public closePaymentModal(): void {
    this.isPayModalVisible = false;
    this.selectedExpenseForPayment = null;
  }

  /**
   * Confirma y envía el pago mensual a la API.
   */
  public submitPayment(): void {
    if (this.payForm.invalid || !this.selectedExpenseForPayment) {
      this.markFormGroupTouched(this.payForm);
      return;
    }

    this.isSaving = true;
    const formVal = this.payForm.value;
    const payload: PayFixedExpenseDTO = {
      trx_amount: Number(formVal.trx_amount),
      trx_datetime: formVal.trx_datetime,
      crd_uuid: formVal.crd_uuid || null,
      prs_uuidactor: formVal.prs_uuidactor || null,
      trx_notes: formVal.trx_notes || null,
      usr_uuidcreator: this.getUsrUuid()
    };

    this._fixedExpensesService.payFixedExpense(this.selectedExpenseForPayment.fex_uuid, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          this._messageService.success(
            '¡Pago Registrado!',
            `Se generó el egreso contable por $ ${payload.trx_amount.toLocaleString('es-AR')} y se actualizó el valor de referencia.`
          );
          this.closePaymentModal();
          this.loadFixedExpenses();
        } else {
          this._messageService.error('Error', res.message || 'No se pudo registrar el pago.');
        }
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error al registrar pago de gasto fijo:', err);
        this._messageService.error('Error', err?.error?.error || 'Hubo un error al procesar el pago.');
      }
    });
  }

  // ==========================================
  // MODAL CREAR / EDITAR PLANTILLA
  // ==========================================

  /**
   * Abre el modal para dar de alta un nuevo gasto fijo recurrente.
   */
  public openCreateModal(): void {
    this.isEditingTemplate = false;
    this.editingFexUuid = null;
    this.templateForm.reset({
      fex_name: '',
      fex_category: 'SERVICIOS',
      fex_dueday: 10,
      fex_referenceamount: 0,
      fex_currency: 'ARS',
      crd_uuid: null,
      prs_uuid: null,
      prs_uuidactor: null,
      fex_isautodebit: false,
      fex_autogenerate: false,
      fex_notes: ''
    });
    this.isTemplateModalVisible = true;
  }

  /**
   * Abre el modal para editar una plantilla de gasto fijo existente.
   */
  public openEditModal(item: FixedExpenseInterface): void {
    this.isEditingTemplate = true;
    this.editingFexUuid = item.fex_uuid;
    this.templateForm.reset({
      fex_name: item.fex_name,
      fex_category: item.fex_category || 'SERVICIOS',
      fex_dueday: item.fex_dueday,
      fex_referenceamount: item.fex_referenceamount || 0,
      fex_currency: item.fex_currency || 'ARS',
      crd_uuid: item.crd_uuid || null,
      prs_uuid: item.prs_uuid || null,
      prs_uuidactor: item.prs_uuidactor || null,
      fex_isautodebit: !!item.fex_isautodebit,
      fex_autogenerate: !!item.fex_autogenerate,
      fex_notes: item.fex_notes || ''
    });
    this.isTemplateModalVisible = true;
  }

  /**
   * Cierra el modal de creación/edición de plantilla.
   */
  public closeTemplateModal(): void {
    this.isTemplateModalVisible = false;
    this.editingFexUuid = null;
  }

  /**
   * Guarda o actualiza los datos de la plantilla de gasto fijo.
   */
  public submitTemplate(): void {
    if (this.templateForm.invalid) {
      this.markFormGroupTouched(this.templateForm);
      return;
    }

    this.isSaving = true;
    const formVal = this.templateForm.value;

    if (this.isEditingTemplate && this.editingFexUuid) {
      this._fixedExpensesService.updateFixedExpense(this.editingFexUuid, formVal).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            this._messageService.success('¡Gasto Fijo Actualizado!', 'La plantilla fue modificada correctamente.');
            this.closeTemplateModal();
            this.loadFixedExpenses();
          } else {
            this._messageService.error('Error', 'No se pudo actualizar el gasto fijo.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error al actualizar plantilla:', err);
          this._messageService.error('Error', err?.error?.error || 'Hubo un error al actualizar el gasto fijo.');
        }
      });
    } else {
      const createPayload: FixedExpenseInputDTO = {
        ...formVal,
        scp_uuid: this.selectedScopeUuid,
        usr_uuid: this.getUsrUuid()
      };

      this._fixedExpensesService.createFixedExpense(createPayload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            this._messageService.success('¡Gasto Fijo Creado!', 'El nuevo servicio recurrente ha sido registrado.');
            this.closeTemplateModal();
            this.loadFixedExpenses();
          } else {
            this._messageService.error('Error', 'No se pudo registrar el gasto fijo.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error al crear gasto fijo:', err);
          this._messageService.error('Error', err?.error?.error || 'Hubo un problema al crear el gasto fijo.');
        }
      });
    }
  }

  // ==========================================
  // BORRADO LÓGICO
  // ==========================================

  /**
   * Solicita confirmación y da de baja la plantilla del gasto fijo.
   */
  public deleteExpense(item: FixedExpenseInterface): void {
    this._messageService.confirm(
      '¿Eliminar Gasto Fijo?',
      `¿Desea dar de baja el gasto fijo "${item.fex_name}"? Las transacciones contables anteriores se conservarán.`,
      () => {
        this._fixedExpensesService.deleteFixedExpense(item.fex_uuid).subscribe({
          next: (res) => {
            if (res.success) {
              this._messageService.success('Gasto Fijo Eliminado', 'La regla fue desactivada con éxito.');
              this.loadFixedExpenses();
            } else {
              this._messageService.error('Error', res.message || 'No se pudo eliminar el gasto fijo.');
            }
          },
          error: (err) => {
            console.error('Error al eliminar gasto fijo:', err);
            this._messageService.error('Error', 'Hubo un inconveniente al eliminar el gasto fijo.');
          }
        });
      }
    );
  }

  /**
   * Obtiene el color distintivo para el tag de una categoría.
   */
  public getCategoryColor(category?: string | null): string {
    const found = this.categories.find(c => c.value === category);
    return found ? found.color : 'default';
  }

  /**
   * Formatea un importe numérico en formato de moneda argentina ($ 1.234,56).
   */
  public formatAmount(amount?: number | null): string {
    const val = Number(amount) || 0;
    return '$ ' + val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Marca recursivamente todos los controles de un FormGroup como tocados para disparar mensajes de error.
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as any);
      }
    });
  }
}
