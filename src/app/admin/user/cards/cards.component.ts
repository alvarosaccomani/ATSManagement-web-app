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
import { CardInterface } from '../../../core/interfaces/card.interface';

@Component({
  selector: 'app-cards',
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
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss'
})
export class CardsComponent implements OnInit {
  cards: CardInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'crd_uuid', title: 'ID', width: '80px' },
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
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.cards = [
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          crd_maskedcardnumber: "8936",
          crd_last4digits: "8936",
          tycrd_uuid: "1",
          tycrd: {
            tycrd_uuid: "1",
            tycrd_name: "Debito",
            tycrd_description: "Debito",
            tycrd_createdat: "2026-02-07T20:17:58.901Z",
            tycrd_updatedat: "2026-02-07T20:17:58.901Z"
          },
          brcrd_uuid: "1",
          brcrd: {
            brcrd_uuid: "1",
            brcrd_name: "Visa",
            brcrd_description: "Visa",
            brcrd_createdat: "2026-02-07T23:40:29.008Z",
            brcrd_updatedat: "2026-02-07T23:40:29.008Z"
          },
          ban_uuid: "1",
          ban: {
            ban_uuid: "1",
            ban_name: "Provincia",
            ban_description: "Banco Provincia",
            ban_createdat: "2026-02-07T19:51:54.812Z",
            ban_updatedat: "2026-02-07T19:51:54.812Z"
          },
          crd_expirationdate: "2026-01-01",
          crd_creditlimit: null,
          crd_active: true,
          crd_createdat: "2026-02-08T11:34:36-03:00",
          crd_updatedat: "2026-02-08T11:34:36-03:00"
        },
        {
          usr_uuid: "8b178d01-c06c-56e2-9f18-02c689f3e65e",
          crd_uuid: "2",
          crd_maskedcardnumber: "5421",
          crd_last4digits: "5421",
          tycrd_uuid: "2",
          tycrd: {
            tycrd_uuid: "2",
            tycrd_name: "Credito",
            tycrd_description: "Credito",
            tycrd_createdat: "2026-02-07T20:18:30.000Z",
            tycrd_updatedat: "2026-02-07T20:18:30.000Z"
          },
          brcrd_uuid: "2",
          brcrd: {
            brcrd_uuid: "2",
            brcrd_name: "Mastercard",
            brcrd_description: "Mastercard",
            brcrd_createdat: "2026-02-07T23:41:15.000Z",
            brcrd_updatedat: "2026-02-07T23:41:15.000Z"
          },
          ban_uuid: "2",
          ban: {
            ban_uuid: "2",
            ban_name: "Nación",
            ban_description: "Banco Nación",
            ban_createdat: "2026-02-07T19:52:30.000Z",
            ban_updatedat: "2026-02-07T19:52:30.000Z"
          },
          crd_expirationdate: "2027-06-30",
          crd_creditlimit: 500000,
          crd_active: true,
          crd_createdat: "2026-02-08T12:15:22-03:00",
          crd_updatedat: "2026-02-08T12:15:22-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          crd_maskedcardnumber: "7890",
          crd_last4digits: "7890",
          tycrd_uuid: "2",
          tycrd: {
            tycrd_uuid: "2",
            tycrd_name: "Credito",
            tycrd_description: "Credito",
            tycrd_createdat: "2026-02-07T20:18:30.000Z",
            tycrd_updatedat: "2026-02-07T20:18:30.000Z"
          },
          brcrd_uuid: "1",
          brcrd: {
            brcrd_uuid: "1",
            brcrd_name: "Visa",
            brcrd_description: "Visa",
            brcrd_createdat: "2026-02-07T23:40:29.008Z",
            brcrd_updatedat: "2026-02-07T23:40:29.008Z"
          },
          ban_uuid: "3",
          ban: {
            ban_uuid: "3",
            ban_name: "Galicia",
            ban_description: "Banco Galicia",
            ban_createdat: "2026-02-07T19:53:15.000Z",
            ban_updatedat: "2026-02-07T19:53:15.000Z"
          },
          crd_expirationdate: "2025-12-31",
          crd_creditlimit: 300000,
          crd_active: false,
          crd_createdat: "2026-02-08T13:45:10-03:00",
          crd_updatedat: "2026-02-08T14:20:45-03:00"
        },
        {
          usr_uuid: "0d390f23-e28e-78g4-1h30-24e801h5g87g",
          crd_uuid: "4",
          crd_maskedcardnumber: "3214",
          crd_last4digits: "3214",
          tycrd_uuid: "3",
          tycrd: {
            tycrd_uuid: "3",
            tycrd_name: "Prepaga",
            tycrd_description: "Prepaga",
            tycrd_createdat: "2026-02-07T20:19:45.000Z",
            tycrd_updatedat: "2026-02-07T20:19:45.000Z"
          },
          brcrd_uuid: "3",
          brcrd: {
            brcrd_uuid: "3",
            brcrd_name: "American Express",
            brcrd_description: "American Express",
            brcrd_createdat: "2026-02-07T23:42:00.000Z",
            brcrd_updatedat: "2026-02-07T23:42:00.000Z"
          },
          ban_uuid: "1",
          ban: {
            ban_uuid: "1",
            ban_name: "Provincia",
            ban_description: "Banco Provincia",
            ban_createdat: "2026-02-07T19:51:54.812Z",
            ban_updatedat: "2026-02-07T19:51:54.812Z"
          },
          crd_expirationdate: "2028-03-31",
          crd_creditlimit: 100000,
          crd_active: true,
          crd_createdat: "2026-02-08T15:30:00-03:00",
          crd_updatedat: "2026-02-08T15:30:00-03:00"
        }
      ];
      
      this.total = this.cards.length;
      this.loading = false;
    }, 800);
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
    this.message.success(`Tarjeta eliminada: ${this.formatCardNumber(card.crd_last4digits)}`);
    this.cards = this.cards.filter(c => c.crd_uuid !== card.crd_uuid);
    this.total = this.cards.length;
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