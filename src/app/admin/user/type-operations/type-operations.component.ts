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
import { TypeOperationInterface } from '../../../core/interfaces/type-operation';
import { TypeOperationsService } from '../../../core/services/type-operations.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Component for listing and managing operation type records.
 * @description Displays a paginated table of operation types with visual tags, icons, and CRUD actions.
 */
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
  /** Array of loaded operation type records. */
  typeOperations: TypeOperationInterface[] = [];
  /** Flag indicating whether table data is loading. */
  loading = false;
  /** Current page index (1-based). */
  pageIndex = 1;
  /** Number of rows per page. */
  pageSize = 10;
  /** Total number of operation type records. */
  total = 0;

  /** Table column definitions. */
  listOfColumns = [
    { key: 'tyop_uuid', title: 'ID', width: '80px' },
    { key: 'tyop_name', title: 'Nombre', width: '160px' },
    { key: 'tyop_description', title: 'Descripción', width: '250px' },
    { key: 'tyop_createdat', title: 'Creado', width: '180px' },
    { key: 'tyop_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Initializes the TypeOperationsComponent.
   * @param _router Angular Router service.
   * @param _typeOperationsService Service for operation type CRUD operations.
   * @param message Ng-Zorro toast message service.
   * @param _messageService Custom modal alert service.
   */
  constructor(
    private _router: Router,
    private _typeOperationsService: TypeOperationsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Lifecycle hook executed on component initialization.
   * @returns void
   */
  ngOnInit(): void {
    this.loadTypeOperations();
  }

  /**
   * Loads the operation types list from the backend service.
   * @returns void
   */
  loadTypeOperations(): void {
    this.loading = true;
    this._typeOperationsService.getTypeOperations().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.typeOperations = response.data;
          this.total = this.typeOperations.length;
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
   * Returns the Ng-Zorro tag color for an operation type name.
   * @param typeName Operation type name.
   * @returns Tag color string.
   */
  getTypeOperationColor(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'green';
      case 'devolucion': return 'red';
      case 'extraccion': return 'orange';
      case 'pago_servicio': return 'blue';
      default: return 'default';
    }
  }

  /**
   * Returns the Ng-Zorro icon name for an operation type name.
   * @param typeName Operation type name.
   * @returns Icon name string.
   */
  getTypeOperationIcon(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'shopping-cart';
      case 'devolucion': return 'rollback';
      case 'extraccion': return 'bank';
      case 'pago_servicio': return 'pay-circle';
      default: return 'transaction';
    }
  }

  /**
   * Formats a raw operation type name into title case.
   * @param name Raw operation type name.
   * @returns Formatted operation type name.
   */
  formatTypeOperationName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Navigates to the operation type creation form.
   * @returns void
   */
  createTypeOperation(): void {
    this._router.navigate(['/admin/user/type-operation/new']);
  }

  /**
   * Navigates to the operation type edit form.
   * @param opType Operation type record to edit.
   * @returns void
   */
  editTypeOperation(opType: TypeOperationInterface): void {
    this._router.navigate(['/admin/user/type-operation/edit', opType.tyop_uuid]);
  }

  /**
   * Prompts for confirmation and deletes an operation type record.
   * @param opType Operation type record to delete.
   * @returns void
   */
  deleteTypeOperation(opType: TypeOperationInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este tipo de operación?',
      `Estás a punto de eliminar el tipo de operación "${this.formatTypeOperationName(opType.tyop_name)}". Esta acción no se puede deshacer.`,
      () => {
        this._typeOperationsService.deleteTypeOperation(opType.tyop_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Tipo de operación eliminado', `El tipo de operación "${this.formatTypeOperationName(opType.tyop_name)}" se eliminó correctamente`);
              this.loadTypeOperations();
            } else {
              this._messageService.error('Error', response.message || 'Error al eliminar el tipo de operación');
            }
          },
          error: (error: any) => {
            console.error(error);
            this._messageService.error('Error', 'Error de conexión al intentar eliminar el tipo de operación');
          }
        });
      }
    );
  }

  /**
   * Displays a toast notification with operation type details.
   * @param opType Operation type record to inspect.
   * @returns void
   */
  viewDetails(opType: TypeOperationInterface): void {
    this.message.info(`Nombre: ${this.formatTypeOperationName(opType.tyop_name)}\nDescripción: ${opType.tyop_description || 'Sin descripción'}`);
  }

  /**
   * Handles table page size changes.
   * @param size New page size.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadTypeOperations();
  }

  /**
   * Handles table page index changes.
   * @param index New page index.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadTypeOperations();
  }
}