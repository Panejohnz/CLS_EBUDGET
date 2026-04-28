import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSeminarComponent } from './training-seminar.component';

describe('TrainingSeminarComponent', () => {
  let component: TrainingSeminarComponent;
  let fixture: ComponentFixture<TrainingSeminarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingSeminarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingSeminarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
