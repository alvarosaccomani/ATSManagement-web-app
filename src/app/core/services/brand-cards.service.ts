import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BrandCardResults } from '../interfaces/brand-card';

@Injectable({
  providedIn: 'root'
})
export class BrandCardsService {

  constructor(
    private _http: HttpClient
  ) { }
  
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
}
