import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeOperationComponent } from './type-operation.component';

describe('TypeOperationComponent', () => {
  let component: TypeOperationComponent;
  let fixture: ComponentFixture<TypeOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeOperationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
