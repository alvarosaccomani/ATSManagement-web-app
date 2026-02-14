import { TestBed } from '@angular/core/testing';

import { VouchersStatesService } from './vouchers-states.service';

describe('VouchersStatesService', () => {
  let service: VouchersStatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VouchersStatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
