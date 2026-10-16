import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { SessionService } from '../../../core/services/session.service';

/**
 * Main authenticated workspace layout component (`<app-user-layout>`).
 *
 * @description Renders the collapsible sidebar navigation (`<app-nav-bar>`), top header bar
 * with user profile info and logout button, and the main `<router-outlet>` content area.
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
    NavBarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent implements OnInit {
  /** Indicates whether the sidebar navigation is collapsed. */
  isCollapsed = false;
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
   * Loads the authenticated user's display name and email from {@link SessionService}.
   */
  ngOnInit(): void {
    const identity = this.sessionService.getIdentity();
    if (identity) {
      this.userName = identity.usr_name || identity.usr_user || 'Usuario';
      this.userEmail = identity.usr_email || '';
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
