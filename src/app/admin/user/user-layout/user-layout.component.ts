import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-user-layout',
  imports: [
    RouterModule,
    NavBarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

}
