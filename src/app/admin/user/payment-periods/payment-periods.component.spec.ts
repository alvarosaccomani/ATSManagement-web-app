import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPeriodsComponent } from './payment-periods.component';

describe('PaymentPeriodsComponent', () => {
  let component: PaymentPeriodsComponent;
  let fixture: ComponentFixture<PaymentPeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPeriodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
