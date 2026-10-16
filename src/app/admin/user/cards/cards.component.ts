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
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CardInterface } from '../../../core/interfaces/card';
import { CardsService } from '../../../core/services/cards.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente de lista (`<app-cards>`) para visualizar y gestionar tarjetas de crédito y débito en `/admin/user/cards`.
 *
 * @description Muestra las tarjetas filtradas por ámbito con números de tarjeta enmascarados (`**** **** **** 1234`),
 * alertas de estado de vencimiento (`isExpired`), límites de crédito formateados y acciones CRUD.
 */
@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzTagModule,
    NzSelectModule
  ],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss'
})
export class CardsComponent implements OnInit {
  /** Arreglo de registros de tarjetas mostrados en la tabla. */
  cards: CardInterface[] = [];
  /** Ámbitos disponibles para el menú desplegable de filtro. */
  scopes: ScopeInterface[] = [];
  /** Filtro de ámbito seleccionado actualmente (`'ALL'` por defecto). */
  selectedScopeUuid: string = 'ALL';
  /** Indica si los registros de tarjetas se están cargando actualmente. */
  loading = false;
  /** Índice de la página actual de la tabla. */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de tarjetas. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
  listOfColumns = [
    { key: 'crd_uuid', title: 'ID', width: '80px' },
    { key: 'scope', title: 'Ámbito', width: '130px' },
    { key: 'card_number', title: 'Tarjeta', width: '160px' },
    { key: 'card_type', title: 'Tipo', width: '110px' },
    { key: 'card_brand', title: 'Marca', width: '110px' },
    { key: 'bank', title: 'Banco', width: '140px' },
    { key: 'expiration', title: 'Vencimiento', width: '110px' },
    { key: 'credit_limit', title: 'Límite', width: '120px' },
    { key: 'status', title: 'Estado', width: '100px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Inicializa el componente de lista de tarjetas.
   *
   * @param _router Instancia de `Router` de Angular.
   * @param _cardsService Servicio para consultar y eliminar tarjetas.
   * @param _scopesService Servicio para consultar los ámbitos del usuario.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio de confirmación modal.
   */
  constructor(
    private _router: Router,
    private _cardsService: CardsService,
    private _scopesService: ScopesService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Carga los ámbitos y las tarjetas al inicializar el componente.
   */
  ngOnInit(): void {
    this.loadScopes();
    this.loadCards();
  }

  /**
   * Carga los ámbitos del usuario y antepone la opción de filtro `'ALL'`.
   */
  loadScopes(): void {
    const usr_uuid = '7a067c90-bf5b-45d1-8f07-91b578e2d54d';
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          const allOption: ScopeInterface = {
            scp_uuid: 'ALL',
            scp_name: 'Todos los ámbitos',
            scp_isshared: false,
            usr_uuidowner: usr_uuid,
            scp_active: true,
            scp_color: '#108ee9'
          };
          this.scopes = [allOption, ...response.data];
        }
      }
    });
  }

  /**
   * Recarga las tarjetas cuando cambia el filtro de ámbito seleccionado.
   *
   * @param scopeUuid UUID del ámbito seleccionado o `'ALL'`.
   */
  onScopeChange(scopeUuid: string): void {
    this.selectedScopeUuid = scopeUuid;
    this.loadCards();
  }

  /**
   * Obtiene las tarjetas del usuario y del filtro de ámbito activo desde {@link CardsService}.
   */
  loadCards(): void {
    this.loading = true;
    this._cardsService.getCards('7a067c90-bf5b-45d1-8f07-91b578e2d54d', undefined, undefined, undefined, undefined, this.selectedScopeUuid).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.cards = response.data;
          this.total = this.cards.length;
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      (error: any) => {
        this.loading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);
      }
    )
  }

  /**
   * Formatea los últimos 4 dígitos de una tarjeta en una representación enmascarada (`**** **** **** 1234`).
   *
   * @param last4 Últimos 4 dígitos de la tarjeta.
   * @returns Cadena con el número de tarjeta enmascarado.
   */
  formatCardNumber(last4: string): string {
    return `**** **** **** ${last4}`;
  }

  /**
   * Formatea una cadena de fecha de vencimiento ISO en el formato `MM/YY`.
   *
   * @param dateString Cadena de fecha ISO.
   * @returns Cadena de vencimiento formateada en `MM/YY`.
   */
  formatExpirationDate(dateString: string): string {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  }

  /**
   * Comprueba si la fecha de vencimiento indicada ya ha pasado.
   *
   * @param dateString Cadena de fecha de vencimiento ISO.
   * @returns `true` si la tarjeta ha vencido, `false` en caso contrario.
   */
  isExpired(dateString: string): boolean {
    const expirationDate = new Date(dateString);
    const today = new Date();
    return expirationDate < today;
  }

  /**
   * Formatea un límite de crédito numérico en moneda `ARS` o devuelve `'N/A'` si es `null`.
   *
   * @param limit Monto del límite de crédito o `null`.
   * @returns Cadena de moneda formateada o `'N/A'`.
   */
  formatCreditLimit(limit: number | null): string {
    if (limit === null) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(limit);
  }

  /**
   * Asigna el nombre de un tipo de tarjeta a un color de etiqueta de Ng-Zorro.
   *
   * @param typeName Nombre del tipo de tarjeta.
   * @returns Cadena con el color de la etiqueta.
   */
  getCardTypeColor(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'debito': return 'blue';
      case 'credito': return 'green';
      case 'prepaga': return 'orange';
      default: return 'default';
    }
  }

  /**
   * Asigna el nombre de una marca de tarjeta a un color de etiqueta de Ng-Zorro.
   *
   * @param brandName Nombre de la marca de tarjeta.
   * @returns Cadena con el color de la etiqueta.
   */
  getCardBrandColor(brandName: string): string {
    switch (brandName.toLowerCase()) {
      case 'visa': return 'cyan';
      case 'mastercard': return 'purple';
      case 'american express': return 'volcano';
      default: return 'default';
    }
  }

  /**
   * Navega al formulario de nueva tarjeta (`/admin/user/card/new`).
   */
  createCard(): void {
    this._router.navigate(['/admin/user/card/new']);
  }

  /**
   * Navega al formulario de edición para la tarjeta seleccionada (`/admin/user/card/edit/:crd_uuid`).
   *
   * @param card Registro de tarjeta a editar.
   */
  editCard(card: CardInterface): void {
    this._router.navigate(['/admin/user/card/edit', card.crd_uuid]);
  }

  /**
   * Solicita confirmación y elimina el registro de la tarjeta seleccionada.
   *
   * @param card Registro de tarjeta a eliminar.
   */
  deleteCard(card: CardInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar esta tarjeta?',
      `Vas a eliminar la tarjeta finalizada en ${card.crd_last4digits}. Esta acción no se puede deshacer.`,
      () => {
        this.loading = true;
        this._cardsService.deleteCard('7a067c90-bf5b-45d1-8f07-91b578e2d54d', card.crd_uuid).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this._messageService.success('Tarjeta eliminada', 'La tarjeta se eliminó correctamente');
              this.loadCards();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar la tarjeta');
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema de conexión al eliminar la tarjeta');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación emergente informativa con el número de tarjeta enmascarado.
   *
   * @param card Registro de tarjeta a inspeccionar.
   */
  viewDetails(card: CardInterface): void {
    this.message.info(`Detalles de tarjeta: ${this.formatCardNumber(card.crd_last4digits)}`);
  }

  /**
   * Alterna localmente el estado activo (`crd_active`) de una tarjeta y muestra una notificación de confirmación.
   *
   * @param card Registro de tarjeta a alternar.
   */
  toggleCardStatus(card: CardInterface): void {
    card.crd_active = !card.crd_active;
    const status = card.crd_active ? 'activada' : 'desactivada';
    this.message.success(`Tarjeta ${status} correctamente`);
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   *
   * @param size Nueva cantidad de elementos por página.
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadCards();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   *
   * @param index Nuevo índice de página.
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadCards();
  }
}