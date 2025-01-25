import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPopComponent } from './pop-menu.component';

describe('MenuPopComponent', () => {
  let component: MenuPopComponent;
  let fixture: ComponentFixture<MenuPopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuPopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
