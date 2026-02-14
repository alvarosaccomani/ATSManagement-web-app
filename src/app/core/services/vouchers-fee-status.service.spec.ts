import { TestBed } from '@angular/core/testing';

import { VouchersFeeStatusService } from './vouchers-fee-status.service';

describe('VouchersFeeStatusService', () => {
  let service: VouchersFeeStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VouchersFeeStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
