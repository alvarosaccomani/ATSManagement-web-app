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
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { ScopesService } from '../../../core/services/scopes.service';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-scopes-list',
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
    NzToolTipModule
  ],
  templateUrl: './scopes-list.component.html',
  styleUrl: './scopes-list.component.scss'
})
export class ScopesListComponent implements OnInit {
  isLoading = false;
  scopes: ScopeInterface[] = [];

  constructor(
    private _scopesService: ScopesService,
    private _messageService: MessageService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadScopes();
  }

  loadScopes(): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
    this.isLoading = true;
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.scopes = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudieron cargar los ámbitos.');
      }
    });
  }

  newScope(): void {
    this._router.navigate(['/admin/user/scope/new']);
  }

  editScope(scope: ScopeInterface): void {
    this._router.navigate(['/admin/user/scope/edit', scope.scp_uuid]);
  }

  deleteScope(scope: ScopeInterface): void {
    this._messageService.confirm(
      '¿Eliminar Ámbito?',
      `¿Está seguro de eliminar el ámbito "${scope.scp_name}"?`,
      () => {
        this._scopesService.deleteScope(scope.scp_uuid).subscribe({
          next: (response) => {
            if (response.success) {
              this._messageService.success('Ámbito Eliminado', 'El registro fue eliminado correctamente.');
              this.loadScopes();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar el ámbito.');
            }
          },
          error: (error) => {
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema al eliminar el ámbito.');
          }
        });
      }
    );
  }
}
