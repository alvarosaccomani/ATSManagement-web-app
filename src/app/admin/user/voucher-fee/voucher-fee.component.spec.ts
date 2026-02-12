import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherFeeComponent } from './voucher-fee.component';

describe('VoucherFeeComponent', () => {
  let component: VoucherFeeComponent;
  let fixture: ComponentFixture<VoucherFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherFeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
