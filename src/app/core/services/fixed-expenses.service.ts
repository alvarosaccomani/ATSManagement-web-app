import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FixedExpenseInputDTO,
  FixedExpenseInterface,
  FixedExpensesResults,
  PayFixedExpenseDTO,
  PayFixedExpenseResult
} from '../interfaces/fixed-expense.interface';

/**
 * Servicio para la gestión integral de Gastos Fijos y Recurrentes.
 * Permite administrar plantillas mensuales, configuración de débito automático
 * y la liquidación periódica con generación automática del egreso contable.
 */
@Injectable({
  providedIn: 'root'
})
export class FixedExpensesService {

  /**
   * Inicializa el servicio de gastos fijos.
   *
   * @param _http Cliente HTTP de Angular para llamadas a la API REST.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene la lista de gastos fijos activos para un ámbito determinado,
   * decorados con su estado de pago (`PAID` o `PENDING`) para el período mensual solicitado.
   *
   * @param scp_uuid Identificador único del ámbito contable.
   * @param period Período en formato 'YYYY-MM' (por ejemplo '2026-10'). Si se omite, la API toma el mes en curso.
   * @returns Un Observable con {@link FixedExpensesResults}.
   */
  public getFixedExpenses(scp_uuid: string, period?: string): Observable<FixedExpensesResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    if (period) {
      params = params.set('period', period);
    }
    return this._http.get<FixedExpensesResults>(`${environment.apiUrl}fixed-expenses/${scp_uuid}`, { headers, params });
  }

  /**
   * Obtiene el detalle de un gasto fijo específico por su identificador UUID.
   *
   * @param fex_uuid Identificador único del gasto fijo.
   * @returns Un Observable con la entidad del gasto fijo.
   */
  public getFixedExpenseById(fex_uuid: string): Observable<{ success: boolean; data: FixedExpenseInterface }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<{ success: boolean; data: FixedExpenseInterface }>(`${environment.apiUrl}fixed-expense/${fex_uuid}`, { headers });
  }

  /**
   * Da de alta una nueva plantilla de gasto fijo o servicio recurrente.
   *
   * @param data Datos de configuración del nuevo gasto fijo.
   * @returns Un Observable con la entidad creada.
   */
  public createFixedExpense(data: FixedExpenseInputDTO): Observable<{ success: boolean; data: FixedExpenseInterface }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<{ success: boolean; data: FixedExpenseInterface }>(`${environment.apiUrl}fixed-expense`, data, { headers });
  }

  /**
   * Actualiza los parámetros de una plantilla de gasto recurrente existente.
   *
   * @param fex_uuid Identificador único del gasto fijo a modificar.
   * @param data Datos parciales a actualizar.
   * @returns Un Observable con la entidad actualizada.
   */
  public updateFixedExpense(fex_uuid: string, data: Partial<FixedExpenseInputDTO>): Observable<{ success: boolean; data: FixedExpenseInterface }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put<{ success: boolean; data: FixedExpenseInterface }>(`${environment.apiUrl}fixed-expense/${fex_uuid}`, data, { headers });
  }

  /**
   * Da de baja lógica un gasto fijo (desactivación).
   *
   * @param fex_uuid Identificador único del gasto fijo a eliminar.
   * @returns Un Observable indicando el resultado de la operación.
   */
  public deleteFixedExpense(fex_uuid: string): Observable<{ success: boolean; message: string }> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete<{ success: boolean; message: string }>(`${environment.apiUrl}fixed-expense/${fex_uuid}`, { headers });
  }

  /**
   * Registra el pago mensual de un gasto fijo.
   * Crea automáticamente el movimiento de egreso contable en el libro de caja
   * y actualiza el monto de referencia para el mes siguiente.
   *
   * @param fex_uuid Identificador único del gasto fijo abonado.
   * @param paymentData Datos del pago (monto real, fecha, cuenta/tarjeta, socio pagador, notas).
   * @returns Un Observable con {@link PayFixedExpenseResult}.
   */
  public payFixedExpense(fex_uuid: string, paymentData: PayFixedExpenseDTO): Observable<PayFixedExpenseResult> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post<PayFixedExpenseResult>(`${environment.apiUrl}fixed-expense/${fex_uuid}/pay`, paymentData, { headers });
  }
}
