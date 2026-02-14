import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeCardResults } from '../interfaces/type-card/type-card-results.interface';

@Injectable({
  providedIn: 'root'
})
export class TypeCardsService {

  constructor(
    private _http: HttpClient
  ) { }

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
}
