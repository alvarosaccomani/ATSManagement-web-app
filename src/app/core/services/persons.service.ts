import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PersonResults } from '../interfaces/person.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getPersons(scp_uuid: string): Observable<PersonResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<PersonResults>(`${environment.apiUrl}persons/${scp_uuid}`, { headers });
  }

  public getPersonById(prs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}person/${prs_uuid}`, { headers });
  }

  public savePerson(person: any): Observable<any> {
    const params = JSON.stringify(person);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}person`, params, { headers });
  }

  public updatePerson(prs_uuid: string, person: any): Observable<any> {
    const params = JSON.stringify(person);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}person/${prs_uuid}`, params, { headers });
  }

  public deletePerson(prs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}person/${prs_uuid}`, { headers });
  }
}
