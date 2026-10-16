import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BrandCardInterface } from '../../../core/interfaces/brand-card';
import { BrandCardsService } from '../../../core/services/brand-cards.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente para listar y gestionar registros de marcas de tarjeta.
 * @description Muestra una tabla paginada de marcas de tarjeta con acciones de creación, edición y eliminación.
 */
@Component({
  selector: 'app-brand-cards',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './brand-cards.component.html',
  styleUrl: './brand-cards.component.scss'
})
export class BrandCardsComponent implements OnInit {
  /** Arreglo de registros de marcas de tarjeta cargados. */
  brandCards: BrandCardInterface[] = [];
  /** Indicador de si los datos de la tabla se están cargando. */
  loading = false;
  /** Índice de la página actual (basado en 1). */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de marcas de tarjeta. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
  listOfColumns = [
    { key: 'brcrd_uuid', title: 'ID', width: '100px' },
    { key: 'brcrd_name', title: 'Nombre', width: '150px' },
    { key: 'brcrd_description', title: 'Descripción', width: '200px' },
    { key: 'brcrd_createdat', title: 'Creado', width: '180px' },
    { key: 'brcrd_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Inicializa el componente BrandCardsComponent.
   * @param _router Servicio Router de Angular.
   * @param _brandCardsService Servicio para operaciones CRUD de marcas de tarjeta.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private _router: Router,
    private _brandCardsService: BrandCardsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.loadBrandCards();
  }

  /**
   * Carga la lista de marcas de tarjeta desde el servicio de backend.
   * @returns void
   */
  loadBrandCards(): void {
    this.loading = true;
    this._brandCardsService.getBrandCards().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.brandCards = response.data;
          this.total = this.brandCards.length;
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
   * Navega al formulario de creación de marca de tarjeta.
   * @returns void
   */
  createBrandCard(): void {
    this._router.navigate(['/admin/user/brand-card/new']);
  }

  /**
   * Navega al formulario de edición de marca de tarjeta.
   * @param brandCard Registro de marca de tarjeta a editar.
   * @returns void
   */
  editBrandCard(brandCard: BrandCardInterface): void {
    this._router.navigate(['/admin/user/brand-card/edit', brandCard.brcrd_uuid]);
  }

  /**
   * Solicita confirmación y elimina un registro de marca de tarjeta.
   * @param brandCard Registro de marca de tarjeta a eliminar.
   * @returns void
   */
  deleteBrandCard(brandCard: BrandCardInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar esta marca?',
      `Estás a punto de eliminar la marca "${brandCard.brcrd_name}". Esta acción no se puede deshacer.`,
      () => {
        this._brandCardsService.deleteBrandCard(brandCard.brcrd_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Marca eliminada', `La marca de tarjeta "${brandCard.brcrd_name}" se eliminó correctamente`);
              this.loadBrandCards();
            } else {
              this._messageService.error('Error', response.message || 'Error al eliminar la marca');
            }
          },
          error: (error: any) => {
            console.error(error);
            this._messageService.error('Error', 'Error de conexión al intentar eliminar la marca');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación emergente con los detalles de la marca de tarjeta.
   * @param brandCard Registro de marca de tarjeta a inspeccionar.
   * @returns void
   */
  viewDetails(brandCard: BrandCardInterface): void {
    this.message.info(`Nombre: ${brandCard.brcrd_name}\nDescripción: ${brandCard.brcrd_description || 'Sin descripción'}`);
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   * @param size Nuevo tamaño de página.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadBrandCards();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   * @param index Nuevo índice de página.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadBrandCards();
  }
}