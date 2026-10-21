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
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * List component (`<app-scopes-list>`) for viewing and managing accounting scopes at `/admin/user/scopes`.
 */
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
  /** Indicates whether the scopes table is currently loading. */
  isLoading = false;
  /** Array of accounting scopes displayed in the table. */
  scopes: ScopeInterface[] = [];

  /**
   * Initializes the scopes list component.
   *
   * @param _scopesService Service for fetching and deleting scopes.
   * @param _sessionService Service for extracting active session identity.
   * @param _messageService Service for displaying confirmation and status modals.
   * @param _router Angular `Router` instance.
   */
  constructor(
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
   * Loads the user's scopes when the component initializes.
   */
  ngOnInit(): void {
    this.loadScopes();
  }

  /**
   * Fetches all scopes for the user via {@link ScopesService.getScopes}.
   */
  loadScopes(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.isLoading = false;
      this.scopes = [];
      return;
    }
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

  /**
   * Navigates to the new scope creation form (`/admin/user/scope/new`).
   */
  newScope(): void {
    this._router.navigate(['/admin/user/scope/new']);
  }

  /**
   * Navigates to the edit form for the selected scope (`/admin/user/scope/edit/:scp_uuid`).
   *
   * @param scope Scope record to edit.
   */
  editScope(scope: ScopeInterface): void {
    this._router.navigate(['/admin/user/scope/edit', scope.scp_uuid]);
  }

  /**
   * Prompts for confirmation and deletes the selected scope via {@link ScopesService.deleteScope}.
   *
   * @param scope Scope record to delete.
   */
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
