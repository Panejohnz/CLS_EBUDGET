import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabGuidelineComponent } from './tab-guideline.component';

describe('TabGuidelineComponent', () => {
  let component: TabGuidelineComponent;
  let fixture: ComponentFixture<TabGuidelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabGuidelineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabGuidelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
