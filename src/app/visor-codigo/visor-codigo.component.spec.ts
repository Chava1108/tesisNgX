import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisorCodigoComponent } from './visor-codigo.component';

describe('VisorCodigoComponent', () => {
  let component: VisorCodigoComponent;
  let fixture: ComponentFixture<VisorCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisorCodigoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisorCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
