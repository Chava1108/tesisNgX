import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFormularioComponent } from './editar-formulario.component';

describe('EditarFormularioComponent', () => {
  let component: EditarFormularioComponent;
  let fixture: ComponentFixture<EditarFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarFormularioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
