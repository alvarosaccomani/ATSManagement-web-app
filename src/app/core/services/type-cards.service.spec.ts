import { TestBed } from '@angular/core/testing';

import { TypeCardsService } from './type-cards.service';

describe('TypeCardsService', () => {
  let service: TypeCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
