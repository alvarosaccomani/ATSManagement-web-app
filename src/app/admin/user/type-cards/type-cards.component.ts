import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TypeCardInterface } from '../../../core/interfaces/type-card.interface';

@Component({
  selector: 'app-type-cards',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './type-cards.component.html',
  styleUrl: './type-cards.component.scss'
})
export class TypeCardsComponent implements OnInit {
  typeCards: TypeCardInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'tycrd_uuid', title: 'ID', width: '100px' },
    { key: 'tycrd_name', title: 'Nombre', width: '150px' },
    { key: 'tycrd_description', title: 'Descripción', width: '200px' },
    { key: 'tycrd_createdat', title: 'Creado', width: '180px' },
    { key: 'tycrd_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadTypeCards();
  }

  loadTypeCards(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.typeCards = [
        {
          tycrd_uuid: "1",
          tycrd_name: "Débito",
          tycrd_description: "Tarjeta de Débito",
          tycrd_createdat: "2026-02-07T17:17:58-03:00",
          tycrd_updatedat: "2026-02-07T17:17:58-03:00"
        },
        {
          tycrd_uuid: "2",
          tycrd_name: "Crédito",
          tycrd_description: "Tarjeta de Crédito",
          tycrd_createdat: "2026-02-07T17:18:30-03:00",
          tycrd_updatedat: "2026-02-07T17:18:30-03:00"
        },
        {
          tycrd_uuid: "3",
          tycrd_name: "Prepaga",
          tycrd_description: "Tarjeta Prepaga",
          tycrd_createdat: "2026-02-07T17:19:15-03:00",
          tycrd_updatedat: "2026-02-07T17:19:15-03:00"
        },
        {
          tycrd_uuid: "4",
          tycrd_name: "Vale",
          tycrd_description: "Tarjeta Vale",
          tycrd_createdat: "2026-02-07T17:20:00-03:00",
          tycrd_updatedat: "2026-02-07T17:20:00-03:00"
        }
      ];
      
      this.total = this.typeCards.length;
      this.loading = false;
    }, 800);
  }

  createTypeCard(): void {
    this.message.info('Crear nuevo tipo de tarjeta');
  }

  editTypeCard(typeCard: TypeCardInterface): void {
    this.message.info(`Editar tipo: ${typeCard.tycrd_name}`);
  }

  deleteTypeCard(typeCard: TypeCardInterface): void {
    this.message.success(`Tipo de tarjeta eliminado: ${typeCard.tycrd_name}`);
    this.typeCards = this.typeCards.filter(c => c.tycrd_uuid !== typeCard.tycrd_uuid);
    this.total = this.typeCards.length;
  }

  viewDetails(typeCard: TypeCardInterface): void {
    this.message.info(`Detalles de: ${typeCard.tycrd_name}`);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadTypeCards();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadTypeCards();
  }
}