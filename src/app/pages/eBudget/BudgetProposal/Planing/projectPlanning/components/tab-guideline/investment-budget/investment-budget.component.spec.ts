import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentBudgetComponent } from './investment-budget.component';

describe('InvestmentBudgetComponent', () => {
  let component: InvestmentBudgetComponent;
  let fixture: ComponentFixture<InvestmentBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentBudgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvestmentBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
