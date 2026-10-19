import { TestBed } from '@angular/core/testing';

import { ExcelTransactionsService } from './excel-transactions.service';

describe('ExcelTransactionsService', () => {
  let service: ExcelTransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
