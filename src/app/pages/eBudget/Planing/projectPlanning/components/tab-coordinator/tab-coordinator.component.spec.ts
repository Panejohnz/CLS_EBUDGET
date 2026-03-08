import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCoordinatorComponent } from './tab-coordinator.component';

describe('TabCoordinatorComponent', () => {
  let component: TabCoordinatorComponent;
  let fixture: ComponentFixture<TabCoordinatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabCoordinatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabCoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
