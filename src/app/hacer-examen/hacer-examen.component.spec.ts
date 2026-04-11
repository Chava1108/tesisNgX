import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HacerExamenComponent } from './hacer-examen.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HacerExamenComponent', () => {
  let component: HacerExamenComponent;
  let fixture: ComponentFixture<HacerExamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HacerExamenComponent],
      imports: [FormsModule, MatIconModule, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HacerExamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
