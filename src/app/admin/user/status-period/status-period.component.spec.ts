import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPeriodComponent } from './status-period.component';

describe('StatusPeriodComponent', () => {
  let component: StatusPeriodComponent;
  let fixture: ComponentFixture<StatusPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
