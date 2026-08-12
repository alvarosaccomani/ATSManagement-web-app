import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherFeeStatusComponent } from './voucher-fee-status.component';

describe('VoucherFeeStatusComponent', () => {
  let component: VoucherFeeStatusComponent;
  let fixture: ComponentFixture<VoucherFeeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherFeeStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherFeeStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
