import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { TypeCardInterface } from '../../../core/interfaces/type-card';
import { BrandCardInterface } from '../../../core/interfaces/brand-card';
import { BankInterface } from '../../../core/interfaces/bank';
import { TypeCardsService } from '../../../core/services/type-cards.service';
import { BrandCardsService } from '../../../core/services/brand-cards.service';
import { BanksService } from '../../../core/services/banks.service';
import { CardsService } from '../../../core/services/cards.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { MessageService } from '../../../core/services/message.service';
import { formatterDollar, parserDollar } from '../../../core/utils/currency-format';

import { SessionService } from '../../../core/services/session.service';

/**
 * Componente de formulario (`<app-card>`) para crear y editar tarjetas de crédito/débito
 * en `/admin/user/card/new` y `/admin/user/card/edit/:crd_uuid`.
 *
 * @description Gestiona los atributos de la tarjeta incluyendo la asignación de ámbito, tipo de tarjeta (`tycrd_uuid`),
 * marca (`brcrd_uuid`), banco emisor (`ban_uuid`), fecha de vencimiento y la limpieza automática
 * de `crd_creditlimit` cuando el tipo de tarjeta es Débito (`tycrd_uuid === '1'`).
 */
@Component({
  selector: 'app-card',
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
    NzSwitchModule,
    NzInputNumberModule,
    NzAlertModule,
    NzToolTipModule,
    RouterModule
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
  /** Grupo de formulario reactivo para los campos de la tarjeta. */
  form: FormGroup;
  /** Indica si se están cargando los datos de catálogo o el envío del formulario. */
  isLoading = false;
  /** Indica si el componente está editando una tarjeta existente (`true`) o creando una nueva (`false`). */
  isEditing = false;
  /** UUID de la tarjeta que se está editando, o `null` al crear una nueva tarjeta. */
  cardId: string | null = null;

  /** Tipos de tarjeta disponibles (p. ej., Débito, Crédito, Efectivo, Caja de Ahorro). */
  cardTypes: TypeCardInterface[] = [];
  /** Marcas de tarjeta disponibles (p. ej., Visa, Mastercard). */
  cardBrands: BrandCardInterface[] = [];
  /** Bancos emisores disponibles. */
  banks: BankInterface[] = [];
  /** Ámbitos contables disponibles. */
  scopes: ScopeInterface[] = [];

  /**
   * Inicializa el componente de formulario de tarjeta.
   *
   * @param fb Instancia de `FormBuilder` de Angular.
   * @param route Instantánea de la ruta activa.
   * @param router Instancia de `Router` de Angular.
   * @param _typeCardsService Servicio para obtener los tipos de tarjeta.
   * @param _brandCardsService Servicio para obtener las marcas de tarjeta.
   * @param _banksService Servicio para obtener los bancos.
   * @param _cardsService Servicio para operaciones CRUD de tarjetas.
   * @param _scopesService Servicio para obtener los ámbitos.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio de alertas modales.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _typeCardsService: TypeCardsService,
    private _brandCardsService: BrandCardsService,
    private _banksService: BanksService,
    private _cardsService: CardsService,
    private _scopesService: ScopesService,
    private _sessionService: SessionService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      usr_uuid: [{ value: '', disabled: true }],
      crd_uuid: [{ value: '', disabled: true }],
      scp_uuid: [null, Validators.required],
      tycrd_uuid: ['', Validators.required],
      crd_alias: [''],
      crd_maskedcardnumber: [''],
      crd_last4digits: [''],
      brcrd_uuid: [null],
      ban_uuid: [null],
      crd_expirationdate: [null],
      crd_creditlimit: [null],
      crd_cbucvu: [''],
      crd_cbualias: [''],
      crd_active: [true]
    });
  }

  /**
   * Obtiene el identificador del usuario autenticado actual.
   * @returns UUID del usuario autenticado.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Obtiene el nombre en minúsculas del tipo de cuenta o tarjeta seleccionado.
   */
  get selectedTypeName(): string {
    const type = this.cardTypes.find(t => t.tycrd_uuid === this.form.get('tycrd_uuid')?.value);
    return type ? type.tycrd_name.toLowerCase().trim() : '';
  }

  /**
   * Indica si el tipo seleccionado corresponde a efectivo.
   */
  get isCash(): boolean {
    return this.selectedTypeName.includes('efectivo');
  }

  /**
   * Indica si el tipo seleccionado corresponde a una cuenta bancaria o billetera virtual.
   */
  get isBankAccount(): boolean {
    const name = this.selectedTypeName;
    return (
      name.includes('caja de ahorro') ||
      name.includes('cuenta corriente') ||
      name.includes('billetera virtual') ||
      name.includes('billetera') ||
      name.includes('cuenta')
    );
  }

  /**
   * Indica si el tipo seleccionado corresponde a una tarjeta (débito, crédito o prepaga).
   */
  get isCard(): boolean {
    if (!this.form.get('tycrd_uuid')?.value) return true;
    return !this.isCash && !this.isBankAccount;
  }

  /**
   * Indica si la tarjeta seleccionada es de crédito.
   */
  get isCreditCard(): boolean {
    return this.selectedTypeName.includes('crédito') || this.selectedTypeName.includes('credito');
  }

  /**
   * Ciclo de vida de inicialización de Angular. Configura el modo de edición y carga catálogos.
   */
  ngOnInit(): void {
    this.cardId = this.route.snapshot.paramMap.get('crd_uuid');
    this.isEditing = !!this.cardId;
    this.loadScopes();
    this.loadTypeCards();
    this.loadBrandCards();
    this.loadBanks();
    
    if (this.isEditing) {
      this.loadCard();
    } else {
      this.form.patchValue({
        usr_uuid: this.currentUserId
      });
      this.form.get('crd_uuid')?.disable();
    }

    // Escuchar cambios en el tipo de tarjeta/cuenta para adaptar validaciones
    this.form.get('tycrd_uuid')?.valueChanges.subscribe(value => {
      this.updateValidators(value);
    });
  }

  /**
   * Actualiza dinámicamente las validaciones del formulario según el tipo de registro seleccionado.
   * @param tycrd_uuid Identificador del tipo de cuenta o tarjeta.
   */
  updateValidators(tycrd_uuid: string): void {
    const type = this.cardTypes.find(t => t.tycrd_uuid === tycrd_uuid);
    const name = type ? type.tycrd_name.toLowerCase().trim() : '';

    const isCash = name.includes('efectivo');
    const isBankAccount = name.includes('caja de ahorro') || name.includes('cuenta corriente') || name.includes('billetera virtual') || name.includes('billetera') || name.includes('cuenta');
    const isCard = !isCash && !isBankAccount;

    const maskedControl = this.form.get('crd_maskedcardnumber');
    const last4Control = this.form.get('crd_last4digits');
    const brandControl = this.form.get('brcrd_uuid');
    const bankControl = this.form.get('ban_uuid');
    const expControl = this.form.get('crd_expirationdate');
    const aliasControl = this.form.get('crd_alias');
    const cbucvuControl = this.form.get('crd_cbucvu');

    if (isCash) {
      maskedControl?.clearValidators();
      last4Control?.clearValidators();
      brandControl?.clearValidators();
      bankControl?.clearValidators();
      expControl?.clearValidators();
      aliasControl?.setValidators([Validators.required]);
      cbucvuControl?.clearValidators();

      maskedControl?.setValue(null);
      last4Control?.setValue(null);
      brandControl?.setValue(null);
      bankControl?.setValue(null);
      expControl?.setValue(null);
      this.form.get('crd_creditlimit')?.setValue(null);
      this.form.get('crd_cbucvu')?.setValue(null);
      this.form.get('crd_cbualias')?.setValue(null);
    } else if (isBankAccount) {
      maskedControl?.clearValidators();
      last4Control?.clearValidators();
      brandControl?.clearValidators();
      bankControl?.setValidators([Validators.required]);
      expControl?.clearValidators();
      aliasControl?.setValidators([Validators.required]);
      cbucvuControl?.setValidators([Validators.pattern(/^\d{22}$/)]);

      maskedControl?.setValue(null);
      last4Control?.setValue(null);
      brandControl?.setValue(null);
      expControl?.setValue(null);
      this.form.get('crd_creditlimit')?.setValue(null);
    } else {
      maskedControl?.setValidators([Validators.required]);
      last4Control?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
      brandControl?.setValidators([Validators.required]);
      bankControl?.setValidators([Validators.required]);
      expControl?.setValidators([Validators.required]);
      aliasControl?.clearValidators();
      cbucvuControl?.clearValidators();

      this.form.get('crd_cbucvu')?.setValue(null);
      this.form.get('crd_cbualias')?.setValue(null);
      if (!name.includes('crédito') && !name.includes('credito')) {
        this.form.get('crd_creditlimit')?.setValue(null);
      }
    }

    maskedControl?.updateValueAndValidity();
    last4Control?.updateValueAndValidity();
    brandControl?.updateValueAndValidity();
    bankControl?.updateValueAndValidity();
    expControl?.updateValueAndValidity();
    aliasControl?.updateValueAndValidity();
    cbucvuControl?.updateValueAndValidity();
  }

  /**
   * Carga los ámbitos contables disponibles para el usuario autenticado.
   */
  loadScopes(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) return;
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.scopes = response.data;
          if (!this.form.get('scp_uuid')?.value) {
            this.form.get('scp_uuid')?.setValue(this.scopes[0].scp_uuid);
          }
        }
      }
    });
  }

  /**
   * Obtiene un registro existente por su UUID y completa el formulario reactivo.
   */
  loadCard(): void {
    this.isLoading = true;
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) return;

    this._cardsService.getCardById(usr_uuid, this.cardId!).subscribe({
      next: (response: any) => {
        if (response.success) {
          const card = response.data;
          this.form.get('crd_uuid')?.enable();
          this.form.patchValue(card);
          this.form.get('crd_uuid')?.disable();
          this.updateValidators(card.tycrd_uuid);
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  /**
   * Carga los tipos de cuenta y tarjeta disponibles desde {@link TypeCardsService}.
   */
  loadTypeCards(): void {
    this.isLoading = true;
    this._typeCardsService.getTypeCards().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cardTypes = response.data;
          this.isLoading = false;
          if (this.form.get('tycrd_uuid')?.value) {
            this.updateValidators(this.form.get('tycrd_uuid')?.value);
          }
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  /**
   * Carga las marcas de tarjeta disponibles desde {@link BrandCardsService}.
   */
  loadBrandCards(): void {
    this.isLoading = true;
    this._brandCardsService.getBrandCards().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cardBrands = response.data;
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  /**
   * Carga los bancos y entidades financieras disponibles desde {@link BanksService}.
   */
  loadBanks(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) return;
    this.isLoading = true;
    this._banksService.getBanks(usr_uuid).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.banks = response.data;
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  /**
   * Valida y envía el formulario para crear o actualizar el registro.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this._messageService.error('Formulario Inválido', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this._messageService.error('Sesión Requerida', 'No se pudo identificar al usuario activo.');
      return;
    }

    if (this.scopes.length === 0) {
      this._messageService.error('Ámbito Requerido', 'No tienes ámbitos contables disponibles para asociar la cuenta o tarjeta.');
      return;
    }

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    rawValue.usr_uuid = usr_uuid;

    if (this.isCash) {
      rawValue.crd_maskedcardnumber = null;
      rawValue.crd_last4digits = null;
      rawValue.brcrd_uuid = null;
      rawValue.ban_uuid = null;
      rawValue.crd_expirationdate = null;
      rawValue.crd_creditlimit = null;
      rawValue.crd_cbucvu = null;
      rawValue.crd_cbualias = null;
    } else if (this.isBankAccount) {
      rawValue.crd_maskedcardnumber = null;
      rawValue.crd_last4digits = null;
      rawValue.brcrd_uuid = null;
      rawValue.crd_expirationdate = null;
      rawValue.crd_creditlimit = null;
      if (!rawValue.crd_cbucvu) rawValue.crd_cbucvu = null;
      if (!rawValue.crd_cbualias) rawValue.crd_cbualias = null;
    } else {
      rawValue.crd_cbucvu = null;
      rawValue.crd_cbualias = null;
      if (!this.isCreditCard) {
        rawValue.crd_creditlimit = null;
      }
    }

    if (!this.isEditing) {
      delete rawValue.crd_uuid;
      this._cardsService.saveCard(rawValue).subscribe({
        next: response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Guardado Correctamente', 
              'La tarjeta o cuenta se agregó correctamente.',
              () => {
                this.router.navigate(['/admin/user/cards']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage.error?.error || 'Hubo un problema al guardar');
        }
      });
    } else {
      this._cardsService.updateCard(rawValue).subscribe({
        next: response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Actualizado Correctamente', 
              'La tarjeta o cuenta se actualizó correctamente.',
              () => {
                this.router.navigate(['/admin/user/cards']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage.error?.error || 'Hubo un problema al actualizar');
        }
      });
    }
  }

  /**
   * Cancela la operación y regresa al listado de tarjetas y cuentas.
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/cards']);
  }

  /**
   * Retorna el mensaje de error correspondiente a la validación fallida de un control.
   * @param controlName Nombre del control en el formulario reactivo.
   * @returns Mensaje de error para el usuario o undefined.
   */
  getErrorMessage(controlName: string): string | undefined {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'crd_cbucvu') {
        return 'El CBU/CVU debe tener exactamente 22 dígitos numéricos';
      }
      return 'Ingrese exactamente 4 dígitos numéricos';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es 0';
    }
    return undefined;
  }

  /** Función formateadora de visualización de moneda. */
  formatterDollar = formatterDollar;
  /** Función analizadora de entrada de moneda. */
  parserDollar = parserDollar;
  /** Alias para el formateador de visualización de moneda. */
  currencyFormatter = formatterDollar;
  /** Alias para el analizador de entrada de moneda. */
  currencyParser = parserDollar;

  /**
   * Manejador opcional para los cambios en el interruptor de cuotas.
   * @param value Nuevo estado del interruptor de cuotas.
   */
  onInstallmentsChange(value: boolean): void {
    // Esta función puede ser usada si necesitas lógica adicional al cambiar cuotas
  }
}