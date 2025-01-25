import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelCounterComponent } from './sel-counter.component';

describe('SelCounterComponent', () => {
  let component: SelCounterComponent;
  let fixture: ComponentFixture<SelCounterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelCounterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
