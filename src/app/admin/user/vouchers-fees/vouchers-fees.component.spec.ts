import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VouchersFeesComponent } from './vouchers-fees.component';

describe('VouchersFeesComponent', () => {
  let component: VouchersFeesComponent;
  let fixture: ComponentFixture<VouchersFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VouchersFeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VouchersFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
