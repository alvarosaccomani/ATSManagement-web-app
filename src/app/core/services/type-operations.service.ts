import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeOperationResults } from '../interfaces/type-operation';

@Injectable({
  providedIn: 'root'
})
export class TypeOperationsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getTypeOperations(page?: number, perPage?: number, field_order?: string, tyop_order?: string): Observable<TypeOperationResults> {
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

    if(tyop_order) {
      params = params.set('tyop_order', tyop_order);
    }

    return this._http.get<TypeOperationResults>(`${environment.apiUrl}type-operations`, { headers, params });
  }
}
