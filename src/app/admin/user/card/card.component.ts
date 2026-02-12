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
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  cardId: string | null = null;

  // Opciones para selects
  cardTypes = [
    { value: '1', label: 'Débito' },
    { value: '2', label: 'Crédito' },
    { value: '3', label: 'Prepaga' }
  ];

  cardBrands = [
    { value: '1', label: 'Visa' },
    { value: '2', label: 'Mastercard' },
    { value: '3', label: 'American Express' }
  ];

  banks = [
    { value: '1', label: 'Banco Provincia' },
    { value: '2', label: 'Banco Nación' },
    { value: '3', label: 'Banco Galicia' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      crd_uuid: [{ value: '', disabled: true }],
      crd_last4digits: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      tycrd_uuid: ['', Validators.required],
      brcrd_uuid: ['', Validators.required],
      ban_uuid: ['', Validators.required],
      crd_expirationdate: [null, Validators.required],
      crd_creditlimit: [null],
      crd_active: [true]
    });
  }

  ngOnInit(): void {
    this.cardId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.cardId;
    
    if (this.isEditing) {
      this.loadCard();
    } else {
      this.form.get('crd_uuid')?.disable();
    }

    // Escuchar cambios en el tipo de tarjeta para limpiar límite de crédito si es débito
    this.form.get('tycrd_uuid')?.valueChanges.subscribe(value => {
      if (value === '1') { // Débito
        this.form.get('crd_creditlimit')?.setValue(null);
      }
    });
  }

  loadCard(): void {
    this.isLoading = true;
    
    // Simular carga desde API
    setTimeout(() => {
      const mockCard = {
        crd_uuid: this.cardId,
        crd_last4digits: '8936',
        tycrd_uuid: '1',
        brcrd_uuid: '1',
        ban_uuid: '1',
        crd_expirationdate: new Date('2026-01-01'),
        crd_creditlimit: null,
        crd_active: true
      };
      
      this.form.get('crd_uuid')?.enable();
      this.form.patchValue(mockCard);
      this.form.get('crd_uuid')?.disable();
      
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

    this.isLoading = true;
    
    // Simular guardado
    setTimeout(() => {
      this.isLoading = false;
      const action = this.isEditing ? 'actualizada' : 'creada';
      this.message.success(`Tarjeta ${action} exitosamente`);
      this.router.navigate(['/admin/user/tarjetas']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/tarjetas']);
  }

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

  currencyFormatter = (value: number): string => {
    if (!value) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };

  onInstallmentsChange(value: boolean): void {
    // Esta función puede ser usada si necesitas lógica adicional al cambiar cuotas
  }
}