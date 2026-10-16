import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentMethodResults } from '../interfaces/payment-method';

/**
 * Servicio para gestionar los métodos de pago en el catálogo paramétrico.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  /**
   * Inicializa el servicio de métodos de pago.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene una lista paginada de métodos de pago.
   *
   * @param page Número de página opcional.
   * @param perPage Cantidad de elementos por página opcional.
   * @param field_order Nombre del campo opcional por el cual ordenar.
   * @param paym_order Dirección de ordenamiento opcional (`ASC` o `DESC`).
   * @returns Un observable que emite {@link PaymentMethodResults} paginados.
   */
  public getPaymentMethods(page?: number, perPage?: number, field_order?: string, paym_order?: string): Observable<PaymentMethodResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    if(field_order) {
      params = params.set('field_order', field_order);
    }

    if(paym_order) {
      params = params.set('paym_order', paym_order);
    }

    return this._http.get<PaymentMethodResults>(`${environment.apiUrl}payment-methods`, { headers, params });
  }

  /**
   * Obtiene un único método de pago por su UUID.
   *
   * @param paym_uuid Identificador único del método de pago.
   * @returns Un observable que emite el registro del método de pago solicitado.
   */
  public getPaymentMethodById(paym_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}payment-method/${paym_uuid}`, { headers });
  }

  /**
   * Crea un nuevo registro de método de pago.
   *
   * @param paymentMethod Carga útil del método de pago a persistir.
   * @returns Un observable que emite el registro del método de pago creado.
   */
  public savePaymentMethod(paymentMethod: any): Observable<any> {
    const params = JSON.stringify(paymentMethod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}payment-method`, params, { headers });
  }

  /**
   * Actualiza un registro de método de pago existente.
   *
   * @param paym_uuid Identificador único del método de pago a actualizar.
   * @param paymentMethod Carga útil actualizada del método de pago.
   * @returns Un observable que emite el registro del método de pago actualizado.
   */
  public updatePaymentMethod(paym_uuid: string, paymentMethod: any): Observable<any> {
    const params = JSON.stringify(paymentMethod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}payment-method/${paym_uuid}`, params, { headers });
  }

  /**
   * Elimina un registro de método de pago por su UUID.
   *
   * @param paym_uuid Identificador único del método de pago a eliminar.
   * @returns Un observable que emite la respuesta de eliminación.
   */
  public deletePaymentMethod(paym_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}payment-method/${paym_uuid}`, { headers });
  }
}
