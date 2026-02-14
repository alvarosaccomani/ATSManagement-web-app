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

  public getBankById(ban_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}bank/${ban_uuid}`, {headers:headers});
  }

  public saveBank(ank: any): Observable<any> {
    let params = JSON.stringify(ank);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}bank`, params, {headers:headers});
  }

  public updateBank(bank: any): Observable<any> {
    let params = JSON.stringify(bank);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}bank/${bank.ban_uuid}`, params, {headers:headers});
  }

  public deleteBank(ban_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}bank/${ban_uuid}`, {headers:headers});
  }
}
