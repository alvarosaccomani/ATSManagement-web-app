import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPeriodsComponent } from './status-periods.component';

describe('StatusPeriodsComponent', () => {
  let component: StatusPeriodsComponent;
  let fixture: ComponentFixture<StatusPeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPeriodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
