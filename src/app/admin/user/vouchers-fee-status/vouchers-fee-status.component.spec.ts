import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VouchersFeeStatusComponent } from './vouchers-fee-status.component';

describe('VouchersFeeStatusComponent', () => {
  let component: VouchersFeeStatusComponent;
  let fixture: ComponentFixture<VouchersFeeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VouchersFeeStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VouchersFeeStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
