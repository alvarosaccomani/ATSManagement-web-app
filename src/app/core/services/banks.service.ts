import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BankResults } from '../interfaces/bank';

/**
 * Servicio para gestionar las entidades bancarias en el catálogo paramétrico.
 */
@Injectable({
  providedIn: 'root'
})
export class BanksService {

  /**
   * Inicializa el servicio de bancos.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Obtiene una lista paginada y opcionalmente ordenada de bancos para un usuario.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param page Número de página opcional.
   * @param perPage Cantidad de elementos por página opcional.
   * @param field_order Nombre del campo opcional por el cual ordenar.
   * @param ban_order Dirección de ordenamiento opcional (`ASC` o `DESC`).
   * @returns Un observable que emite {@link BankResults} paginados.
   */
  public getBanks(usr_uuid: string, page?: number, perPage?: number, field_order?: string, ban_order?: string): Observable<BankResults> {
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

    return this._http.get<BankResults>(`${environment.apiUrl}banks/${usr_uuid}`, { headers, params });
  }

  /**
   * Obtiene un único registro de banco por su UUID.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param ban_uuid Identificador único del banco.
   * @returns Un observable que emite el registro del banco solicitado.
   */
  public getBankById(usr_uuid: string, ban_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}bank/${usr_uuid}/${ban_uuid}`, {headers:headers});
  }

  /**
   * Crea un nuevo registro de banco.
   *
   * @param ank Carga útil del banco a persistir.
   * @returns Un observable que emite el registro del banco creado.
   */
  public saveBank(ank: any): Observable<any> {
    let params = JSON.stringify(ank);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}bank`, params, {headers:headers});
  }

  /**
   * Actualiza un registro de banco existente.
   *
   * @param bank Carga útil actualizada del banco que contiene `usr_uuid` y `ban_uuid`.
   * @returns Un observable que emite el registro del banco actualizado.
   */
  public updateBank(bank: any): Observable<any> {
    let params = JSON.stringify(bank);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}bank/${bank.usr_uuid}/${bank.ban_uuid}`, params, {headers:headers});
  }

  /**
   * Elimina un registro de banco por su UUID.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param ban_uuid Identificador único del banco a eliminar.
   * @returns Un observable que emite la respuesta de eliminación.
   */
  public deleteBank(usr_uuid: string, ban_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}bank/${usr_uuid}/${ban_uuid}`, {headers:headers});
  }
}
