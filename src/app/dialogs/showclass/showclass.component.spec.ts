import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowclassComponent } from './showclass.component';

describe('ShowclassComponent', () => {
  let component: ShowclassComponent;
  let fixture: ComponentFixture<ShowclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowclassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
