import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleBarComponent } from './toggle-bar.component';

describe('ToggleBarComponent', () => {
  let component: ToggleBarComponent;
  let fixture: ComponentFixture<ToggleBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
