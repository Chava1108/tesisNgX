import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarComponentComponent } from './agregar-component.component';

describe('AgregarComponentComponent', () => {
  let component: AgregarComponentComponent;
  let fixture: ComponentFixture<AgregarComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
