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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ScopesService } from '../../../core/services/scopes.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Form component (`<app-scope>`) for creating and editing accounting scopes (contexts)
 * at `/admin/user/scope/new` and `/admin/user/scope/edit/:scp_uuid`.
 */
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
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
    NzSelectModule,
    NzModalModule,
    NzDividerModule,
    NzAlertModule,
    NzToolTipModule
  ],
  templateUrl: './scope.component.html',
  styleUrl: './scope.component.scss'
})
export class ScopeComponent implements OnInit {
  /** Reactive form group for scope attributes. */
  form: FormGroup;
  /** Indicates whether data is being loaded or submitted. */
  isLoading = false;
  /** Indicates whether the component is editing an existing scope (`true`) or creating a new one (`false`). */
  isEditing = false;
  /** UUID of the scope being edited, or `null` when creating a new scope. */
  scp_uuid: string | null = null;

  /** Lista de miembros/usuarios vinculados a este ámbito. */
  scopeUsers: any[] = [];
  /** Lista completa de usuarios registrados en el sistema para invitar. */
  availableUsers: any[] = [];
  /** Indica si se están cargando los miembros. */
  isLoadingMembers = false;
  /** Visibilidad del modal para agregar un miembro. */
  isAddMemberModalVisible = false;
  /** UUID del usuario seleccionado para agregar. */
  selectedUserUuidToAdd: string | null = null;
  /** Rol seleccionado para el nuevo miembro ('ADMIN', 'MEMBER', 'VIEWER'). */
  selectedRoleToAdd: string = 'MEMBER';
  /** Indica si se está guardando la membresía. */
  isSavingMember = false;

  /**
   * Initializes the scope form component.
   *
   * @param fb Angular `FormBuilder` instance.
   * @param route Activated route used to extract `scp_uuid`.
   * @param router Angular `Router` instance.
   * @param _scopesService Service for scope CRUD operations.
   * @param _sessionService Service for extracting current session identity.
   * @param _messageService Service for displaying modal notifications.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _scopesService: ScopesService,
    private _sessionService: SessionService,
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

  /** Gets current authenticated user UUID. */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Checks route parameters for `scp_uuid` and loads existing scope data if editing.
   */
  ngOnInit(): void {
    this.scp_uuid = this.route.snapshot.paramMap.get('scp_uuid');
    this.isEditing = !!this.scp_uuid;

    if (this.isEditing) {
      this.loadScope(this.scp_uuid!);
      this.loadScopeUsers(this.scp_uuid!);
    }
  }

  /**
   * Carga los miembros asignados al ámbito.
   */
  loadScopeUsers(scp_uuid: string): void {
    this.isLoadingMembers = true;
    this._scopesService.getScopeUsers(scp_uuid).subscribe({
      next: (response: any) => {
        this.isLoadingMembers = false;
        if (response.success && response.data) {
          this.scopeUsers = response.data;
        }
      },
      error: (error: any) => {
        this.isLoadingMembers = false;
        console.error('Error al cargar miembros del ámbito:', error);
      }
    });
  }

  /**
   * Abre el modal para agregar un miembro y carga los usuarios del sistema si aún no se obtuvieron.
   */
  openAddMemberModal(): void {
    this.selectedUserUuidToAdd = null;
    this.selectedRoleToAdd = 'MEMBER';
    this.isAddMemberModalVisible = true;
    if (this.availableUsers.length === 0) {
      this._scopesService.getAllUsers().subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.availableUsers = response.data;
          }
        },
        error: (error: any) => console.error('Error al cargar usuarios:', error)
      });
    }
  }

  /** Lista de usuarios del sistema que aún no son miembros de este ámbito. */
  get usersEligibleToAdd(): any[] {
    const existingUuids = new Set(this.scopeUsers.map(su => su.usr_uuid));
    return this.availableUsers.filter(u => !existingUuids.has(u.usr_uuid));
  }

  /**
   * Guarda la asignación del nuevo miembro en el ámbito.
   */
  confirmAddMember(): void {
    if (!this.selectedUserUuidToAdd) {
      this._messageService.error('Usuario requerido', 'Por favor seleccione el usuario a vincular.');
      return;
    }
    this.isSavingMember = true;
    this._scopesService.addScopeUser(this.scp_uuid!, this.selectedUserUuidToAdd, this.selectedRoleToAdd).subscribe({
      next: (response: any) => {
        this.isSavingMember = false;
        if (response.success) {
          this._messageService.success('Miembro Agregado', 'El usuario fue asignado al ámbito exitosamente.');
          this.isAddMemberModalVisible = false;
          this.loadScopeUsers(this.scp_uuid!);
        } else {
          this._messageService.error('Error', response.message || 'No se pudo agregar el miembro.');
        }
      },
      error: (error: any) => {
        this.isSavingMember = false;
        console.error(error);
        this._messageService.error('Error', error?.error?.error || 'Hubo un problema al agregar el miembro.');
      }
    });
  }

  /**
   * Desvincula un miembro del ámbito con confirmación.
   */
  onRemoveMember(usr_uuid: string, userName: string): void {
    this._messageService.confirm(
      '¿Desvincular miembro?',
      `¿Está seguro de remover a "${userName}" de este ámbito? Perderá el acceso a sus movimientos y datos.`,
      () => {
        this.isLoadingMembers = true;
        this._scopesService.removeScopeUser(this.scp_uuid!, usr_uuid).subscribe({
          next: (response: any) => {
            this.isLoadingMembers = false;
            if (response.success) {
              this._messageService.success('Miembro Desvinculado', 'El usuario fue removido del ámbito.');
              this.loadScopeUsers(this.scp_uuid!);
            } else {
              this._messageService.error('Error', response.message || 'No se pudo desvincular el miembro.');
            }
          },
          error: (error: any) => {
            this.isLoadingMembers = false;
            console.error(error);
            this._messageService.error('Error', error?.error?.error || 'Hubo un problema al desvincular el miembro.');
          }
        });
      }
    );
  }

  /** Retorna el color distintivo según el rol. */
  getRoleColor(role: string): string {
    switch ((role || '').toUpperCase()) {
      case 'OWNER': return 'gold';
      case 'ADMIN': return 'blue';
      case 'MEMBER': return 'green';
      default: return 'default';
    }
  }

  /** Retorna el nombre legible del rol. */
  getRoleLabel(role: string): string {
    switch ((role || '').toUpperCase()) {
      case 'OWNER': return 'Propietario';
      case 'ADMIN': return 'Administrador';
      case 'MEMBER': return 'Miembro';
      case 'VIEWER': return 'Observador';
      default: return role;
    }
  }

  /**
   * Fetches an existing scope record by its UUID and patches the form values.
   *
   * @param scp_uuid Unique identifier of the scope to load.
   */
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

  /**
   * Validates and submits the scope form to create or update the scope record.
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

    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this._messageService.error('Sesión Requerida', 'No se pudo identificar al usuario activo.');
      return;
    }

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    if (!this.isEditing) {
      delete rawValue.scp_uuid;
    }
    const payload = {
      ...rawValue,
      usr_uuidowner: usr_uuid
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

  /**
   * Cancels editing and returns to the scopes list (`/admin/user/scopes`).
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/scopes']);
  }
}
