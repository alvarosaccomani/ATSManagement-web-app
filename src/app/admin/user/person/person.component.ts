import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonsService } from '../../../core/services/persons.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-person',
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
    NzSelectModule,
    NzSwitchModule
  ],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss'
})
export class PersonComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  prs_uuid: string | null = null;
  scopes: ScopeInterface[] = [];

  personTypes = [
    { value: 'SOCIO', label: 'Socio / Miembro' },
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'PROVEEDOR', label: 'Proveedor' },
    { value: 'AMIGO', label: 'Amigo / Familiar' },
    { value: 'OTRO', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _personsService: PersonsService,
    private _scopesService: ScopesService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      prs_uuid: [{ value: '', disabled: true }],
      scp_uuid: ['', Validators.required],
      prs_name: ['', [Validators.required, Validators.maxLength(150)]],
      prs_type: ['CLIENTE', Validators.required],
      prs_phone: [''],
      prs_email: ['', [Validators.email]],
      prs_taxid: [''],
      usr_uuidlinked: [null],
      prs_active: [true]
    });
  }

  ngOnInit(): void {
    this.prs_uuid = this.route.snapshot.paramMap.get('prs_uuid');
    this.isEditing = !!this.prs_uuid;

    const queryScope = this.route.snapshot.queryParamMap.get('scp_uuid');

    this.loadScopes(queryScope);

    if (this.isEditing) {
      this.loadPerson(this.prs_uuid!);
    }
  }

  loadScopes(defaultScopeUuid?: string | null): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.scopes = response.data;
          if (!this.form.get('scp_uuid')?.value) {
            const initialScope = defaultScopeUuid || this.scopes[0].scp_uuid;
            this.form.get('scp_uuid')?.setValue(initialScope);
          }
        }
      }
    });
  }

  loadPerson(prs_uuid: string): void {
    this.isLoading = true;
    this._personsService.getPersonById(prs_uuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.form.patchValue(response.data);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar el contacto.');
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
    const payload = this.form.getRawValue();

    if (!this.isEditing) {
      this._personsService.savePerson(payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Contacto Registrado',
              'El registro fue guardado correctamente.',
              () => this.router.navigate(['/admin/user/persons'])
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar el contacto.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error('Error', error?.error?.error || 'Hubo un problema al guardar el contacto.');
        }
      });
    } else {
      this._personsService.updatePerson(this.prs_uuid!, payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Contacto Actualizado',
              'El registro fue actualizado correctamente.',
              () => this.router.navigate(['/admin/user/persons'])
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar el contacto.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error);
          this._messageService.error('Error', error?.error?.error || 'Hubo un problema al actualizar el contacto.');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/persons']);
  }
}
