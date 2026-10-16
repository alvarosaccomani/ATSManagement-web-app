import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    NzInputNumberModule
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

  /** Tipos de tarjeta disponibles (p. ej., Débito, Crédito). */
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
    private message: NzMessageService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      usr_uuid: [{ value: '', disabled: true }],
      crd_uuid: [{ value: '', disabled: true }],
      scp_uuid: [null, Validators.required],
      crd_alias: [''],
      crd_maskedcardnumber: ['', [Validators.required]],
      crd_last4digits: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      tycrd_uuid: ['', Validators.required],
      brcrd_uuid: ['', Validators.required],
      ban_uuid: ['', Validators.required],
      crd_expirationdate: [null, Validators.required],
      crd_creditlimit: [null],
      crd_active: [true]
    });
  }

  /**
   * Carga los catálogos paramétricos (ámbitos, tipos de tarjeta, marcas, bancos), obtiene los detalles de la tarjeta si se está editando,
   * y se suscribe a los cambios de `tycrd_uuid` para limpiar `crd_creditlimit` en tarjetas de Débito.
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
        usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d'
      })
      this.form.get('crd_uuid')?.disable();
    }

    // Escuchar cambios en el tipo de tarjeta para limpiar límite de crédito si es débito
    this.form.get('tycrd_uuid')?.valueChanges.subscribe(value => {
      if (value === '1') { // Débito
        this.form.get('crd_creditlimit')?.setValue(null);
      }
    });
  }

  /**
   * Carga los ámbitos del usuario y selecciona el primer ámbito si no hay ninguno establecido.
   */
  loadScopes(): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
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
   * Obtiene un registro de tarjeta existente por su UUID y completa el formulario.
   */
  loadCard(): void {
    this.isLoading = true;

    this._cardsService.getCardById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', this.cardId!).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          const card = response.data;

          this.form.get('crd_uuid')?.enable();
          this.form.patchValue(card);
          this.form.get('crd_uuid')?.disable();
          
          this.isLoading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Carga los tipos de tarjeta disponibles desde {@link TypeCardsService}.
   */
  loadTypeCards(): void {
    this.isLoading = true;

    this._typeCardsService.getTypeCards().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.cardTypes = response.data;
          
          this.isLoading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Carga las marcas de tarjeta disponibles desde {@link BrandCardsService}.
   */
  loadBrandCards(): void {
    this.isLoading = true;

    this._brandCardsService.getBrandCards().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.cardBrands = response.data;
          
          this.isLoading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Carga los bancos disponibles para el usuario desde {@link BanksService}.
   */
  loadBanks(): void {
    this.isLoading = true;

    this._banksService.getBanks('7a067c90-bf5b-45d1-8f07-91b578e2d54d').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.banks = response.data;
          
          this.isLoading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Valida y envía el formulario de tarjeta para crear o actualizar el registro de la tarjeta.
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

    this.isLoading = true;
    const rawValue = this.form.getRawValue();

    if(!this.isEditing) {
      delete rawValue.crd_uuid;
      this._cardsService.saveCard(rawValue).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this._messageService.success(
              'Tarjeta Creada', 
              'La tarjeta se agregó correctamente.',
              () => {
                this.router.navigate(['/admin/user/cards']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar la tarjeta');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage.error?.error || 'Hubo un problema al guardar la tarjeta');
        }
      });
    } else {
      this._cardsService.updateCard(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this._messageService.success(
              'Tarjeta Actualizada', 
              'La tarjeta se actualizó correctamente.',
              () => {
                this.router.navigate(['/admin/user/cards']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar la tarjeta');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage.error?.error || 'Hubo un problema al actualizar la tarjeta');
        }
      });
    }
  }

  /**
   * Cancela la edición y regresa a la lista de tarjetas (`/admin/user/cards`).
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/cards']);
  }

  /**
   * Devuelve un mensaje de error de validación comprensible para el usuario para un control de formulario determinado.
   *
   * @param controlName Nombre del control del formulario.
   * @returns Mensaje de error de validación o `null`.
   */
  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('pattern')) {
      return 'Ingrese exactamente 4 dígitos numéricos';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es 0';
    }
    return null;
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
   *
   * @param value Nuevo estado del interruptor de cuotas.
   */
  onInstallmentsChange(value: boolean): void {
    // Esta función puede ser usada si necesitas lógica adicional al cambiar cuotas
  }
}