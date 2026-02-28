import { TestBed } from '@angular/core/testing';

import { PendingVouchersService } from './pending-vouchers.service';

describe('PendingVouchersService', () => {
  let service: PendingVouchersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingVouchersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
