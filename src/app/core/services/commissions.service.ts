import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SellerCommissionResults } from '../interfaces/commission.interface';

@Injectable({
  providedIn: 'root'
})
export class CommissionsService {

  constructor(private _http: HttpClient) { }

  public getSellerCommissions(usr_uuid: string, scp_uuid?: string): Observable<SellerCommissionResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    if (scp_uuid && scp_uuid !== 'ALL') {
      params = params.set('scp_uuid', scp_uuid);
    }
    return this._http.get<SellerCommissionResults>(`${environment.apiUrl}commissions/seller/${usr_uuid}`, { headers, params });
  }
}
