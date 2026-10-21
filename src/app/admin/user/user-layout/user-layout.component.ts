import { Component, OnInit, HostListener, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { SessionService } from '../../../core/services/session.service';

/**
 * Main authenticated workspace layout component (`<app-user-layout>`).
 *
 * @description Renders the collapsible desktop sidebar, responsive top header bar with contextual title and back navigation,
 * off-canvas mobile navigation drawer, thumb-friendly bottom navigation bar, and main `<router-outlet>` content container.
 */
@Component({
  selector: 'app-user-layout',
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzToolTipModule,
    NzDrawerModule,
    NavBarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  /** Indicates whether the desktop sidebar navigation is collapsed. */
  isCollapsed = false;
  /** Controls visibility of the mobile sliding navigation drawer. */
  isMobileDrawerVisible = false;
  /** Whether the current viewport matches mobile resolution (< 768px). */
  isMobile = false;

  /** Title of the active screen displayed in the mobile top bar. */
  currentTitle = 'Dashboard';
  /** Whether the active screen is a creation, detail or edit sub-view. */
  isDetailView = false;
  /** Parent route path used by the mobile back button to return to the parent list. */
  parentRoute = '/admin/user/dashboard';

  /** Display name of the currently authenticated user. */
  userName = 'Usuario';
  /** Email address of the currently authenticated user. */
  userEmail = '';

  /**
   * Initializes the user layout component.
   *
   * @param sessionService Service managing the active user session.
   * @param router Angular `Router` instance.
   */
  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  /**
   * Initializes session user data, responsive viewport detection, and navigation listener.
   */
  ngOnInit(): void {
    this.checkIsMobile();

    const identity = this.sessionService.getIdentity();
    if (identity) {
      this.userName = identity.usr_name || identity.usr_user || 'Usuario';
      this.userEmail = identity.usr_email || '';
    }

    this.updateRouteContext(this.router.url);

    // Auto-close mobile drawer and refresh title context on route changes
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateRouteContext(event.urlAfterRedirects || event.url);
        if (this.isMobileDrawerVisible) {
          this.isMobileDrawerVisible = false;
        }
      });
  }

  /**
   * Listens to viewport size changes to adapt between mobile drawer and desktop sidebar.
   */
  @HostListener('window:resize')
  onResize(): void {
    this.checkIsMobile();
  }

  /**
   * Checks whether the current window width is in the mobile breakpoint (< 768px).
   */
  private checkIsMobile(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile && this.isMobileDrawerVisible) {
        this.isMobileDrawerVisible = false;
      }
    }
  }

  /**
   * Updates contextual header title, detail view status, and parent route based on current URL path.
   * @param url Current route URL.
   */
  private updateRouteContext(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const isNew = cleanUrl.includes('/new');
    const isEdit = cleanUrl.includes('/edit');
    this.isDetailView = isNew || isEdit;

    if (cleanUrl.includes('/dashboard')) {
      this.currentTitle = 'Dashboard';
      this.parentRoute = '/admin/user/dashboard';
    } else if (cleanUrl.includes('/transaction')) {
      this.currentTitle = isNew ? 'Nuevo Movimiento' : (isEdit ? 'Editar Movimiento' : 'Movimientos');
      this.parentRoute = '/admin/user/transactions';
    } else if (cleanUrl.includes('/fixed-expenses')) {
      this.currentTitle = 'Gastos Fijos';
      this.parentRoute = '/admin/user/fixed-expenses';
    } else if (cleanUrl.includes('/seller-commissions')) {
      this.currentTitle = 'Mis Comisiones';
      this.parentRoute = '/admin/user/seller-commissions';
    } else if (cleanUrl.includes('/scope')) {
      this.currentTitle = isNew ? 'Nuevo Ámbito' : (isEdit ? 'Editar Ámbito' : 'Ámbitos');
      this.parentRoute = '/admin/user/scopes';
    } else if (cleanUrl.includes('/person')) {
      this.currentTitle = isNew ? 'Nuevo Contacto' : (isEdit ? 'Editar Contacto' : 'Contactos');
      this.parentRoute = '/admin/user/persons';
    } else if (cleanUrl.includes('/document')) {
      this.currentTitle = 'Documentos';
      this.parentRoute = '/admin/user/documents';
    } else if (cleanUrl.includes('/voucher-fee-status')) {
      this.currentTitle = isNew ? 'Nuevo Estado Cuota' : (isEdit ? 'Editar Estado Cuota' : 'Estados Cuotas');
      this.parentRoute = '/admin/user/vouchers-fee-status';
    } else if (cleanUrl.includes('/voucher-fee')) {
      this.currentTitle = isNew ? 'Nueva Cuota' : (isEdit ? 'Editar Cuota' : 'Cuotas Comprobantes');
      this.parentRoute = '/admin/user/vouchers-fees';
    } else if (cleanUrl.includes('/voucher-state')) {
      this.currentTitle = isNew ? 'Nuevo Estado' : (isEdit ? 'Editar Estado' : 'Estados Comprobantes');
      this.parentRoute = '/admin/user/vouchers-states';
    } else if (cleanUrl.includes('/voucher')) {
      this.currentTitle = isNew ? 'Nuevo Comprobante' : (isEdit ? 'Editar Comprobante' : 'Comprobantes');
      this.parentRoute = '/admin/user/vouchers';
    } else if (cleanUrl.includes('/payment-periods-status')) {
      this.currentTitle = isNew ? 'Nuevo Estado Pago' : (isEdit ? 'Editar Estado Pago' : 'Estados Pagos');
      this.parentRoute = '/admin/user/payment-periods-status';
    } else if (cleanUrl.includes('/payment-period')) {
      this.currentTitle = isNew ? 'Nuevo Pago' : (isEdit ? 'Editar Pago' : 'Pagos de Períodos');
      this.parentRoute = '/admin/user/payment-periods';
    } else if (cleanUrl.includes('/status-period')) {
      this.currentTitle = isNew ? 'Nuevo Estado' : (isEdit ? 'Editar Estado' : 'Estados de Períodos');
      this.parentRoute = '/admin/user/status-periods';
    } else if (cleanUrl.includes('/period')) {
      this.currentTitle = isNew ? 'Nuevo Período' : (isEdit ? 'Editar Período' : 'Períodos');
      this.parentRoute = '/admin/user/periods';
    } else if (cleanUrl.includes('/card')) {
      this.currentTitle = isNew ? 'Nueva Tarjeta' : (isEdit ? 'Editar Tarjeta' : 'Tarjetas');
      this.parentRoute = '/admin/user/cards';
    } else if (cleanUrl.includes('/bank')) {
      this.currentTitle = isNew ? 'Nuevo Banco' : (isEdit ? 'Editar Banco' : 'Bancos');
      this.parentRoute = '/admin/user/banks';
    } else if (cleanUrl.includes('/brand-card')) {
      this.currentTitle = isNew ? 'Nueva Marca' : (isEdit ? 'Editar Marca' : 'Marcas de Tarjetas');
      this.parentRoute = '/admin/user/brand-cards';
    } else if (cleanUrl.includes('/type-card')) {
      this.currentTitle = isNew ? 'Nuevo Tipo' : (isEdit ? 'Editar Tipo' : 'Tipos de Tarjetas');
      this.parentRoute = '/admin/user/type-cards';
    } else if (cleanUrl.includes('/type-operation')) {
      this.currentTitle = isNew ? 'Nueva Operación' : (isEdit ? 'Editar Operación' : 'Tipos de Operaciones');
      this.parentRoute = '/admin/user/type-operations';
    } else if (cleanUrl.includes('/payment-method')) {
      this.currentTitle = isNew ? 'Nuevo Método' : (isEdit ? 'Editar Método' : 'Métodos de Pago');
      this.parentRoute = '/admin/user/payment-methods';
    } else {
      this.currentTitle = 'ATS Management';
      this.parentRoute = '/admin/user/dashboard';
    }
  }

  /**
   * Toggles the mobile drawer when on mobile, or desktop sidebar collapse state otherwise.
   */
  toggleSidebar(): void {
    if (this.isMobile) {
      this.isMobileDrawerVisible = !this.isMobileDrawerVisible;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  /**
   * Opens the mobile navigation drawer (e.g. from bottom bar "Más" tab).
   */
  openMobileDrawer(): void {
    this.isMobileDrawerVisible = true;
  }

  /**
   * Closes the mobile navigation drawer.
   */
  closeMobileDrawer(): void {
    this.isMobileDrawerVisible = false;
  }

  /**
   * Navigates back to the parent route when the mobile back button is pressed.
   */
  goBack(): void {
    if (this.parentRoute) {
      this.router.navigateByUrl(this.parentRoute);
    } else {
      this.router.navigate(['/admin/user/dashboard']);
    }
  }

  /**
   * Clears the active session and redirects the user to `/auth/login`.
   */
  logout(): void {
    this.sessionService.logout();
    this.router.navigate(['/auth/login']);
  }
}
