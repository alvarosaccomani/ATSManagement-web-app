import { TestBed } from '@angular/core/testing';

import { VouchersFeesService } from './vouchers-fees.service';

describe('VouchersFeesService', () => {
  let service: VouchersFeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VouchersFeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
