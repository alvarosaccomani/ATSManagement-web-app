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

@Component({
  selector: 'app-bank',
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
    NzDividerModule
  ],
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.scss'
})
export class BankComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  bankId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      ban_uuid: [{ value: '', disabled: true }],
      ban_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      ban_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.bankId = this.route.snapshot.paramMap.get('ban_uuid');
    this.isEditing = !!this.bankId;
    
    if (this.isEditing) {
      this.loadBank();
    } else {
      // Para nuevo, deshabilitar el campo UUID ya que es autogenerado
      this.form.get('ban_uuid')?.disable();
    }
  }

  loadBank(): void {
    this.isLoading = true;
    
    // Simular carga desde API
    setTimeout(() => {
      const mockBank = {
        ban_uuid: this.bankId,
        ban_name: 'Banco de Prueba',
        ban_description: 'Descripción del banco de prueba'
      };
      
      // Habilitar temporalmente para patchear el valor
      this.form.get('ban_uuid')?.enable();
      this.form.patchValue(mockBank);
      this.form.get('ban_uuid')?.disable();
      
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
      const action = this.isEditing ? 'actualizado' : 'creado';
      this.message.success(`Banco ${action} exitosamente`);
      this.router.navigate(['/admin/user/bancos']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/bancos']);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return null;
  }
}