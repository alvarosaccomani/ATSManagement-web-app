import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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

import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonInterface } from '../../../core/interfaces/person.interface';
import { CardInterface } from '../../../core/interfaces/card/card.interface';
import { TransactionsService } from '../../../core/services/transactions.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { PersonsService } from '../../../core/services/persons.service';
import { CardsService } from '../../../core/services/cards.service';
import { MessageService } from '../../../core/services/message.service';

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
    NzRadioModule
  ],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss'
})
export class TransactionComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  trx_uuid: string | null = null;

  scopes: ScopeInterface[] = [];
  persons: PersonInterface[] = [];
  cards: any[] = [];

  @ViewChild('conceptInput') conceptInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _transactionsService: TransactionsService,
    private _scopesService: ScopesService,
    private _personsService: PersonsService,
    private _cardsService: CardsService,
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
      trx_commissionrate: [null, [Validators.min(0), Validators.max(100)]],
      trx_commissionamount: [null, [Validators.min(0)]],
      trx_notes: ['']
    });
  }

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
    });

    // Load persons when scope changes
    this.form.get('scp_uuid')?.valueChanges.subscribe(scp_uuid => {
      if (scp_uuid && scp_uuid !== 'ALL') {
        this.loadPersons(scp_uuid);
      }
    });

    // When person changes, prefill commission rate if available and type is INGRESO
    this.form.get('prs_uuid')?.valueChanges.subscribe(prs_uuid => {
      if (prs_uuid && this.form.get('trx_type')?.value === 'INGRESO') {
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

    const queryScope = this.route.snapshot.queryParamMap.get('scp_uuid');

    this.loadCards();
    this.loadScopes(queryScope);

    if (this.isEditing) {
      this.loadTransaction(this.trx_uuid!);
    }
  }

  loadScopes(defaultScopeUuid?: string | null): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.scopes = response.data;
          if (!this.form.get('scp_uuid')?.value) {
            const hasValidDefault = defaultScopeUuid && defaultScopeUuid !== 'ALL' && this.scopes.some(s => s.scp_uuid === defaultScopeUuid);
            const initialScope = hasValidDefault ? defaultScopeUuid! : this.scopes[0].scp_uuid;
            this.form.get('scp_uuid')?.setValue(initialScope);
            this.loadPersons(initialScope);
          }
        }
      }
    });
  }

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

  loadCards(): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
    this._cardsService.getCards(usr_uuid).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.cards = response.data.map((c: any) => ({
            value: c.crd_uuid,
            label: `${c.crd_alias || 'Tarjeta'} (**** ${c.crd_last4digits})`
          }));
        }
      }
    });
  }

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

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    const payload = {
      ...rawValue,
      usr_uuidcreator: '7a067c90-bf5b-45d1-8f07-91b578e2d54d'
    };

    if (!this.isEditing) {
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

  onCancel(): void {
    this.router.navigate(['/admin/user/transactions']);
  }

  currencyFormatter = (value: number): string => {
    if (!value && value !== 0) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };
}
