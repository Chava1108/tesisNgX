import {
  AfterContentInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { AutoLogoutService } from './services/auto-logout.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'PooGraph';

  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required),
  });
  constructor(
    renderer2: Renderer2,
    private ElementRef: ElementRef,
    private autoLogout: AutoLogoutService,
    private auth: AuthService,
  ) {}
  ngOnInit(): void {
    if (this.auth.estaAutenticado()) {
      this.autoLogout.startMonitoring();
    }
    this.auth.isLoggedIn$.subscribe(state => {
      if (state) {
        this.autoLogout.startMonitoring();
      } else {
        this.autoLogout.stopMonitoring();
      }
    });
  }

  agregarClase() {}
}
