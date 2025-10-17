import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AIChatInterface } from '../interfaces/aiChat.interface';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor(
    private _http: HttpClient
  ) { }

  public chatModel(chat: AIChatInterface): Observable<any> {
    let params = JSON.stringify(chat);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiAI + 'open-router/chat-model', params, {headers:headers});
  }
}
