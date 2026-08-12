import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPeriodStatusComponent } from './payment-period-status.component';

describe('PaymentPeriodStatusComponent', () => {
  let component: PaymentPeriodStatusComponent;
  let fixture: ComponentFixture<PaymentPeriodStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPeriodStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentPeriodStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
