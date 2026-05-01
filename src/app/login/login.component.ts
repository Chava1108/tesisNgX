import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SecureStorageService } from '../services/secure-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  logIn: FormGroup;
  bandError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private storage: SecureStorageService) {
    this.logIn = new FormGroup({usrName: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^[a-zA-Z0-9_.-]*$'),
      ]),
      passwd: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(15),
      ]),
    });
  }

  ngOnInit(): void {
    // Si ya está logueado, lo mandamos al home directo
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/home']);
    }
  }

  validateUser() {
    if (this.logIn.invalid) return;

    const credentials = {
      username: this.logIn.value.usrName,
      password: this.logIn.value.passwd
    };

    // Llamamos al servicio. Ya NO desencriptamos aquí.
    this.authService.login(credentials).subscribe({
      next: (res) => {
        // El servicio ya guardó la sesión en sessionStorage con el 'tap'
        const destino = this.storage.getItem('is_admin') === '1' ? '/visor-codigo' : '/home';
        this.router.navigate([destino]);
      },
      error: (err) => {
        console.error('Error login', err);
        this.bandError = true;
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }

  get f() { 
  return this.logIn.controls; 
}
}
