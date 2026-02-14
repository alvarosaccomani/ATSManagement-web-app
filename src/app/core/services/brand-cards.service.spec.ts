import { TestBed } from '@angular/core/testing';

import { BrandCardsService } from './brand-cards.service';

describe('BrandCardsService', () => {
  let service: BrandCardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrandCardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
