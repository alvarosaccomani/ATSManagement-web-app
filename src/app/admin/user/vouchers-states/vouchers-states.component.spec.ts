import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VouchersStatesComponent } from './vouchers-states.component';

describe('VouchersStatesComponent', () => {
  let component: VouchersStatesComponent;
  let fixture: ComponentFixture<VouchersStatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VouchersStatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VouchersStatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
