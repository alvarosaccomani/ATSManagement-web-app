import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Componente contenedor de diseño (`<app-auth-layout>`) para las rutas públicas de autenticación (`/auth/*`).
 */
@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterModule
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {

}
