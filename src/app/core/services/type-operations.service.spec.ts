import { TestBed } from '@angular/core/testing';

import { TypeOperationsService } from './type-operations.service';

describe('TypeOperationsService', () => {
  let service: TypeOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
