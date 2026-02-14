import { TestBed } from '@angular/core/testing';

import { PaymentPeriodsStatusService } from './payment-periods-status.service';

describe('PaymentPeriodsStatusService', () => {
  let service: PaymentPeriodsStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentPeriodsStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
