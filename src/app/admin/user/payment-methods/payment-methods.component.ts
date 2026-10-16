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
import { PaymentMethodInterface } from '../../../core/interfaces/payment-method';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente para listar y gestionar registros de métodos de pago.
 * @description Muestra una tabla paginada de métodos de pago con etiquetas visuales, íconos y acciones CRUD.
 */
@Component({
  selector: 'app-payment-methods',
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
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.scss'
})
export class PaymentMethodsComponent implements OnInit {
  /** Arreglo de registros de métodos de pago cargados. */
  paymentMethods: PaymentMethodInterface[] = [];
  /** Indicador de si los datos de la tabla se están cargando. */
  loading = false;
  /** Índice de la página actual (basado en 1). */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de métodos de pago. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
  listOfColumns = [
    { key: 'paym_uuid', title: 'ID', width: '80px' },
    { key: 'paym_name', title: 'Nombre', width: '160px' },
    { key: 'paym_description', title: 'Descripción', width: '250px' },
    { key: 'paym_createdat', title: 'Creado', width: '180px' },
    { key: 'paym_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Inicializa el componente PaymentMethodsComponent.
   * @param _router Servicio Router de Angular.
   * @param _paymentMethodsService Servicio para operaciones CRUD de métodos de pago.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private _router: Router,
    private _paymentMethodsService: PaymentMethodsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  /**
   * Carga la lista de métodos de pago desde el servicio de backend.
   * @returns void
   */
  loadPaymentMethods(): void {
    this.loading = true;
    this._paymentMethodsService.getPaymentMethods().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.paymentMethods = response.data;
          this.total = this.paymentMethods.length;
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
   * Devuelve el color de etiqueta de Ng-Zorro para un nombre de método de pago.
   * @param methodName Nombre del método de pago.
   * @returns Cadena con el color de la etiqueta.
   */
  getMethodColor(methodName: string): string {
    switch (methodName.toLowerCase()) {
      case 'banco': return 'blue';
      case 'transferencia': return 'geekblue';
      case 'rapipago': return 'gold';
      case 'mercado pago': return 'volcano';
      case 'pago fácil': return 'orange';
      default: return 'default';
    }
  }

  /**
   * Devuelve el nombre del ícono de Ng-Zorro para un nombre de método de pago.
   * @param methodName Nombre del método de pago.
   * @returns Cadena con el nombre del ícono.
   */
  getMethodIcon(methodName: string): string {
    switch (methodName.toLowerCase()) {
      case 'banco': return 'bank';
      case 'transferencia': return 'swap';
      case 'rapipago': return 'barcode';
      case 'mercado pago': return 'wallet';
      case 'pago fácil': return 'barcode';
      default: return 'credit-card';
    }
  }

  /**
   * Formatea un nombre de método de pago sin procesar a formato de título.
   * @param name Nombre del método de pago sin procesar.
   * @returns Nombre del método de pago formateado.
   */
  formatMethodName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Navega al formulario de creación de método de pago.
   * @returns void
   */
  createPaymentMethod(): void {
    this._router.navigate(['/admin/user/payment-method/new']);
  }

  /**
   * Navega al formulario de edición de método de pago.
   * @param method Registro de método de pago a editar.
   * @returns void
   */
  editPaymentMethod(method: PaymentMethodInterface): void {
    this._router.navigate(['/admin/user/payment-method/edit', method.paym_uuid]);
  }

  /**
   * Solicita confirmación y elimina un registro de método de pago.
   * @param method Registro de método de pago a eliminar.
   * @returns void
   */
  deletePaymentMethod(method: PaymentMethodInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este método de pago?',
      `Estás a punto de eliminar el método de pago "${this.formatMethodName(method.paym_name)}". Esta acción no se puede deshacer.`,
      () => {
        this._paymentMethodsService.deletePaymentMethod(method.paym_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Método de pago eliminado', `El método de pago "${this.formatMethodName(method.paym_name)}" se eliminó correctamente`);
              this.loadPaymentMethods();
            } else {
              this._messageService.error('Error', response.message || 'Error al eliminar el método de pago');
            }
          },
          error: (error: any) => {
            console.error(error);
            this._messageService.error('Error', 'Error de conexión al intentar eliminar el método de pago');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación emergente con los detalles del método de pago.
   * @param method Registro de método de pago a inspeccionar.
   * @returns void
   */
  viewDetails(method: PaymentMethodInterface): void {
    this.message.info(`Nombre: ${this.formatMethodName(method.paym_name)}\nDescripción: ${method.paym_description || 'Sin descripción'}`);
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   * @param size Nuevo tamaño de página.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPaymentMethods();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   * @param index Nuevo índice de página.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPaymentMethods();
  }
}