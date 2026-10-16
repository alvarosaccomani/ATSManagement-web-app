import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CardResults } from '../interfaces/card';

/**
 * Servicio para gestionar las tarjetas de crédito y débito del usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class CardsService {

  /**
   * Inicializa el servicio de tarjetas.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(
      private _http: HttpClient
    ) { }
    
  /**
   * Obtiene una lista paginada de tarjetas para un usuario, opcionalmente filtrada por ámbito.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param page Número de página opcional.
   * @param perPage Cantidad de elementos por página opcional.
   * @param field_order Nombre del campo opcional por el cual ordenar.
   * @param crd_order Dirección de ordenamiento opcional (`ASC` o `DESC`).
   * @param scp_uuid Filtro opcional de UUID de ámbito (`'ALL'` o UUID de un ámbito específico).
   * @returns Un observable que emite {@link CardResults} paginados.
   */
  public getCards(usr_uuid: string, page?: number, perPage?: number, field_order?: string, crd_order?: string, scp_uuid?: string): Observable<CardResults> {
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

    if(crd_order) {
      params = params.set('crd_order', crd_order);
    }

    if (scp_uuid && scp_uuid !== 'ALL') {
      params = params.set('scp_uuid', scp_uuid);
    }

    return this._http.get<CardResults>(`${environment.apiUrl}cards/${usr_uuid}`, { headers, params });
  }

  /**
   * Obtiene una única tarjeta por su UUID.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param crd_uuid Identificador único de la tarjeta.
   * @returns Un observable que emite el registro de la tarjeta solicitado.
   */
  public getCardById(usr_uuid: string, crd_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}card/${usr_uuid}/${crd_uuid}`, {headers:headers});
  }

  /**
   * Crea un nuevo registro de tarjeta.
   *
   * @param ank Carga útil de la tarjeta a persistir.
   * @returns Un observable que emite el registro de la tarjeta creado.
   */
  public saveCard(ank: any): Observable<any> {
    let params = JSON.stringify(ank);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}card`, params, {headers:headers});
  }

  /**
   * Actualiza un registro de tarjeta existente.
   *
   * @param card Carga útil actualizada de la tarjeta que contiene `usr_uuid` y `crd_uuid`.
   * @returns Un observable que emite el registro de la tarjeta actualizado.
   */
  public updateCard(card: any): Observable<any> {
    let params = JSON.stringify(card);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}card/${card.usr_uuid}/${card.crd_uuid}`, params, {headers:headers});
  }

  /**
   * Elimina un registro de tarjeta por su UUID.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param crd_uuid Identificador único de la tarjeta a eliminar.
   * @returns Un observable que emite la respuesta de eliminación.
   */
  public deleteCard(usr_uuid: string, crd_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}card/${usr_uuid}/${crd_uuid}`, {headers:headers});
  }
}
