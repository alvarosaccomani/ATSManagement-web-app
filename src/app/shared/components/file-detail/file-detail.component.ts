import { Component, Inject } from '@angular/core';
import { NZ_DRAWER_DATA } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-file-detail',
  imports: [
    NzIconModule,
    NzButtonModule
  ],
  templateUrl: './file-detail.component.html',
  styleUrl: './file-detail.component.scss'
})
export class FileDetailComponent {

  constructor(
    @Inject(NZ_DRAWER_DATA) public drawerData: any
  ) { }
}
