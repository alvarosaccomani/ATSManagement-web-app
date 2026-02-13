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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';

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
  periodId: string | null = null;

  // Opciones para selects
  periodStatuses = [
    { value: '1', label: 'Abierto' },
    { value: '2', label: 'Cerrado' },
    { value: '3', label: 'Pagado' },
    { value: '4', label: 'Vencido' }
  ];

  cards = [
    { value: '1', label: '**** **** **** 8936' },
    { value: '2', label: '**** **** **** 5421' },
    { value: '3', label: '**** **** **** 7890' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      per_uuid: [{ value: '', disabled: true }],
      per_periodnumber: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      per_startdate: [null, Validators.required],
      per_enddate: [null, Validators.required],
      per_duedate: [null, Validators.required],
      sper_uuid: ['1', Validators.required],
      crd_uuid: ['', Validators.required],
      per_previousbalance: [0, [Validators.min(0)]],
      per_interest: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.periodId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.periodId;
    
    if (this.isEditing) {
      this.loadPeriod();
    } else {
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
    
    // Simular carga desde API
    setTimeout(() => {
      const mockPeriod = {
        per_uuid: this.periodId,
        per_periodnumber: '202601',
        per_startdate: new Date('2026-01-01'),
        per_enddate: new Date('2026-01-31'),
        per_duedate: new Date('2026-02-10'),
        sper_uuid: '1',
        crd_uuid: '1',
        per_previousbalance: 0,
        per_interest: 0
      };
      
      this.form.get('per_uuid')?.enable();
      this.form.patchValue(mockPeriod);
      this.form.get('per_uuid')?.disable();
      
      this.isLoading = false;
    }, 500);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    const startDate = this.form.get('per_startdate')?.value;
    const endDate = this.form.get('per_enddate')?.value;
    const dueDate = this.form.get('per_duedate')?.value;

    if (startDate && endDate && startDate >= endDate) {
      this.message.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    if (endDate && dueDate && endDate >= dueDate) {
      this.message.error('La fecha de fin debe ser anterior a la fecha de vencimiento');
      return;
    }

    this.isLoading = true;
    
    // Simular guardado
    setTimeout(() => {
      this.isLoading = false;
      const action = this.isEditing ? 'actualizado' : 'creado';
      this.message.success(`Período ${action} exitosamente`);
      this.router.navigate(['/admin/user/periodos']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/periodos']);
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

  currencyFormatter = (value: number): string => {
    if (!value && value !== 0) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };

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
    const status = this.periodStatuses.find(s => s.value === statusId);
    return status ? status.label : 'Desconocido';
  }

  // Formatear número de período (YYYYMM → MM/YYYY)
  formatPeriodNumber(value: string): string {
    if (!value || value.length !== 6) return value;
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    return `${month}/${year}`;
  }
}