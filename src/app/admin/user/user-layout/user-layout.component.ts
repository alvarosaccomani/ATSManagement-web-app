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
 * @description Renders the collapsible sidebar navigation (`<app-nav-bar>`), top header bar
 * with user profile info and logout button, mobile overlay drawer, and the main `<router-outlet>` content area.
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

    // Auto-close mobile drawer whenever a navigation event finishes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
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
   * Checks whether the current window width is in the mobile breakpoint.
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
   * Closes the mobile navigation drawer.
   */
  closeMobileDrawer(): void {
    this.isMobileDrawerVisible = false;
  }

  /**
   * Clears the active session and redirects the user to `/auth/login`.
   */
  logout(): void {
    this.sessionService.logout();
    this.router.navigate(['/auth/login']);
  }
}

