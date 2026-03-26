import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherExpenseProjectComponent } from './other-expense-project.component';

describe('OtherExpenseProjectComponent', () => {
  let component: OtherExpenseProjectComponent;
  let fixture: ComponentFixture<OtherExpenseProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherExpenseProjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherExpenseProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
