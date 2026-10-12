import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { PersonInterface } from '../../../core/interfaces/person.interface';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { PersonsService } from '../../../core/services/persons.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-persons-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzCardModule,
    NzSelectModule,
    NzToolTipModule
  ],
  templateUrl: './persons-list.component.html',
  styleUrl: './persons-list.component.scss'
})
export class PersonsListComponent implements OnInit {
  isLoading = false;
  persons: PersonInterface[] = [];
  filteredPersons: PersonInterface[] = [];
  scopes: ScopeInterface[] = [];
  selectedScopeUuid: string = '';
  selectedType: string = 'TODOS';

  personTypes = [
    { value: 'TODOS', label: 'Todos los tipos' },
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'SOCIO', label: 'Socio / Miembro' },
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'PROVEEDOR', label: 'Proveedor' },
    { value: 'AMIGO', label: 'Amigo / Familiar' },
    { value: 'OTRO', label: 'Otro' }
  ];

  constructor(
    private _personsService: PersonsService,
    private _scopesService: ScopesService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadScopes();
  }

  loadScopes(): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          this.scopes = response.data;
          this.selectedScopeUuid = this.scopes[0].scp_uuid;
          this.loadPersons();
        }
      },
      error: (error) => {
        console.error(error);
        this._messageService.error('Error', 'No se pudieron cargar los ámbitos.');
      }
    });
  }

  onScopeChange(scp_uuid: string): void {
    this.selectedScopeUuid = scp_uuid;
    this.loadPersons();
  }

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

  applyFilter(): void {
    if (this.selectedType === 'TODOS') {
      this.filteredPersons = [...this.persons];
    } else {
      this.filteredPersons = this.persons.filter(p => 
        p.prs_type && p.prs_type.split(',').map(t => t.trim()).includes(this.selectedType)
      );
    }
  }

  splitTypes(type: string): string[] {
    if (!type) return ['OTRO'];
    return type.split(',').map(t => t.trim()).filter(Boolean);
  }

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

  newPerson(): void {
    this._router.navigate(['/admin/user/person/new'], {
      queryParams: { scp_uuid: this.selectedScopeUuid }
    });
  }

  editPerson(person: PersonInterface): void {
    this._router.navigate(['/admin/user/person/edit', person.prs_uuid]);
  }

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
