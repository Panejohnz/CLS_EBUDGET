import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantHireComponent } from './consultant-hire.component';

describe('ConsultantHireComponent', () => {
  let component: ConsultantHireComponent;
  let fixture: ComponentFixture<ConsultantHireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultantHireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultantHireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
