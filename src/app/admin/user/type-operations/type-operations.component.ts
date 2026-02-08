import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TypeOperationInterface } from '../../../core/interfaces/type-operation.interface';

@Component({
  selector: 'app-type-operations',
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
  templateUrl: './type-operations.component.html',
  styleUrl: './type-operations.component.scss'
})
export class TypeOperationsComponent implements OnInit {
  typeOperations: TypeOperationInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'tyop_uuid', title: 'ID', width: '80px' },
    { key: 'tyop_name', title: 'Nombre', width: '160px' },
    { key: 'tyop_description', title: 'Descripción', width: '250px' },
    { key: 'tyop_createdat', title: 'Creado', width: '180px' },
    { key: 'tyop_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadTypeOperations();
  }

  loadTypeOperations(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.typeOperations = [
        {
          tyop_uuid: "1",
          tyop_name: "compra",
          tyop_description: null,
          tyop_createdat: "2026-02-08T17:24:54-03:00",
          tyop_updatedat: "2026-02-08T17:24:54-03:00"
        },
        {
          tyop_uuid: "2",
          tyop_name: "devolucion",
          tyop_description: null,
          tyop_createdat: "2026-02-08T17:24:54-03:00",
          tyop_updatedat: "2026-02-08T17:24:54-03:00"
        },
        {
          tyop_uuid: "3",
          tyop_name: "extraccion",
          tyop_description: null,
          tyop_createdat: "2026-02-08T17:24:54-03:00",
          tyop_updatedat: "2026-02-08T17:24:54-03:00"
        },
        {
          tyop_uuid: "4",
          tyop_name: "pago_servicio",
          tyop_description: null,
          tyop_createdat: "2026-02-08T17:24:54-03:00",
          tyop_updatedat: "2026-02-08T17:24:54-03:00"
        }
      ];
      
      this.total = this.typeOperations.length;
      this.loading = false;
    }, 800);
  }

  // Obtener color del tag según el tipo de operación
  getTypeOperationColor(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'green';
      case 'devolucion': return 'red';
      case 'extraccion': return 'orange';
      case 'pago_servicio': return 'blue';
      default: return 'default';
    }
  }

  // Obtener icono según el tipo de operación
  getTypeOperationIcon(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'shopping-cart';
      case 'devolucion': return 'rollback';
      case 'extraccion': return 'bank';
      case 'pago_servicio': return 'pay-circle';
      default: return 'transaction';
    }
  }

  // Formatear nombre del tipo de operación
  formatTypeOperationName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  // Métodos de acción
  createTypeOperation(): void {
    this.message.info('Crear nuevo tipo de operación');
  }

  editTypeOperation(opType: TypeOperationInterface): void {
    this.message.info(`Editar tipo: ${this.formatTypeOperationName(opType.tyop_name)}`);
  }

  deleteTypeOperation(opType: TypeOperationInterface): void {
    this.message.success(`Tipo de operación eliminado: ${this.formatTypeOperationName(opType.tyop_name)}`);
    this.typeOperations = this.typeOperations.filter(t => t.tyop_uuid !== opType.tyop_uuid);
    this.total = this.typeOperations.length;
  }

  viewDetails(opType: TypeOperationInterface): void {
    this.message.info(`Detalles de: ${this.formatTypeOperationName(opType.tyop_name)}`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadTypeOperations();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadTypeOperations();
  }
}