import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonInterface } from '../../../core/interfaces/person.interface';
import { CardInterface } from '../../../core/interfaces/card/card.interface';
import { TransactionsService } from '../../../core/services/transactions.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { PersonsService } from '../../../core/services/persons.service';
import { CardsService } from '../../../core/services/cards.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { formatterDollar, parserDollar } from '../../../core/utils/currency-format';

/**
 * Cash-flow transaction form component (`<app-transaction>`)
 * at `/admin/user/transaction/new` and `/admin/user/transaction/edit/:trx_uuid`.
 *
 * @description Manages creation and editing of `INGRESO`, `EGRESO`, and `TRANSFERENCIA` movements,
 * including dynamic required validation for `target_crduuid` on transfers, automatic seller commission
 * calculation on income movements, and a fast batch-entry mode ("Guardar y Cargar Otro").
 */
@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzDividerModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzRadioModule,
    NzCheckboxModule,
    NzAlertModule,
    NzToolTipModule,
    RouterModule
  ],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnInit {
  /** Reactive form group for transaction fields. */
  form: FormGroup;
  /** Indicates whether data is being loaded or submitted. */
  isLoading = false;
  /** Indicates whether the component is editing an existing transaction (`true`) or creating a new one (`false`). */
  isEditing = false;
  /** UUID of the transaction being edited, or `null` when creating a new record. */
  trx_uuid: string | null = null;

  /** Available accounting scopes. */
  scopes: ScopeInterface[] = [];
  /** Available persons/contacts belonging to the currently selected scope. */
  persons: PersonInterface[] = [];
  /** Available cards/accounts for source and target account selection. */
  cards: any[] = [];

  /** Controla si se crea el movimiento espejo en el ámbito personal al pagar un gasto de negocio con cuenta personal. */
  createMirrorTransaction = true;
  /** Controla si se acredita automáticamente el reintegro como ingreso espejo en la cuenta personal. */
  createReimbursementMirror = true;
  /** UUID de la cuenta personal elegida como destino al cobrar un reintegro. */
  reimbursementTargetCardUuid: string | null = null;

  /** Reference to the concept `<input>` element for auto-focusing in fast batch-entry mode. */
  @ViewChild('conceptInput') conceptInput!: ElementRef;

  /**
   * Initializes the transaction form component.
   *
   * @param fb Angular `FormBuilder` instance.
   * @param route Activated route snapshot.
   * @param router Angular `Router` instance.
   * @param _transactionsService Service for transaction CRUD operations.
   * @param _scopesService Service for fetching scopes.
   * @param _personsService Service for fetching scope contacts.
   * @param _cardsService Service for fetching user cards/accounts.
   * @param _messageService Service for displaying modal notifications.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _transactionsService: TransactionsService,
    private _scopesService: ScopesService,
    private _personsService: PersonsService,
    private _cardsService: CardsService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      trx_uuid: [{ value: '', disabled: true }],
      scp_uuid: ['', Validators.required],
      trx_type: ['EGRESO', Validators.required],
      trx_datetime: [new Date(), Validators.required],
      trx_concept: ['', Validators.required],
      trx_amount: [null, [Validators.required, Validators.min(0.01)]],
      trx_currency: ['ARS', Validators.required],
      crd_uuid: [null],
      target_crduuid: [null],
      prs_uuid: [null],
      prs_uuidactor: [null],
      trx_commissionrate: [null, [Validators.min(0), Validators.max(100)]],
      trx_commissionamount: [null, [Validators.min(0)]],
      trx_notes: ['']
    });
  }

  /**
   * Sets up reactive subscriptions for dynamic transfer validation, scope-based contact loading,
   * automatic seller commission calculation, and loads initial reference data.
   */
  ngOnInit(): void {
    this.trx_uuid = this.route.snapshot.paramMap.get('trx_uuid');
    this.isEditing = !!this.trx_uuid;

    // Dynamic validator for transfer target
    this.form.get('trx_type')?.valueChanges.subscribe(type => {
      const targetCtrl = this.form.get('target_crduuid');
      if (type === 'TRANSFERENCIA') {
        targetCtrl?.setValidators([Validators.required]);
      } else {
        targetCtrl?.clearValidators();
        targetCtrl?.setValue(null);
      }
      targetCtrl?.updateValueAndValidity();

      // Clear commission if movement is not an INGRESO
      if (type !== 'INGRESO') {
        this.form.get('trx_commissionrate')?.setValue(null);
        this.form.get('trx_commissionamount')?.setValue(null);
      }
    });

    // Load persons when scope changes
    this.form.get('scp_uuid')?.valueChanges.subscribe(scp_uuid => {
      if (scp_uuid && scp_uuid !== 'ALL') {
        this.loadPersons(scp_uuid);
      }
    });

    // When internal actor/seller changes, prefill commission rate if available and type is INGRESO
    this.form.get('prs_uuidactor')?.valueChanges.subscribe(prs_uuidactor => {
      if (prs_uuidactor && this.form.get('trx_type')?.value === 'INGRESO') {
        const selectedPerson = this.persons.find(p => p.prs_uuid === prs_uuidactor);
        if (selectedPerson && selectedPerson.prs_commissionrate != null && !this.form.get('trx_commissionrate')?.value) {
          this.form.get('trx_commissionrate')?.setValue(selectedPerson.prs_commissionrate);
        }
      }
    });

    // Fallback: If prs_uuid changes, type is INGRESO and no actor was specified, prefill commission rate
    this.form.get('prs_uuid')?.valueChanges.subscribe(prs_uuid => {
      if (prs_uuid && this.form.get('trx_type')?.value === 'INGRESO' && !this.form.get('prs_uuidactor')?.value) {
        const selectedPerson = this.persons.find(p => p.prs_uuid === prs_uuid);
        if (selectedPerson && selectedPerson.prs_commissionrate != null && !this.form.get('trx_commissionrate')?.value) {
          this.form.get('trx_commissionrate')?.setValue(selectedPerson.prs_commissionrate);
        }
      }
    });

    // Auto calculate commission amount when amount or rate changes
    const calculateCommission = () => {
      const amount = this.form.get('trx_amount')?.value;
      const rate = this.form.get('trx_commissionrate')?.value;
      if (amount && rate != null) {
        const commAmount = Math.round(((amount * rate) / 100) * 100) / 100;
        this.form.get('trx_commissionamount')?.setValue(commAmount, { emitEvent: false });
      }
    };

    this.form.get('trx_amount')?.valueChanges.subscribe(() => calculateCommission());
    this.form.get('trx_commissionrate')?.valueChanges.subscribe(() => calculateCommission());

    // Regla de Blindaje Contable: Si es EGRESO y no tiene cuenta de origen, el socio pagador es obligatorio
    const updateActorValidation = () => {
      const type = this.form.get('trx_type')?.value;
      const crd = this.form.get('crd_uuid')?.value;
      const actorCtrl = this.form.get('prs_uuidactor');
      if (type === 'EGRESO' && !crd) {
        actorCtrl?.setValidators([Validators.required]);
      } else {
        actorCtrl?.clearValidators();
      }
      actorCtrl?.updateValueAndValidity({ emitEvent: false });
    };

    this.form.get('trx_type')?.valueChanges.subscribe(() => updateActorValidation());
    this.form.get('crd_uuid')?.valueChanges.subscribe(() => updateActorValidation());

    const queryScope = this.route.snapshot.queryParamMap.get('scp_uuid');

    this.loadCards();
    this.loadScopes(queryScope);

    if (this.isEditing) {
      this.loadTransaction(this.trx_uuid!);
    }
  }

  /**
  /**
   * Obtiene el identificador del usuario autenticado actual desde la sesión activa.
   *
   * @returns Identificador UUID del usuario.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Loads user scopes and initializes the default `scp_uuid` selection.
   *
   * @param defaultScopeUuid Optional scope UUID from query parameters.
   */
  loadScopes(defaultScopeUuid?: string | null): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.scopes = [];
      return;
    }
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.scopes = response.data;
          if (!this.form.get('scp_uuid')?.value) {
            const hasValidDefault = defaultScopeUuid && defaultScopeUuid !== 'ALL' && this.scopes.some(s => s.scp_uuid === defaultScopeUuid);
            const initialScope = hasValidDefault ? defaultScopeUuid! : this.scopes[0].scp_uuid;
            this.form.get('scp_uuid')?.setValue(initialScope);
            this.loadPersons(initialScope);
          }
        } else {
          this.scopes = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar ámbitos en transacción:', err);
        this.scopes = [];
      }
    });
  }

  /**
   * Loads contacts/persons belonging to the specified scope.
   *
   * @param scp_uuid Scope UUID.
   */
  loadPersons(scp_uuid: string): void {
    if (!scp_uuid || scp_uuid === 'ALL') {
      this.persons = [];
      return;
    }
    this._personsService.getPersons(scp_uuid).subscribe({
      next: (response) => {
        if (response.success) {
          this.persons = response.data;
        }
      }
    });
  }

  /**
   * Loads the user's cards/accounts for the source and target account selectors.
   */
  loadCards(): void {
    const usr_uuid = this.currentUserId;
    this._cardsService.getCards(usr_uuid).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.cards = response.data.map((c: any) => {
            const scopeTag = c.scp?.scp_name ? ` (${c.scp.scp_name})` : '';
            const identifier = c.crd_last4digits ? ` (**** ${c.crd_last4digits})` : (c.crd_cbualias ? ` (${c.crd_cbualias})` : '');
            return {
              value: c.crd_uuid,
              label: `${c.crd_alias || c.tycrd?.tycrd_name || 'Cuenta / Tarjeta'}${identifier}${scopeTag}`,
              scp_uuid: c.scp_uuid,
              scopeName: c.scp?.scp_name || ''
            };
          });

        }
      }
    });
  }

  /**
   * Loads an existing transaction by its UUID and patches the form.
   *
   * @param trx_uuid Unique identifier of the transaction to load.
   */
  loadTransaction(trx_uuid: string): void {
    this.isLoading = true;
    this._transactionsService.getTransactionById(trx_uuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const t = {
            ...response.data,
            trx_datetime: new Date(response.data.trx_datetime)
          };
          this.form.patchValue(t);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar el movimiento');
      }
    });
  }

  /**
   * Validates and submits the transaction form.
   *
   * @param andLoadAnother When `true`, keeps the user on the form preserving scope, type, date,
   * and account while resetting concept, amount, and notes for fast batch entry.
   */
  onSubmit(andLoadAnother: boolean = false): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this._messageService.error('Formulario Inválido', 'Por favor complete todos los campos requeridos');
      return;
    }

    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this._messageService.error('Sesión Requerida', 'No se pudo identificar al usuario activo. Por favor inicie sesión nuevamente.');
      return;
    }

    if (this.scopes.length === 0) {
      this._messageService.error('Ámbito Requerido', 'No tienes ámbitos contables disponibles para asociar el movimiento.');
      return;
    }

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    const payload = {
      ...rawValue,
      usr_uuidcreator: usr_uuid
    };

    if (!this.isEditing) {
      // Caso 1: Pago de gasto de negocio con cuenta personal + Movimiento Espejo
      if (this.isPersonalCardInSharedScope && this.createMirrorTransaction) {
        const selectedCard = this.cards.find(c => c.value === rawValue.crd_uuid);
        const businessPayload = {
          ...payload,
          crd_uuid: null,
          trx_notes: rawValue.trx_notes
            ? `${rawValue.trx_notes} | Pagado con cuenta personal: ${selectedCard?.label}. Pendiente de reintegro.`
            : `Pagado con cuenta personal: ${selectedCard?.label}. Pendiente de reintegro.`
        };

        const personalPayload = {
          scp_uuid: selectedCard?.scp_uuid,
          usr_uuidcreator: usr_uuid,
          trx_type: 'EGRESO',
          trx_datetime: rawValue.trx_datetime,
          trx_concept: `Préstamo / Pago a cuenta de ${this.currentScopeName}: ${rawValue.trx_concept}`,
          trx_amount: rawValue.trx_amount,
          trx_currency: rawValue.trx_currency || 'ARS',
          crd_uuid: rawValue.crd_uuid,
          target_crduuid: null,
          prs_uuid: null,
          prs_uuidactor: null,
          trx_notes: `Movimiento espejo: Salida bancaria por gasto operativo de ${this.currentScopeName}. Pendiente de reintegro.`
        };

        this._transactionsService.saveBulkTransactions([businessPayload, personalPayload]).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this._messageService.success(
                'Movimientos Vinculados Registrados',
                `Se registró el gasto en ${this.currentScopeName} y el débito bancario como préstamo en ${this.selectedCardScopeName}.`,
                () => {
                  if (andLoadAnother) {
                    this.form.get('trx_concept')?.reset('');
                    this.form.get('trx_amount')?.reset(null);
                    this.form.get('trx_notes')?.reset('');
                    setTimeout(() => this.conceptInput?.nativeElement?.focus(), 100);
                  } else {
                    this.router.navigate(['/admin/user/transactions']);
                  }
                }
              );
            } else {
              this._messageService.error('Error', response.message || 'No se pudieron registrar los movimientos vinculados');
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error(error);
            this._messageService.error('Error', error?.error?.error || 'Hubo un problema al guardar los movimientos vinculados');
          }
        });
        return;
      }

      // Caso 2: Reintegro a socio + Acreditación espejo en ámbito Personal
      if (this.isPartnerReimbursement && this.createReimbursementMirror && this.reimbursementTargetCardUuid) {
        const businessPayload = {
          ...payload,
          trx_notes: rawValue.trx_notes
            ? `${rawValue.trx_notes} | Reintegro de fondos personales.`
            : 'Reintegro de fondos personales al socio. Cancela deuda con socio.'
        };

        const personalPayload = {
          scp_uuid: this.personalScope?.scp_uuid,
          usr_uuidcreator: usr_uuid,
          trx_type: 'INGRESO',
          trx_datetime: rawValue.trx_datetime,
          trx_concept: `Cobro reintegro de ${this.currentScopeName}: ${rawValue.trx_concept}`,
          trx_amount: rawValue.trx_amount,
          trx_currency: rawValue.trx_currency || 'ARS',
          crd_uuid: this.reimbursementTargetCardUuid,
          target_crduuid: null,
          prs_uuid: null,
          prs_uuidactor: null,
          trx_notes: `Movimiento espejo: Acreditación de reintegro de fondos de ${this.currentScopeName}.`
        };

        this._transactionsService.saveBulkTransactions([businessPayload, personalPayload]).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this._messageService.success(
                'Reintegro Registrado',
                `Se canceló la deuda en ${this.currentScopeName} y se acreditó el ingreso en tu cuenta personal.`,
                () => {
                  if (andLoadAnother) {
                    this.form.get('trx_concept')?.reset('');
                    this.form.get('trx_amount')?.reset(null);
                    this.form.get('trx_notes')?.reset('');
                    setTimeout(() => this.conceptInput?.nativeElement?.focus(), 100);
                  } else {
                    this.router.navigate(['/admin/user/transactions']);
                  }
                }
              );
            } else {
              this._messageService.error('Error', response.message || 'No se pudieron registrar los movimientos vinculados');
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error(error);
            this._messageService.error('Error', error?.error?.error || 'Hubo un problema al guardar los movimientos vinculados');
          }
        });
        return;
      }

      // Caso Estándar: Creación individual
      this._transactionsService.saveTransaction(payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Movimiento Registrado',
              'El registro fue guardado correctamente.',
              () => {
                if (andLoadAnother) {
                  // Keep scope, type, account, person for fast batch entry
                  this.form.get('trx_concept')?.reset('');
                  this.form.get('trx_amount')?.reset(null);
                  this.form.get('trx_notes')?.reset('');
                  setTimeout(() => this.conceptInput?.nativeElement?.focus(), 100);
                } else {
                  this.router.navigate(['/admin/user/transactions']);
                }
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar el movimiento');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error('Error', error?.error?.error || 'Hubo un problema al guardar el movimiento');
        }
      });
    } else {
      this._transactionsService.updateTransaction(this.trx_uuid!, payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Movimiento Actualizado',
              'El registro fue actualizado correctamente.',
              () => {
                this.router.navigate(['/admin/user/transactions']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar el movimiento');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error('Error', error?.error?.error || 'Hubo un problema al actualizar el movimiento');
        }
      });
    }
  }

  /**
   * Cancels editing and navigates back to the transactions list (`/admin/user/transactions`).
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/transactions']);
  }

  /**
   * Gets the dynamic label for the external counterparty select input based on transaction type.
   *
   * @returns "Cliente / A quién se vendió" for `INGRESO`, "Proveedor / A quién se compró" for `EGRESO`.
   */
  get counterpartyLabel(): string {
    const type = this.form.get('trx_type')?.value;
    if (type === 'INGRESO') return 'Cliente / A quién se vendió';
    if (type === 'EGRESO') return 'Proveedor / Comercio (a quién se compró)';
    return 'Persona / Contraparte Externa';
  }

  /**
   * Gets the dynamic placeholder for the external counterparty select input based on transaction type.
   *
   * @returns Placeholder string tailored to client, supplier, or general contact.
   */
  get counterpartyPlaceholder(): string {
    const type = this.form.get('trx_type')?.value;
    if (type === 'INGRESO') return 'Seleccione o busque cliente';
    if (type === 'EGRESO') return 'Seleccione comercio o proveedor';
    return 'Seleccione o busque persona';
  }

  /**
   * Gets the dynamic label for the internal actor/responsible select input based on transaction type.
   *
   * @returns "Vendedor / Quién realizó la venta" for `INGRESO`, "Pagador / Socio que puso el dinero" for `EGRESO`.
   */
  get actorLabel(): string {
    const type = this.form.get('trx_type')?.value;
    if (type === 'INGRESO') return 'Vendedor / Quién realizó la venta';
    if (type === 'EGRESO') return 'Pagador / Socio que puso el dinero';
    return 'Actor Interno / Responsable';
  }

  /**
   * Gets the dynamic placeholder for the internal actor/responsible select input based on transaction type.
   *
   * @returns Placeholder string tailored to seller or paying partner.
   */
  get actorPlaceholder(): string {
    const type = this.form.get('trx_type')?.value;
    if (type === 'INGRESO') return 'Seleccione vendedor comisionista';
    if (type === 'EGRESO') return 'Seleccione socio o pagador';
    return 'Seleccione actor responsable';
  }

  /**
   * Determina si el movimiento es un gasto que no sale de cuentas bancarias/caja,
   * lo que implica aporte directo de fondos por parte de un socio (genera crédito/deuda a su favor).
   */
  get isPartnerExpenseWithoutAccount(): boolean {
    return this.form.get('trx_type')?.value === 'EGRESO' && !this.form.get('crd_uuid')?.value;
  }

  /**
   * Determina si el movimiento es un reintegro de dinero desde una cuenta del negocio
   * hacia un socio registrado, cancelando el pasivo sin duplicar costos en el Estado de Resultados.
   */
  get isPartnerReimbursement(): boolean {
    const isExpense = this.form.get('trx_type')?.value === 'EGRESO';
    const hasAccount = !!this.form.get('crd_uuid')?.value;
    const counterparty = this.form.get('prs_uuid')?.value;
    if (!isExpense || !hasAccount || !counterparty) return false;
    const person = this.persons.find(p => p.prs_uuid === counterparty);
    return !!person && (person.prs_type || '').toUpperCase().includes('SOCIO');
  }

  /**
   * Lista de personas filtrando la razón social o nombre del ámbito para impedir
   * que la empresa misma sea seleccionada erróneamente como persona física o socia.
   */
  get filteredActors(): PersonInterface[] {
    const activeScope = this.scopes.find(s => s.scp_uuid === this.form.get('scp_uuid')?.value);
    const scopeName = activeScope?.scp_name?.trim().toLowerCase();
    if (!scopeName) return this.persons;
    return this.persons.filter(p => p.prs_name.trim().toLowerCase() !== scopeName);
  }

  /** Ámbito contable actualmente seleccionado en el formulario. */
  get currentScope(): ScopeInterface | undefined {
    const scp_uuid = this.form.get('scp_uuid')?.value;
    return this.scopes.find(s => s.scp_uuid === scp_uuid);
  }

  /** Nombre del ámbito activo para visualización en textos y confirmaciones. */
  get currentScopeName(): string {
    return this.currentScope?.scp_name || 'el ámbito';
  }

  /** Ámbito personal del usuario actual (no compartido o denominado 'Personal'). */
  get personalScope(): ScopeInterface | undefined {
    return this.scopes.find(s => !s.scp_isshared || s.scp_name.toLowerCase().includes('personal'));
  }

  /** Nombre del ámbito personal. */
  get personalScopeName(): string {
    return this.personalScope?.scp_name || 'Personal';
  }

  /** Lista de cuentas bancarias/tarjetas pertenecientes al ámbito personal. */
  get personalCards(): any[] {
    const pScope = this.personalScope;
    if (!pScope) return this.cards;
    return this.cards.filter(c => c.scp_uuid === pScope.scp_uuid);
  }

  /**
   * Detecta si en un gasto de un ámbito compartido (ej: negocio) se seleccionó
   * una cuenta o tarjeta que pertenece al ámbito personal o a un ámbito distinto.
   */
  get isPersonalCardInSharedScope(): boolean {
    if (this.form.get('trx_type')?.value !== 'EGRESO') return false;
    const currentScpUuid = this.form.get('scp_uuid')?.value;
    const selectedCrdUuid = this.form.get('crd_uuid')?.value;
    if (!currentScpUuid || !selectedCrdUuid) return false;

    const selectedCard = this.cards.find(c => c.value === selectedCrdUuid);
    if (!selectedCard || !selectedCard.scp_uuid) return false;

    return selectedCard.scp_uuid !== currentScpUuid;
  }

  /** Nombre del ámbito de la cuenta seleccionada. */
  get selectedCardScopeName(): string {
    const selectedCrdUuid = this.form.get('crd_uuid')?.value;
    const selectedCard = this.cards.find(c => c.value === selectedCrdUuid);
    return selectedCard?.scopeName || 'Ámbito Personal';
  }

  /** Currency display formatter function for `nz-input-number`. */
  formatterDollar = formatterDollar;
  /** Currency input parser function for `nz-input-number`. */
  parserDollar = parserDollar;
}
