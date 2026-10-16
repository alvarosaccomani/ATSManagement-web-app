import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz de la aplicación.
 * @description Aloja el `router-outlet` de nivel superior de Angular para la aplicación web ATS Management.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** Identificador del título de la aplicación. */
  title = 'ATSManagement-web-app';
}
