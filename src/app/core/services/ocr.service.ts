import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  public cbImage: EventEmitter<any> = new EventEmitter<any>();
  public cbText: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }
}
