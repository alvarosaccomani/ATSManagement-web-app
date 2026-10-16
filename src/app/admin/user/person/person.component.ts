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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonsService } from '../../../core/services/persons.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente de formulario (`<app-person>`) para crear y editar contactos/personas
 * en `/admin/user/person/new` y `/admin/user/person/edit/:prs_uuid`.
 *
 * @description Permite asignar un contacto a un ámbito, seleccionar múltiples roles (`VENDEDOR`, `SOCIO`,
 * `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`), configurar un porcentaje de comisión de ventas (`prs_commissionrate`),
 * y almacenar la identificación fiscal (`prs_taxid`).
 */
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
    NzSwitchModule,
    NzInputNumberModule,
    NzCheckboxModule
  ],
  templateUrl: './person.component.html',
  styleUrl: './person.component.scss'
})
export class PersonComponent implements OnInit {
  /** Grupo de formulario reactivo para los atributos del contacto/persona. */
  form: FormGroup;
  /** Indica si los datos se están cargando o enviando. */
  isLoading = false;
  /** Indica si el componente está editando una persona existente (`true`) o creando una nueva (`false`). */
  isEditing = false;
  /** UUID de la persona que se está editando, o `null` al crear un nuevo registro. */
  prs_uuid: string | null = null;
  /** Ámbitos disponibles para asignar el contacto. */
  scopes: ScopeInterface[] = [];

  /** Opciones de roles seleccionables para el contacto (`SOCIO`, `VENDEDOR`, `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`). */
  typeOptions = [
    { label: 'Socio / Miembro', value: 'SOCIO', checked: false },
    { label: 'Vendedor', value: 'VENDEDOR', checked: false },
    { label: 'Cliente', value: 'CLIENTE', checked: false },
    { label: 'Proveedor', value: 'PROVEEDOR', checked: false },
    { label: 'Amigo / Familiar', value: 'AMIGO', checked: false },
    { label: 'Otro', value: 'OTRO', checked: false }
  ];

  /**
   * Inicializa el componente de formulario de persona.
   *
   * @param fb Instancia de `FormBuilder` de Angular.
   * @param route Instantánea de la ruta activa.
   * @param router Instancia de `Router` de Angular.
   * @param _personsService Servicio para operaciones CRUD de personas.
   * @param _scopesService Servicio para obtener los ámbitos del usuario.
   * @param _messageService Servicio para mostrar notificaciones modales.
   */
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
      prs_phone: [''],
      prs_email: ['', [Validators.email]],
      prs_taxid: [''],
      prs_commissionrate: [null, [Validators.min(0), Validators.max(100)]],
      usr_uuidlinked: [null],
      prs_active: [true]
    });
  }

  /**
   * Inicializa el formulario, carga los ámbitos y completa los datos de la persona existente si se está editando.
   */
  ngOnInit(): void {
    this.prs_uuid = this.route.snapshot.paramMap.get('prs_uuid');
    this.isEditing = !!this.prs_uuid;

    const queryScope = this.route.snapshot.queryParamMap.get('scp_uuid');

    this.loadScopes(queryScope);

    if (this.isEditing) {
      this.loadPerson(this.prs_uuid!);
    } else {
      // Default to CLIENTE for new person
      const clienteOpt = this.typeOptions.find(o => o.value === 'CLIENTE');
      if (clienteOpt) clienteOpt.checked = true;
    }
  }

  /**
   * Carga los ámbitos disponibles y establece el valor predeterminado del control `scp_uuid`.
   *
   * @param defaultScopeUuid UUID de ámbito opcional pasado mediante parámetros de consulta.
   */
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

  /**
   * Carga un registro de persona existente por su UUID y completa el formulario y las casillas de verificación de roles.
   *
   * @param prs_uuid Identificador único de la persona a cargar.
   */
  loadPerson(prs_uuid: string): void {
    this.isLoading = true;
    this._personsService.getPersonById(prs_uuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.form.patchValue(response.data);
          if (response.data.prs_type) {
            const types = response.data.prs_type.split(',').map((t: string) => t.trim());
            this.typeOptions.forEach(opt => {
              opt.checked = types.includes(opt.value);
            });
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar el contacto.');
      }
    });
  }

  /**
   * Valida el formulario, serializa los roles seleccionados en una cadena `prs_type` separada por comas,
   * y guarda o actualiza el registro de la persona.
   */
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

    const selectedTypes = this.typeOptions.filter(opt => opt.checked).map(opt => opt.value);
    const prs_type = selectedTypes.length > 0 ? selectedTypes.join(',') : 'OTRO';

    this.isLoading = true;
    const rawData = this.form.getRawValue();
    if (!this.isEditing) {
      delete rawData.prs_uuid;
    }
    const payload = {
      ...rawData,
      prs_type
    };

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

  /**
   * Cancela la edición y navega de regreso a la lista de personas (`/admin/user/persons`).
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/persons']);
  }
}
