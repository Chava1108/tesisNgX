import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importamos el nuevo servicio

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  logIn: FormGroup;
  bandError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
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
        // Usamos el Router de Angular, NO document.location
        this.router.navigate(['/home']);
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
