import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickinComponent } from './quickin.component';

describe('QuickinComponent', () => {
  let component: QuickinComponent;
  let fixture: ComponentFixture<QuickinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
