import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BrandCardResults } from '../interfaces/brand-card';

/**
 * Servicio para gestionar las marcas de tarjetas (por ejemplo, Visa, Mastercard, Amex) en el catálogo paramétrico.
 */
@Injectable({
  providedIn: 'root'
})
export class BrandCardsService {

  /**
   * Inicializa el servicio de marcas de tarjetas.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Obtiene una lista paginada de marcas de tarjetas.
   *
   * @param page Número de página opcional.
   * @param perPage Cantidad de elementos por página opcional.
   * @param field_order Nombre del campo opcional por el cual ordenar.
   * @param brcrd_order Dirección de ordenamiento opcional (`ASC` o `DESC`).
   * @returns Un observable que emite {@link BrandCardResults} paginados.
   */
  public getBrandCards(page?: number, perPage?: number, field_order?: string, brcrd_order?: string): Observable<BrandCardResults> {
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
  
      if(brcrd_order) {
        params = params.set('brcrd_order', brcrd_order);
      }
  
      return this._http.get<BrandCardResults>(`${environment.apiUrl}brand-cards`, { headers, params });
    }

  /**
   * Obtiene una única marca de tarjeta por su UUID.
   *
   * @param brcrd_uuid Identificador único de la marca de tarjeta.
   * @returns Un observable que emite el registro de la marca de tarjeta solicitado.
   */
  public getBrandCardById(brcrd_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}brand-card/${brcrd_uuid}`, { headers });
  }

  /**
   * Crea un nuevo registro de marca de tarjeta.
   *
   * @param brandCard Carga útil de la marca de tarjeta a persistir.
   * @returns Un observable que emite el registro de la marca de tarjeta creado.
   */
  public saveBrandCard(brandCard: any): Observable<any> {
    const params = JSON.stringify(brandCard);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}brand-card`, params, { headers });
  }

  /**
   * Actualiza un registro de marca de tarjeta existente.
   *
   * @param brcrd_uuid Identificador único de la marca de tarjeta a actualizar.
   * @param brandCard Carga útil actualizada de la marca de tarjeta.
   * @returns Un observable que emite el registro de la marca de tarjeta actualizado.
   */
  public updateBrandCard(brcrd_uuid: string, brandCard: any): Observable<any> {
    const params = JSON.stringify(brandCard);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}brand-card/${brcrd_uuid}`, params, { headers });
  }

  /**
   * Elimina un registro de marca de tarjeta por su UUID.
   *
   * @param brcrd_uuid Identificador único de la marca de tarjeta a eliminar.
   * @returns Un observable que emite la respuesta de eliminación.
   */
  public deleteBrandCard(brcrd_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}brand-card/${brcrd_uuid}`, { headers });
  }
}
