import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandCardsComponent } from './brand-cards.component';

describe('BrandCardsComponent', () => {
  let component: BrandCardsComponent;
  let fixture: ComponentFixture<BrandCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
