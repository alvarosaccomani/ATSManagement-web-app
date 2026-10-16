import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeCardResults } from '../interfaces/type-card/type-card-results.interface';

/**
 * Service for managing card types (Debit, Credit) in the parametric catalog.
 */
@Injectable({
  providedIn: 'root'
})
export class TypeCardsService {

  /**
   * Initializes the card types service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of card types.
   *
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param tycrd_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link TypeCardResults}.
   */
  public getTypeCards(page?: number, perPage?: number, field_order?: string, tycrd_order?: string): Observable<TypeCardResults> {
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
  
      if(tycrd_order) {
        params = params.set('tycrd_order', tycrd_order);
      }
  
      return this._http.get<TypeCardResults>(`${environment.apiUrl}type-cards`, { headers, params });
    }

  /**
   * Retrieves a single card type by its UUID.
   *
   * @param tycrd_uuid Unique identifier of the card type.
   * @returns An observable emitting the requested card type record.
   */
  public getTypeCardById(tycrd_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}type-card/${tycrd_uuid}`, { headers });
  }

  /**
   * Creates a new card type record.
   *
   * @param typeCard Card type payload to persist.
   * @returns An observable emitting the created card type record.
   */
  public saveTypeCard(typeCard: any): Observable<any> {
    const params = JSON.stringify(typeCard);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}type-card`, params, { headers });
  }

  /**
   * Updates an existing card type record.
   *
   * @param tycrd_uuid Unique identifier of the card type to update.
   * @param typeCard Updated card type payload.
   * @returns An observable emitting the updated card type record.
   */
  public updateTypeCard(tycrd_uuid: string, typeCard: any): Observable<any> {
    const params = JSON.stringify(typeCard);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}type-card/${tycrd_uuid}`, params, { headers });
  }

  /**
   * Deletes a card type record by its UUID.
   *
   * @param tycrd_uuid Unique identifier of the card type to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteTypeCard(tycrd_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}type-card/${tycrd_uuid}`, { headers });
  }
}
