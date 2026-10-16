import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

/**
 * Pantalla informativa (`<app-account-created>`) que se muestra tras el registro de un usuario
 * (`/auth/account-created/:usr_email`), indicando al usuario que revise la bandeja de entrada de su correo electrónico.
 */
@Component({
  selector: 'app-account-created',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzAlertModule
  ],
  templateUrl: './account-created.component.html',
  styleUrl: './account-created.component.scss'
})
export class AccountCreatedComponent implements OnInit {
  /** Dirección de correo electrónico registrada, extraída de los parámetros de la ruta. */
  usr_email: string = '';

  /**
   * Inicializa el componente con la ruta activa.
   *
   * @param _route Instantánea de la ruta activada que contiene `usr_email`.
   */
  constructor(private _route: ActivatedRoute) { }

  /**
   * Lee el parámetro `usr_email` desde la instantánea de la ruta durante la inicialización.
   */
  ngOnInit(): void {
    this.usr_email = this._route.snapshot.params['usr_email'] || '';
  }
}
