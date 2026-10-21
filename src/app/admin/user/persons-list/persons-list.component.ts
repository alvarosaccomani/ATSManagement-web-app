import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import { PersonInterface } from '../../../core/interfaces/person.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonsService } from '../../../core/services/persons.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente de lista (`<app-persons-list>`) para visualizar, filtrar y gestionar contactos/personas
 * en `/admin/user/persons`.
 */
@Component({
  selector: 'app-persons-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzCardModule,
    NzSelectModule,
    NzToolTipModule,
    NzAlertModule,
    NzEmptyModule
  ],
  templateUrl: './persons-list.component.html',
  styleUrl: './persons-list.component.scss'
})
export class PersonsListComponent implements OnInit {
  /** Indica si la tabla de contactos se está cargando actualmente. */
  isLoading = false;
  /** Lista sin filtrar de personas para el ámbito seleccionado. */
  persons: PersonInterface[] = [];
  /** Lista filtrada de personas que coinciden con el filtro de rol seleccionado. */
  filteredPersons: PersonInterface[] = [];
  /** Ámbitos disponibles para el selector de ámbito. */
  scopes: ScopeInterface[] = [];
  /** UUID del ámbito seleccionado actualmente. */
  selectedScopeUuid: string = '';
  /** Filtro de rol seleccionado actualmente (`'TODOS'` por defecto). */
  selectedType: string = 'TODOS';

  /** Opciones de filtro de rol disponibles. */
  personTypes = [
    { value: 'TODOS', label: 'Todos los tipos' },
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'SOCIO', label: 'Socio / Miembro' },
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'PROVEEDOR', label: 'Proveedor' },
    { value: 'AMIGO', label: 'Amigo / Familiar' },
    { value: 'OTRO', label: 'Otro' }
  ];

  /**
   * Inicializa el componente de lista de personas.
   *
   * @param _personsService Servicio para consultar y eliminar personas.
   * @param _scopesService Servicio para consultar los ámbitos del usuario.
   * @param _sessionService Servicio para obtener la identidad de la sesión activa.
   * @param _messageService Servicio para mostrar notificaciones modales.
   * @param _router Instancia de `Router` de Angular.
   */
  constructor(
    private _personsService: PersonsService,
    private _scopesService: ScopesService,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Indica si el usuario cuenta con ámbitos disponibles.
   */
  get hasScopes(): boolean {
    return this.scopes.length > 0;
  }

  /**
   * Carga los ámbitos y contactos al iniciar el componente.
   */
  ngOnInit(): void {
    this.loadScopes();
  }

  /**
   * Obtiene los ámbitos del usuario, selecciona el primer ámbito por defecto y carga sus contactos.
   */
  loadScopes(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.scopes = [];
      this.persons = [];
      this.filteredPersons = [];
      return;
    }
    this.isLoading = true;
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.scopes = response.data;
          this.selectedScopeUuid = this.scopes[0].scp_uuid;
          this.loadPersons();
        } else {
          this.scopes = [];
          this.selectedScopeUuid = '';
          this.persons = [];
          this.filteredPersons = [];
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar ámbitos en personas:', error);
        this.scopes = [];
        this.selectedScopeUuid = '';
        this.persons = [];
        this.filteredPersons = [];
        this.isLoading = false;
        this._messageService.error('Error', 'No se pudieron cargar los ámbitos.');
      }
    });
  }

  /**
   * Recarga los contactos cuando el usuario cambia el filtro de ámbito activo.
   *
   * @param scp_uuid UUID del ámbito seleccionado.
   */
  onScopeChange(scp_uuid: string): void {
    this.selectedScopeUuid = scp_uuid;
    this.loadPersons();
  }

  /**
   * Obtiene todos los registros de personas para `selectedScopeUuid` y aplica el filtro de rol activo.
   */
  loadPersons(): void {
    if (!this.selectedScopeUuid) return;
    this.isLoading = true;
    this._personsService.getPersons(this.selectedScopeUuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.persons = response.data;
          this.applyFilter();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudieron cargar los contactos.');
      }
    });
  }

  /**
   * Filtra `persons` según el rol seleccionado (`selectedType`).
   */
  applyFilter(): void {
    if (this.selectedType === 'TODOS') {
      this.filteredPersons = [...this.persons];
    } else {
      this.filteredPersons = this.persons.filter(p => 
        p.prs_type && p.prs_type.split(',').map(t => t.trim()).includes(this.selectedType)
      );
    }
  }

  /**
   * Divide una cadena `prs_type` separada por comas en un arreglo de etiquetas de rol individuales.
   *
   * @param type Cadena de roles separada por comas.
   * @returns Arreglo de cadenas de roles.
   */
  splitTypes(type: string): string[] {
    if (!type) return ['OTRO'];
    return type.split(',').map(t => t.trim()).filter(Boolean);
  }

  /**
   * Asigna un rol de contacto a un color de etiqueta de Ng-Zorro.
   *
   * @param type Código del rol (`'VENDEDOR' | 'SOCIO' | 'CLIENTE' | 'PROVEEDOR' | 'AMIGO'`).
   * @returns Nombre del color de la etiqueta.
   */
  getTypeTagColor(type: string): string {
    switch (type) {
      case 'VENDEDOR': return 'gold';
      case 'SOCIO': return 'purple';
      case 'CLIENTE': return 'green';
      case 'PROVEEDOR': return 'orange';
      case 'AMIGO': return 'cyan';
      default: return 'blue';
    }
  }

  /**
   * Navega al formulario de nueva persona (`/admin/user/person/new`), pasando el `scp_uuid` activo.
   */
  newPerson(): void {
    if (!this.hasScopes) {
      this._messageService.error('Ámbito Requerido', 'Debes configurar o tener asignado al menos un ámbito contable antes de crear un contacto.');
      return;
    }
    this._router.navigate(['/admin/user/person/new'], {
      queryParams: { scp_uuid: this.selectedScopeUuid }
    });
  }

  /**
   * Navega al formulario de edición para la persona seleccionada (`/admin/user/person/edit/:prs_uuid`).
   *
   * @param person Registro de persona a editar.
   */
  editPerson(person: PersonInterface): void {
    this._router.navigate(['/admin/user/person/edit', person.prs_uuid]);
  }

  /**
   * Solicita confirmación y elimina el registro de la persona seleccionada.
   *
   * @param person Registro de persona a eliminar.
   */
  deletePerson(person: PersonInterface): void {
    this._messageService.confirm(
      '¿Eliminar Contacto?',
      `¿Está seguro de eliminar a "${person.prs_name}"?`,
      () => {
        this._personsService.deletePerson(person.prs_uuid).subscribe({
          next: (response) => {
            if (response.success) {
              this._messageService.success('Contacto Eliminado', 'El registro fue eliminado correctamente.');
              this.loadPersons();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar el contacto.');
            }
          },
          error: (error) => {
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema al eliminar el contacto.');
          }
        });
      }
    );
  }
}
