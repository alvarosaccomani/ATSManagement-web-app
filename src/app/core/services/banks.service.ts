import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BankResults } from '../interfaces/bank';

@Injectable({
  providedIn: 'root'
})
export class BanksService {

  constructor(
    private _http: HttpClient
  ) { }

  public getBanks(page?: number, perPage?: number, field_order?: string, ban_order?: string): Observable<BankResults> {
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

    if(ban_order) {
      params = params.set('ban_order', ban_order);
    }

    return this._http.get<BankResults>(`${environment.apiUrl}banks`, { headers, params });
  }
}
