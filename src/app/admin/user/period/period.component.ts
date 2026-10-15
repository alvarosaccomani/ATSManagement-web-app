import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { CardInterface } from '../../../core/interfaces/card';
import { StatusPeriodInterface } from '../../../core/interfaces/status-period';
import { CardsService } from '../../../core/services/cards.service';
import { PeriodsService } from '../../../core/services/periods.service';
import { StatusPeriodsService } from '../../../core/services/status-periods.service';
import { MessageService } from '../../../core/services/message.service';
import { formatterDollar, parserDollar } from '../../../core/utils/currency-format';

// Definir interfaz para datos relacionados
interface RelatedData {
  crd_uuid: string;
}

@Component({
  selector: 'app-period',
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
    NzTagModule
  ],
  templateUrl: './period.component.html',
  styleUrl: './period.component.scss'
})
export class PeriodComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  cardId: string | null = null;
  periodId: string | null = null;

  // Opciones para selects
  periodStatuses: StatusPeriodInterface[] = [];

  cards: CardInterface[] = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private _cardsService: CardsService,
    private _periodsService: PeriodsService,
    private _statusPeriodsService: StatusPeriodsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      usr_uuid: [{ value: '', disabled: true }],
      crd_uuid: [{ value: '', disabled: true }],
      per_uuid: [{ value: '', disabled: true }],
      per_periodnumber: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      per_startdate: [null, Validators.required],
      per_enddate: [null, Validators.required],
      per_duedate: [null, Validators.required],
      sper_uuid: ['1', Validators.required],
      per_previousbalance: [0, [Validators.min(0)]],
      per_interest: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cardId = this.route.snapshot.paramMap.get('crd_uuid');
    this.periodId = this.route.snapshot.paramMap.get('per_uuid');
    this.isEditing = !!this.periodId;
    this.loadCards();
    this.loadStatusPeriods();
    
    if (this.isEditing) {
      this.loadPeriod();
    } else {
      this.form.patchValue({
        usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d',
        crd_uuid: '1'
      })
      this.form.get('per_uuid')?.disable();
    }

    // Escuchar cambios en el número de período para formatear automáticamente
    this.form.get('per_periodnumber')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        // Limpiar y formatear (solo números, máximo 6 dígitos)
        const cleaned = value.replace(/\D/g, '').slice(0, 6);
        if (value !== cleaned) {
          this.form.get('per_periodnumber')?.setValue(cleaned, { emitEvent: false });
        }
      }
    });
  }

  loadPeriod(): void {
    this.isLoading = true;

    this._periodsService.getPeriodById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', this.cardId!, this.periodId!).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          const period = {
            ...response.data,
            per_startdate: new Date(response.data.per_startdate + 'T00:00:00'),
            per_enddate: new Date(response.data.per_enddate + 'T00:00:00'),
            per_duedate: new Date(response.data.per_duedate + 'T00:00:00')
          };

          this.form.get('per_uuid')?.enable();
          this.form.patchValue(period);
          this.form.get('per_uuid')?.disable();
          
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

  loadStatusPeriods(): void {
    this.isLoading = true;

    this._statusPeriodsService.getStatusPeriods().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.periodStatuses = response.data;
          
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

  loadCards(): void {
    this.isLoading = true;

    this._cardsService.getCards('7a067c90-bf5b-45d1-8f07-91b578e2d54d').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.cards = response.data;
          
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

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    const startDate = this.form.get('per_startdate')?.value;
    const endDate = this.form.get('per_enddate')?.value;
    const dueDate = this.form.get('per_duedate')?.value;

    if (startDate && endDate && startDate >= endDate) {
      this._messageService.error('Error de Fechas', 'La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    if (endDate && dueDate && endDate >= dueDate) {
      this._messageService.error('Error de Fechas', 'La fecha de fin debe ser anterior a la fecha de vencimiento');
      return;
    }

    this.isLoading = true;

    if(!this.isEditing) {
      this._periodsService.savePeriod(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this._messageService.success(
              'Período Creado', 
              'El período se agregó correctamente.',
              () => {
                this.router.navigate(['/admin/user/periods']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar el período');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage.error?.error || 'Hubo un problema al guardar el período');
        }
      });
    } else {
      this._periodsService.updatePeriod(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this._messageService.success(
              'Período Actualizado', 
              'El período se actualizó correctamente.',
              () => {
                this.router.navigate(['/admin/user/periods']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar el período');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage.error?.error || 'Hubo un problema al actualizar el período');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/periods']);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'per_periodnumber') {
        return 'Ingrese exactamente 6 dígitos (YYYYMM)';
      }
      return 'Formato inválido';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es ' + control.errors?.['min'].min;
    }
    return null;
  }

  formatterDollar = formatterDollar;
  parserDollar = parserDollar;
  currencyFormatter = formatterDollar;
  currencyParser = parserDollar;

  // Obtener color del estado para mostrar en el formulario
  getStatusColor(statusId: string): string {
    switch (statusId) {
      case '1': return 'success';    // Abierto
      case '2': return 'default';    // Cerrado
      case '3': return 'processing'; // Pagado
      case '4': return 'error';      // Vencido
      default: return 'default';
    }
  }

  // Obtener icono del estado
  getStatusIcon(statusId: string): string {
    switch (statusId) {
      case '1': return 'unlock';            // Abierto
      case '2': return 'lock';              // Cerrado
      case '3': return 'check-circle';      // Pagado
      case '4': return 'exclamation-circle'; // Vencido
      default: return 'info-circle';
    }
  }

  // Obtener etiqueta del estado
  getStatusLabel(statusId: string): string {
    const status = this.periodStatuses.find(s => s.sper_uuid === statusId);
    return status ? status.sper_name : 'Desconocido';
  }

  // Formatear número de período (YYYYMM → MM/YYYY)
  formatPeriodNumber(value: string): string {
    if (!value || value.length !== 6) return value;
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    return `${month}/${year}`;
  }
}