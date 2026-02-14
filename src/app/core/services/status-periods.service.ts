import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatusPeriodResults } from '../interfaces/status-period';

@Injectable({
  providedIn: 'root'
})
export class StatusPeriodsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getStatusPeriods(page?: number, perPage?: number, field_order?: string, sper_order?: string): Observable<StatusPeriodResults> {
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
    
        if(sper_order) {
          params = params.set('sper_order', sper_order);
        }
    
        return this._http.get<StatusPeriodResults>(`${environment.apiUrl}status-periods`, { headers, params });
      }
}
