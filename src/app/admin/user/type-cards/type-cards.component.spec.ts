import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeCardsComponent } from './type-cards.component';

describe('TypeCardsComponent', () => {
  let component: TypeCardsComponent;
  let fixture: ComponentFixture<TypeCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
