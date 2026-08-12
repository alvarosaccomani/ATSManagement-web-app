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
  brandCards: BrandCardInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'brcrd_uuid', title: 'ID', width: '100px' },
    { key: 'brcrd_name', title: 'Nombre', width: '150px' },
    { key: 'brcrd_description', title: 'Descripción', width: '200px' },
    { key: 'brcrd_createdat', title: 'Creado', width: '180px' },
    { key: 'brcrd_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private _brandCardsService: BrandCardsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadBrandCards();
  }

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

  createBrandCard(): void {
    this._router.navigate(['/admin/user/brand-card/new']);
  }

  editBrandCard(brandCard: BrandCardInterface): void {
    this._router.navigate(['/admin/user/brand-card/edit', brandCard.brcrd_uuid]);
  }

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

  viewDetails(brandCard: BrandCardInterface): void {
    this.message.info(`Nombre: ${brandCard.brcrd_name}\nDescripción: ${brandCard.brcrd_description || 'Sin descripción'}`);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadBrandCards();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadBrandCards();
  }
}