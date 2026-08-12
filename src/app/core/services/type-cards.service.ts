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

  public getTypeCardById(tycrd_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}type-card/${tycrd_uuid}`, { headers });
  }

  public saveTypeCard(typeCard: any): Observable<any> {
    const params = JSON.stringify(typeCard);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}type-card`, params, { headers });
  }

  public updateTypeCard(tycrd_uuid: string, typeCard: any): Observable<any> {
    const params = JSON.stringify(typeCard);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}type-card/${tycrd_uuid}`, params, { headers });
  }

  public deleteTypeCard(tycrd_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}type-card/${tycrd_uuid}`, { headers });
  }
}
