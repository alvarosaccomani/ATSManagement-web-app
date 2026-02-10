import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPeriodsStatusComponent } from './payment-periods-status.component';

describe('PaymentPeriodsStatusComponent', () => {
  let component: PaymentPeriodsStatusComponent;
  let fixture: ComponentFixture<PaymentPeriodsStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPeriodsStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentPeriodsStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
