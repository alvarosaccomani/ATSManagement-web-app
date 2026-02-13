import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPeriodComponent } from './payment-period.component';

describe('PaymentPeriodComponent', () => {
  let component: PaymentPeriodComponent;
  let fixture: ComponentFixture<PaymentPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
