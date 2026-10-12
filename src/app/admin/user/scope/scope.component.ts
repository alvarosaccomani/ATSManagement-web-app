import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-scope',
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
    NzSwitchModule
  ],
  templateUrl: './scope.component.html',
  styleUrl: './scope.component.scss'
})
export class ScopeComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  scp_uuid: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _scopesService: ScopesService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      scp_uuid: [{ value: '', disabled: true }],
      scp_name: ['', [Validators.required, Validators.maxLength(100)]],
      scp_description: [''],
      scp_isshared: [false],
      scp_color: ['#1890ff'],
      scp_icon: [''],
      scp_active: [true]
    });
  }

  ngOnInit(): void {
    this.scp_uuid = this.route.snapshot.paramMap.get('scp_uuid');
    this.isEditing = !!this.scp_uuid;

    if (this.isEditing) {
      this.loadScope(this.scp_uuid!);
    }
  }

  loadScope(scp_uuid: string): void {
    this.isLoading = true;
    this._scopesService.getScopeById(scp_uuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.form.patchValue(response.data);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar el ámbito.');
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
      this._messageService.error('Formulario Inválido', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    if (!this.isEditing) {
      delete rawValue.scp_uuid;
    }
    const payload = {
      ...rawValue,
      usr_uuidowner: '7a067c90-bf5b-45d1-8f07-91b578e2d54d'
    };

    if (!this.isEditing) {
      this._scopesService.saveScope(payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Ámbito Registrado',
              'El registro fue guardado correctamente.',
              () => this.router.navigate(['/admin/user/scopes'])
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar el ámbito.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error('Error', error?.error?.error || 'Hubo un problema al guardar el ámbito.');
        }
      });
    } else {
      this._scopesService.updateScope(this.scp_uuid!, payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Ámbito Actualizado',
              'El registro fue actualizado correctamente.',
              () => this.router.navigate(['/admin/user/scopes'])
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar el ámbito.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error('Error', error?.error?.error || 'Hubo un problema al actualizar el ámbito.');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/scopes']);
  }
}
