import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CardResults } from '../interfaces/card';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor(
      private _http: HttpClient
    ) { }
    
  public getCards(usr_uuid: string, page?: number, perPage?: number, field_order?: string, crd_order?: string): Observable<CardResults> {
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

    return this._http.get<CardResults>(`${environment.apiUrl}cards/${usr_uuid}`, { headers, params });
  }

  public getCardById(usr_uuid: string, crd_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}card/${usr_uuid}/${crd_uuid}`, {headers:headers});
  }

  public saveCard(ank: any): Observable<any> {
    let params = JSON.stringify(ank);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}card`, params, {headers:headers});
  }

  public updateCard(card: any): Observable<any> {
    let params = JSON.stringify(card);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}card/${card.usr_uuid}/${card.crd_uuid}`, params, {headers:headers});
  }

  public deleteCard(usr_uuid: string, crd_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}card/${usr_uuid}/${crd_uuid}`, {headers:headers});
  }
}
