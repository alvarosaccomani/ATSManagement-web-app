import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PeriodResults } from '../interfaces/period';

@Injectable({
  providedIn: 'root'
})
export class PeriodsService {

  constructor(
      private _http: HttpClient
    ) { }
        
  public getPedriods(usr_uuid: string, crd_uuid: string, page?: number, perPage?: number, field_order?: string, per_order?: string): Observable<PeriodResults> {
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

    if(per_order) {
      params = params.set('per_order', per_order);
    }

    return this._http.get<PeriodResults>(`${environment.apiUrl}periods/${usr_uuid}/${crd_uuid}`, { headers, params });
  }
}
