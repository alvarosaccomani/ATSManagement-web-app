import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SellerCommissionResults } from '../interfaces/commission.interface';

/**
 * Servicio para consultar resúmenes de comisiones de vendedores y ventas comisionables.
 */
@Injectable({
  providedIn: 'root'
})
export class CommissionsService {

  /**
   * Inicializa el servicio de comisiones.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(private _http: HttpClient) { }

  /**
   * Obtiene el resumen de comisiones del vendedor y la lista de ventas para un usuario, opcionalmente filtrado por ámbito.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param scp_uuid Filtro opcional de UUID de ámbito (`'ALL'` o UUID de un ámbito específico).
   * @returns Un observable que emite {@link SellerCommissionResults}.
   */
  public getSellerCommissions(usr_uuid: string, scp_uuid?: string): Observable<SellerCommissionResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    if (scp_uuid && scp_uuid !== 'ALL') {
      params = params.set('scp_uuid', scp_uuid);
    }
    return this._http.get<SellerCommissionResults>(`${environment.apiUrl}commissions/seller/${usr_uuid}`, { headers, params });
  }
}
