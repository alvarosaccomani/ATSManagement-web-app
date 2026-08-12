import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherStateComponent } from './voucher-state.component';

describe('VoucherStateComponent', () => {
  let component: VoucherStateComponent;
  let fixture: ComponentFixture<VoucherStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
