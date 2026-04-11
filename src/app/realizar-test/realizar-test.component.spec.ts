import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RealizarTestComponent } from './realizar-test.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';

describe('RealizarTestComponent', () => {
  let component: RealizarTestComponent;
  let fixture: ComponentFixture<RealizarTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealizarTestComponent],
      imports: [FormsModule, MatIconModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RealizarTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
