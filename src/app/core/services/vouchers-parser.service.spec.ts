import { TestBed } from '@angular/core/testing';

import { VouchersParserService } from './vouchers-parser.service';

describe('VouchersParserService', () => {
  let service: VouchersParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VouchersParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
