import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

/**
 * Componente de menú de navegación lateral (`<app-nav-bar>`).
 *
 * @description Renderiza los enlaces de navegación principales para el espacio de trabajo del usuario, incluyendo
 * Panel de Control, Flujo de Caja, Ámbitos, Contactos, Comisiones, Documentos/OCR, Tarjetas, Comprobantes y Catálogos Paramétricos.
 */
@Component({
  selector: 'app-nav-bar',
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    NzMenuModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  /** Controla si el menú lateral se muestra en modo contraído (solo iconos). */
  @Input() isCollapsed = false;
}
