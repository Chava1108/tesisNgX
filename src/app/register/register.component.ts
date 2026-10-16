import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../services/usuarios.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private api: UsuariosService, private router: Router) { }

  horizontalStepperForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.maxLength(80)]),
    correo: new FormControl('', [Validators.required, Validators.pattern(/^al\d{6}@edu\.uaa\.mx$/i)]),
    usuario: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('^[a-zA-Z0-9_.-]*$')]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]),
    password2: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]),
    genero: new FormControl('', Validators.required),
    edad: new FormControl('', [Validators.required, Validators.min(15), Validators.max(99)]),
    nivel_socioeconomico: new FormControl('', Validators.required),
    semestre: new FormControl('', [Validators.required, Validators.min(1), Validators.max(12)]),
    aceptaPrivacidad: new FormControl(false, Validators.requiredTrue),
  });

  invalidPassword: boolean = false;
  invalidUsername: boolean = false;
  invalidEmail: boolean = false;
  errorMsg: string = '';

  ngOnInit(): void {
    // Limpiar los avisos de error en cuanto el usuario corrige el campo
    this.horizontalStepperForm.get('correo')?.valueChanges.subscribe(() => {
      this.invalidEmail = false;
      this.errorMsg = '';
    });
    this.horizontalStepperForm.get('usuario')?.valueChanges.subscribe(() => {
      this.invalidUsername = false;
    });
  }

  comprobarPassword() {
    const { password, password2 } = this.horizontalStepperForm.value;
    this.invalidPassword = password !== password2;
  }

  comprobarUsuario() {
    const usuario = (this.horizontalStepperForm.value.usuario || '').trim();
    if (!usuario) {
      this.invalidUsername = false;
      return;
    }
    this.api.getUsuarios().subscribe({
      next: (res: any) => {
        this.invalidUsername = Array.isArray(res)
          && res.some((u: any) => (u.username || '').toLowerCase() === usuario.toLowerCase());
      },
      error: () => { this.invalidUsername = false; }
    });
  }

  crearUsuario() {
    if (this.horizontalStepperForm.invalid || this.invalidPassword || this.invalidUsername) return;

    const v = this.horizontalStepperForm.value;

    const body = {
      name: (v.nombre || '').trim(),
      email: (v.correo || '').trim().toLowerCase(),
      username: (v.usuario || '').trim(),
      password: v.password,
      genero: v.genero,
      edad: v.edad,
      nivel_socioeconomico: v.nivel_socioeconomico,
      semestre: v.semestre,
    };

    this.api.registrar(body).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.errorMsg = err.error?.error || 'Error al registrar usuario';
        if (this.errorMsg.includes('correo')) {
          this.invalidEmail = true;
        }
      }
    });
  }

  get f() {
    return this.horizontalStepperForm.controls;
  }
}
