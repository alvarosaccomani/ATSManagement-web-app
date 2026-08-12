import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TypeCardInterface } from '../../../core/interfaces/type-card';
import { TypeCardsService } from '../../../core/services/type-cards.service';
import { MessageService } from '../../../core/services/message.service';

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

  constructor(
    private _router: Router,
    private _typeCardsService: TypeCardsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTypeCards();
  }

  loadTypeCards(): void {
    this.loading = true;
    this._typeCardsService.getTypeCards().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.typeCards = response.data;
          this.total = this.typeCards.length;
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

  createTypeCard(): void {
    this._router.navigate(['/admin/user/type-card/new']);
  }

  editTypeCard(typeCard: TypeCardInterface): void {
    this._router.navigate(['/admin/user/type-card/edit', typeCard.tycrd_uuid]);
  }

  deleteTypeCard(typeCard: TypeCardInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este tipo de tarjeta?',
      `Estás a punto de eliminar el tipo de tarjeta "${typeCard.tycrd_name}". Esta acción no se puede deshacer.`,
      () => {
        this._typeCardsService.deleteTypeCard(typeCard.tycrd_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Tipo de tarjeta eliminado', `El tipo de tarjeta "${typeCard.tycrd_name}" se eliminó correctamente`);
              this.loadTypeCards();
            } else {
              this._messageService.error('Error', response.message || 'Error al eliminar el tipo de tarjeta');
            }
          },
          error: (error: any) => {
            console.error(error);
            this._messageService.error('Error', 'Error de conexión al intentar eliminar el tipo de tarjeta');
          }
        });
      }
    );
  }

  viewDetails(typeCard: TypeCardInterface): void {
    this.message.info(`Nombre: ${typeCard.tycrd_name}\nDescripción: ${typeCard.tycrd_description || 'Sin descripción'}`);
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