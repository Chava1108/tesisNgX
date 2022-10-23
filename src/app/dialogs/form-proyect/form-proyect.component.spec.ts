import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProyectComponent } from './form-proyect.component';

describe('FormProyectComponent', () => {
  let component: FormProyectComponent;
  let fixture: ComponentFixture<FormProyectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormProyectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormProyectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
