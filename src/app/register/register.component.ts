import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { UsuariosService } from '../services/usuarios.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private api: UsuariosService) { }
  horizontalStepperForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    correo: new FormControl('', Validators.required),
    usuario: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    password2: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
  }

  crearUsuario(){
    const {nombre, correo, usuario, password, password2}= this.horizontalStepperForm.value
    var encriptar=CryptoJS.AES.encrypt(password, "POOGraph").toString()
    this.api.postUsuarios(nombre, correo, usuario,encriptar).subscribe({
      next : (res:any)=>{
        localStorage.setItem("username", usuario)
      },
      error:()=>{

      }
    })
  }

}
