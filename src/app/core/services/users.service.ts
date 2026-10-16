import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Service for user profile management operations.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  /**
   * Initializes the users service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(private _http: HttpClient) { }
}
