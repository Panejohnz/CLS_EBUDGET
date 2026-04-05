import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabAlignmentComponent } from './tab-alignment.component';

describe('TabAlignmentComponent', () => {
  let component: TabAlignmentComponent;
  let fixture: ComponentFixture<TabAlignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabAlignmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabAlignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
