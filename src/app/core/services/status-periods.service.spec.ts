import { TestBed } from '@angular/core/testing';

import { StatusPeriodsService } from './status-periods.service';

describe('StatusPeriodsService', () => {
  let service: StatusPeriodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusPeriodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
