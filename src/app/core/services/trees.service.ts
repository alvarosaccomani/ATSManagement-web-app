import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TreeResults } from '../interfaces/tree';

/**
 * Service for fetching the hierarchical tree of cards, billing periods, and vouchers.
 */
@Injectable({
  providedIn: 'root'
})
export class TreesService {

  /**
   * Initializes the trees service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves the hierarchical cards/periods/vouchers tree for a user, optionally filtered by scope.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param scp_uuid Optional scope UUID filter (`'ALL'` or specific scope UUID).
   * @returns An observable emitting {@link TreeResults}.
   */
  public getCardsTree(usr_uuid: string, scp_uuid?: string): Observable<TreeResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if (usr_uuid) {
      params = params.set('usr_uuid', usr_uuid.toString());
    }

    if (scp_uuid && scp_uuid !== 'ALL') {
      params = params.set('scp_uuid', scp_uuid.toString());
    }

    return this._http.get<TreeResults>(`${environment.apiUrl}cards-tree/${usr_uuid}`, { headers, params });
  }
}
