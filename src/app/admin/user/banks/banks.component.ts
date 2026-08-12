import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BankInterface } from '../../../core/interfaces/bank';
import { BanksService } from '../../../core/services/banks.service';
import { MessageService } from '../../../core/services/message.service';

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
    private _banksService: BanksService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    this.loading = true;
    this._banksService.getBanks('7a067c90-bf5b-45d1-8f07-91b578e2d54d').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.banks = response.data;
          this.total = this.banks.length;
          this.loading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  createBank(): void {
    this._router.navigate(['/admin/user/bank/new']);
  }

  editBank(bank: BankInterface): void {
    this._router.navigate(['/admin/user/bank/edit', bank.ban_uuid]);
  }

  deleteBank(bank: BankInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este banco?',
      `Estás a punto de eliminar el banco "${bank.ban_name}". Esta acción no se puede deshacer.`,
      () => {
        this._banksService.deleteBank(bank.usr_uuid!, bank.ban_uuid!)
          .subscribe({
            next: response => {
              console.info(response);
              this.loadBanks();
              this._messageService.success('Banco eliminado', `El banco "${bank.ban_name}" se eliminó correctamente`);
            },
            error: error => {
              console.error(error);
              this._messageService.error('Error', 'Error al intentar eliminar el banco');
            }
          });
      }
    );
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