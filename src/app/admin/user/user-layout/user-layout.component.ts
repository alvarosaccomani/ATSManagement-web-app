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
  isCollapsed = false;
  userName = 'Usuario';
  userEmail = '';

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const identity = this.sessionService.getIdentity();
    if (identity) {
      this.userName = identity.usr_name || identity.usr_user || 'Usuario';
      this.userEmail = identity.usr_email || '';
    }
  }

  logout(): void {
    this.sessionService.logout();
    this.router.navigate(['/auth/login']);
  }
}
