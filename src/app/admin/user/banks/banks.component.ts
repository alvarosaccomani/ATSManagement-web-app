import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BankInterface } from '../../../core/interfaces/bank';
import { BanksService } from '../../../core/services/banks.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente para listar y gestionar registros de bancos.
 * @description Muestra una tabla paginada de bancos con acciones de creación, edición y eliminación.
 */
@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzTagModule
  ],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.scss'
})
export class BanksComponent implements OnInit {
  /** Arreglo de registros de bancos cargados. */
  banks: BankInterface[] = [];
  /** Indicador de si los datos de la tabla se están cargando. */
  loading = false;
  /** Índice de la página actual (basado en 1). */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de bancos. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
  listOfColumns = [
    { key: 'ban_uuid', title: 'ID', width: '100px' },
    { key: 'ban_name', title: 'Nombre', width: '150px' },
    { key: 'ban_description', title: 'Descripción', width: '200px' },
    { key: 'ban_createdat', title: 'Creado', width: '180px' },
    { key: 'ban_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Inicializa el componente BanksComponent.
   * @param _router Servicio Router de Angular.
   * @param _banksService Servicio para operaciones CRUD de bancos.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private _router: Router,
    private _banksService: BanksService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.loadBanks();
  }

  /**
   * Carga la lista de bancos desde el servicio de backend.
   * @returns void
   */
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

  /**
   * Navega al formulario de creación de banco.
   * @returns void
   */
  createBank(): void {
    this._router.navigate(['/admin/user/bank/new']);
  }

  /**
   * Navega al formulario de edición de banco.
   * @param bank Registro de banco a editar.
   * @returns void
   */
  editBank(bank: BankInterface): void {
    this._router.navigate(['/admin/user/bank/edit', bank.ban_uuid]);
  }

  /**
   * Solicita confirmación y elimina un registro de banco.
   * @param bank Registro de banco a eliminar.
   * @returns void
   */
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

  /**
   * Muestra una notificación emergente con los detalles del banco.
   * @param bank Registro de banco a inspeccionar.
   * @returns void
   */
  viewDetails(bank: BankInterface): void {
    this.message.info(`Detalles de: ${bank.ban_name}`);
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   * @param size Nuevo tamaño de página.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadBanks();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   * @param index Nuevo índice de página.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadBanks();
  }
}