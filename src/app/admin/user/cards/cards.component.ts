import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CardInterface } from '../../../core/interfaces/card';
import { CardsService } from '../../../core/services/cards.service';
import { ScopesService } from '../../../core/services/scopes.service';
import { ScopeInterface } from '../../../core/interfaces/scope.interface';
import { MessageService } from '../../../core/services/message.service';

import { SessionService } from '../../../core/services/session.service';

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
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzTagModule,
    NzSelectModule,
    NzAlertModule,
    NzToolTipModule
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
    { key: 'card_number', title: 'Cuenta / Tarjeta', width: '170px' },
    { key: 'card_type', title: 'Tipo', width: '120px' },
    { key: 'card_brand', title: 'Marca', width: '100px' },
    { key: 'bank', title: 'Banco / Entidad', width: '140px' },
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
    private _sessionService: SessionService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Obtiene el identificador del usuario autenticado actual.
   * @returns UUID del usuario autenticado.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Indica si el usuario cuenta con ámbitos contables configurados o asignados.
   */
  get hasScopes(): boolean {
    return this.scopes.filter(s => s.scp_uuid !== 'ALL').length > 0;
  }

  /**
   * Inicializa el componente y carga los catálogos y registros iniciales.
   */
  ngOnInit(): void {
    this.loadScopes();
    this.loadCards();
  }

  /**
   * Carga los ámbitos del usuario y antepone la opción de filtro 'ALL'.
   */
  loadScopes(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.scopes = [];
      this.cards = [];
      return;
    }
    this._scopesService.getScopes(usr_uuid).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const allOption: ScopeInterface = {
            scp_uuid: 'ALL',
            scp_name: 'Todos los ámbitos',
            scp_isshared: false,
            usr_uuidowner: usr_uuid,
            scp_active: true,
            scp_color: '#108ee9'
          };
          this.scopes = [allOption, ...response.data];
        } else {
          this.scopes = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar ámbitos en tarjetas:', err);
        this.scopes = [];
      }
    });
  }

  /**
   * Recarga los registros cuando cambia el filtro de ámbito seleccionado.
   * @param scopeUuid UUID del ámbito seleccionado o 'ALL'.
   */
  onScopeChange(scopeUuid: string): void {
    this.selectedScopeUuid = scopeUuid;
    this.loadCards();
  }

  /**
   * Obtiene las cuentas y tarjetas del usuario para el ámbito activo.
   */
  loadCards(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) return;
    this.loading = true;
    this._cardsService.getCards(usr_uuid, undefined, undefined, undefined, undefined, this.selectedScopeUuid).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.cards = response.data;
          this.total = this.cards.length;
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error(error);
      }
    });
  }

  /**
   * Formatea los últimos 4 dígitos en una representación enmascarada.
   * @param last4 Últimos 4 dígitos de la tarjeta.
   * @returns Cadena con el número enmascarado o cadena vacía si no aplica.
   */
  formatCardNumber(last4?: string | null): string {
    if (!last4) return '';
    return `**** **** **** ${last4}`;
  }

  /**
   * Formatea una cadena de fecha de vencimiento ISO al formato MM/YY.
   * @param dateString Cadena de fecha ISO.
   * @returns Cadena de vencimiento formateada o guion si no aplica.
   */
  formatExpirationDate(dateString?: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  }

  /**
   * Comprueba si la fecha de vencimiento ya ha pasado.
   * @param dateString Cadena de fecha de vencimiento ISO.
   * @returns true si venció, false en caso contrario.
   */
  isExpired(dateString?: string | null): boolean {
    if (!dateString) return false;
    const expirationDate = new Date(dateString);
    if (isNaN(expirationDate.getTime())) return false;
    const today = new Date();
    return expirationDate < today;
  }

  /**
   * Formatea un límite de crédito numérico en moneda ARS.
   * @param limit Monto del límite de crédito.
   * @returns Cadena formateada o N/A.
   */
  formatCreditLimit(limit?: number | null): string {
    if (limit === null || limit === undefined) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(limit);
  }

  /**
   * Asigna el tipo de cuenta o tarjeta a un color de etiqueta de Ng-Zorro.
   * @param typeName Nombre del tipo.
   * @returns Color de la etiqueta.
   */
  getCardTypeColor(typeName?: string): string {
    if (!typeName) return 'default';
    const lower = typeName.toLowerCase();
    if (lower.includes('efectivo')) return 'gold';
    if (lower.includes('caja de ahorro')) return 'cyan';
    if (lower.includes('cuenta corriente')) return 'geekblue';
    if (lower.includes('billetera')) return 'purple';
    if (lower.includes('debito') || lower.includes('débito')) return 'blue';
    if (lower.includes('credito') || lower.includes('crédito')) return 'green';
    if (lower.includes('prepaga')) return 'orange';
    return 'default';
  }

  /**
   * Asigna la marca de la tarjeta a un color de etiqueta de Ng-Zorro.
   * @param brandName Nombre de la marca.
   * @returns Color de la etiqueta.
   */
  getCardBrandColor(brandName?: string): string {
    if (!brandName) return 'default';
    switch (brandName.toLowerCase()) {
      case 'visa': return 'cyan';
      case 'mastercard': return 'purple';
      case 'american express': return 'volcano';
      default: return 'default';
    }
  }

  /**
   * Navega a la ruta de creación de nueva cuenta o tarjeta.
   */
  createCard(): void {
    if (!this.hasScopes) {
      this._messageService.error('Ámbito Requerido', 'Debes configurar o tener asignado al menos un ámbito contable antes de crear una cuenta o tarjeta.');
      return;
    }
    this._router.navigate(['/admin/user/card/new']);
  }

  /**
   * Navega a la ruta de edición del registro seleccionado.
   * @param card Registro a editar.
   */
  editCard(card: CardInterface): void {
    this._router.navigate(['/admin/user/card/edit', card.crd_uuid]);
  }

  /**
   * Solicita confirmación y elimina el registro seleccionado.
   * @param card Registro a eliminar.
   */
  deleteCard(card: CardInterface): void {
    const label = card.crd_alias || (card.crd_last4digits ? `la tarjeta finalizada en ${card.crd_last4digits}` : 'este registro');
    this._messageService.confirm(
      '¿Estás seguro de eliminar?',
      `Vas a eliminar ${label}. Esta acción no se puede deshacer.`,
      () => {
        const usr_uuid = this.currentUserId;
        if (!usr_uuid) return;
        this.loading = true;
        this._cardsService.deleteCard(usr_uuid, card.crd_uuid).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this._messageService.success('Eliminado', 'El registro se eliminó correctamente');
              this.loadCards();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar');
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema de conexión al eliminar');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación con el detalle identificador de la cuenta o tarjeta.
   * @param card Registro a inspeccionar.
   */
  viewDetails(card: CardInterface): void {
    const detail = card.crd_alias || this.formatCardNumber(card.crd_last4digits) || card.crd_cbualias || 'Detalles de cuenta';
    this.message.info(`Detalles: ${detail}`);
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