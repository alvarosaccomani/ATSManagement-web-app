import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BankInterface } from '../../../core/interfaces/bank.interface';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.scss'
})
export class BanksComponent implements OnInit {
  banks: BankInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'ban_uuid', title: 'ID', width: '100px' },
    { key: 'ban_name', title: 'Nombre', width: '150px' },
    { key: 'ban_description', title: 'Descripción', width: '200px' },
    { key: 'ban_createdat', title: 'Creado', width: '180px' },
    { key: 'ban_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.banks = [
        {
          ban_uuid: "1",
          ban_name: "Provincia",
          ban_description: "Banco Provincia",
          ban_createdat: "2026-02-07T16:51:54-03:00",
          ban_updatedat: "2026-02-07T16:51:54-03:00"
        },
        {
          ban_uuid: "2",
          ban_name: "Nación",
          ban_description: "Banco Nación",
          ban_createdat: "2026-02-06T10:30:00-03:00",
          ban_updatedat: "2026-02-07T14:20:00-03:00"
        },
        {
          ban_uuid: "3",
          ban_name: "Galicia",
          ban_description: "Banco Galicia",
          ban_createdat: "2026-02-05T09:15:00-03:00",
          ban_updatedat: "2026-02-07T11:45:00-03:00"
        }
      ];
      
      this.total = this.banks.length;
      this.loading = false;
    }, 800);
  }

  createBank(): void {
    this._router.navigate(['/admin/user/bank/new']);
  }

  editBank(bank: BankInterface): void {
    this._router.navigate(['/admin/user/bank/edit', bank.ban_uuid]);
  }

  deleteBank(bank: BankInterface): void {
    this.message.success(`Banco eliminado: ${bank.ban_name}`);
    this.banks = this.banks.filter(b => b.ban_uuid !== bank.ban_uuid);
    this.total = this.banks.length;
  }

  viewDetails(bank: BankInterface): void {
    this.message.info(`Detalles de: ${bank.ban_name}`);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadBanks();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadBanks();
  }
}