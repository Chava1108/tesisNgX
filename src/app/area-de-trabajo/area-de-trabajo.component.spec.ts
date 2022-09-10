import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaDeTrabajoComponent } from './area-de-trabajo.component';

describe('AreaDeTrabajoComponent', () => {
  let component: AreaDeTrabajoComponent;
  let fixture: ComponentFixture<AreaDeTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreaDeTrabajoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaDeTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
