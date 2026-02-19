import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TreeResults } from '../interfaces/tree';

@Injectable({
  providedIn: 'root'
})
export class TreesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getCardsTree(usr_uuid: string): Observable<TreeResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if (usr_uuid) {
      params = params.set('usr_uuid', usr_uuid.toString());
    }

    return this._http.get<TreeResults>(`${environment.apiUrl}cards-tree/${usr_uuid}`, { headers, params });
  }
}
