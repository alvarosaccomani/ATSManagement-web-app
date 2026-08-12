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
import { TypeCardsService } from '../../../core/services/type-cards.service';

@Component({
  selector: 'app-type-card',
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
  templateUrl: './type-card.component.html',
  styleUrl: './type-card.component.scss'
})
export class TypeCardComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  typeCardId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _typeCardsService: TypeCardsService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      tycrd_uuid: [{ value: '', disabled: true }],
      tycrd_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      tycrd_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.typeCardId = this.route.snapshot.paramMap.get('tycrd_uuid');
    this.isEditing = !!this.typeCardId;
    
    if (this.isEditing) {
      this.loadTypeCard();
    } else {
      this.form.get('tycrd_uuid')?.disable();
    }
  }

  loadTypeCard(): void {
    this.isLoading = true;
    this._typeCardsService.getTypeCardById(this.typeCardId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const typeCard = response.data;
          this.form.get('tycrd_uuid')?.enable();
          this.form.patchValue(typeCard);
          this.form.get('tycrd_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del tipo de tarjeta');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el tipo de tarjeta');
      }
    });
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

    if(!this.isEditing) {
      this._typeCardsService.saveTypeCard(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Tipo de tarjeta creado correctamente');
            this.router.navigate(['/admin/user/type-cards']);
          } else {
            this.message.error(response.message || 'Error al guardar el tipo de tarjeta');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._typeCardsService.updateTypeCard(this.typeCardId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Tipo de tarjeta actualizado correctamente');
            this.router.navigate(['/admin/user/type-cards']);
          } else {
            this.message.error(response.message || 'Error al actualizar el tipo de tarjeta');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/type-cards']);
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
