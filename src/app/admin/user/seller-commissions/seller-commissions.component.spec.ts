import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerCommissionsComponent } from './seller-commissions.component';

describe('SellerCommissionsComponent', () => {
  let component: SellerCommissionsComponent;
  let fixture: ComponentFixture<SellerCommissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerCommissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerCommissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
