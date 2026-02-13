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
  per_uuid: string;
}

@Component({
  selector: 'app-voucher-fee',
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
  templateUrl: './voucher-fee.component.html',
  styleUrl: './voucher-fee.component.scss'
})
export class VoucherFeeComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  installmentId: string | null = null;

  // Opciones para selects
  installmentStatuses = [
    { value: '1', label: 'Pendiente' },
    { value: '2', label: 'Pagado' },
    { value: '3', label: 'Vencido' }
  ];

  vouchers = [
    { value: '1', label: 'Voucher #1 - Supermercado Prueba' },
    { value: '2', label: 'Voucher #2 - Electrodomésticos XYZ' },
    { value: '3', label: 'Voucher #3 - Farmacia Salud' }
  ];

  cards = [
    { value: '1', label: '**** **** **** 8936' },
    { value: '2', label: '**** **** **** 5421' },
    { value: '3', label: '**** **** **** 7890' }
  ];

  periods = [
    { value: '1', label: 'Período 01/2026' },
    { value: '2', label: 'Período 02/2026' },
    { value: '3', label: 'Período 03/2026' }
  ];

  // Mapeo de datos relacionados con tipado seguro
  private relatedDataMap: { [key: string]: RelatedData } = {
    '1': { crd_uuid: '1', per_uuid: '1' },
    '2': { crd_uuid: '2', per_uuid: '2' },
    '3': { crd_uuid: '3', per_uuid: '3' }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      vouf_uuid: [{ value: '', disabled: true }],
      vouf_quotanumber: [1, [Validators.required, Validators.min(1), Validators.max(36)]],
      vouf_quotaamount: [null, [Validators.required, Validators.min(0)]],
      vouf_quotaduedate: [null, Validators.required],
      voufs_uuid: ['1', Validators.required],
      vou_uuid: ['', Validators.required],
      crd_uuid: [{ value: '', disabled: true }],
      per_uuid: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.installmentId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.installmentId;
    
    if (this.isEditing) {
      this.loadInstallment();
    } else {
      this.form.get('vouf_uuid')?.disable();
    }

    // Escuchar cambios en voucher para actualizar tarjeta y período relacionados
    this.form.get('vou_uuid')?.valueChanges.subscribe(voucherId => {
      if (voucherId) {
        this.loadRelatedData(voucherId);
      } else {
        this.form.get('crd_uuid')?.setValue('');
        this.form.get('per_uuid')?.setValue('');
      }
    });
  }

  loadInstallment(): void {
    this.isLoading = true;
    
    // Simular carga desde API
    setTimeout(() => {
      const mockInstallment = {
        vouf_uuid: this.installmentId,
        vouf_quotanumber: 1,
        vouf_quotaamount: 100.00,
        vouf_quotaduedate: new Date('2026-10-02'),
        voufs_uuid: '1',
        vou_uuid: '1',
        crd_uuid: '1',
        per_uuid: '1'
      };
      
      // Habilitar temporalmente para patchear
      this.form.get('vouf_uuid')?.enable();
      this.form.get('crd_uuid')?.enable();
      this.form.get('per_uuid')?.enable();
      
      this.form.patchValue(mockInstallment);
      
      this.form.get('vouf_uuid')?.disable();
      this.form.get('crd_uuid')?.disable();
      this.form.get('per_uuid')?.disable();
      
      this.isLoading = false;
    }, 500);
  }

  loadRelatedData(voucherId: string): void {
    // Verificar si el voucherId existe en el mapa
    if (this.relatedDataMap.hasOwnProperty(voucherId)) {
      const data = this.relatedDataMap[voucherId];
      // Habilitar temporalmente para setear valor
      this.form.get('crd_uuid')?.enable();
      this.form.get('per_uuid')?.enable();
      
      this.form.get('crd_uuid')?.setValue(data.crd_uuid);
      this.form.get('per_uuid')?.setValue(data.per_uuid);
      
      this.form.get('crd_uuid')?.disable();
      this.form.get('per_uuid')?.disable();
    } else {
      // Si no existe, limpiar los campos
      this.form.get('crd_uuid')?.enable();
      this.form.get('per_uuid')?.enable();
      
      this.form.get('crd_uuid')?.setValue('');
      this.form.get('per_uuid')?.setValue('');
      
      this.form.get('crd_uuid')?.disable();
      this.form.get('per_uuid')?.disable();
    }
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

    this.isLoading = true;
    
    // Simular guardado
    setTimeout(() => {
      this.isLoading = false;
      const action = this.isEditing ? 'actualizada' : 'creada';
      this.message.success(`Cuota ${action} exitosamente`);
      this.router.navigate(['/admin/user/cuotas-comprobantes']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/cuotas-comprobantes']);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es ' + control.errors?.['min'].min;
    }
    if (control?.hasError('max')) {
      return 'El valor máximo es ' + control.errors?.['max'].max;
    }
    return null;
  }

  currencyFormatter = (value: number): string => {
    if (!value) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };

  // Obtener color del estado para mostrar en el formulario
  getStatusColor(statusId: string): string {
    switch (statusId) {
      case '1': return 'processing'; // Pendiente
      case '2': return 'success';    // Pagado
      case '3': return 'error';      // Vencido
      default: return 'default';
    }
  }

  // Obtener etiqueta del estado
  getStatusLabel(statusId: string): string {
    const status = this.installmentStatuses.find(s => s.value === statusId);
    return status ? status.label : 'Desconocido';
  }
}