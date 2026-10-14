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
  cards: CardInterface[] = [];
  scopes: ScopeInterface[] = [];
  selectedScopeUuid: string = 'ALL';
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

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

  constructor(
    private _router: Router,
    private _cardsService: CardsService,
    private _scopesService: ScopesService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadScopes();
    this.loadCards();
  }

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

  onScopeChange(scopeUuid: string): void {
    this.selectedScopeUuid = scopeUuid;
    this.loadCards();
  }

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

  // Formatear número de tarjeta enmascarado
  formatCardNumber(last4: string): string {
    return `**** **** **** ${last4}`;
  }

  // Formatear fecha de vencimiento
  formatExpirationDate(dateString: string): string {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  }

  // Verificar si está vencida
  isExpired(dateString: string): boolean {
    const expirationDate = new Date(dateString);
    const today = new Date();
    return expirationDate < today;
  }

  // Formatear límite de crédito
  formatCreditLimit(limit: number | null): string {
    if (limit === null) return 'N/A';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(limit);
  }

  // Obtener color del tag según el tipo de tarjeta
  getCardTypeColor(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'debito': return 'blue';
      case 'credito': return 'green';
      case 'prepaga': return 'orange';
      default: return 'default';
    }
  }

  // Obtener color del tag según la marca
  getCardBrandColor(brandName: string): string {
    switch (brandName.toLowerCase()) {
      case 'visa': return 'cyan';
      case 'mastercard': return 'purple';
      case 'american express': return 'volcano';
      default: return 'default';
    }
  }

  // Métodos de acción
  createCard(): void {
    this._router.navigate(['/admin/user/card/new']);
  }

  editCard(card: CardInterface): void {
    this._router.navigate(['/admin/user/card/edit', card.crd_uuid]);
  }

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

  viewDetails(card: CardInterface): void {
    this.message.info(`Detalles de tarjeta: ${this.formatCardNumber(card.crd_last4digits)}`);
  }

  toggleCardStatus(card: CardInterface): void {
    card.crd_active = !card.crd_active;
    const status = card.crd_active ? 'activada' : 'desactivada';
    this.message.success(`Tarjeta ${status} correctamente`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadCards();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadCards();
  }
}