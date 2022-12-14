import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { UsuariosService } from '../services/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private api: UsuariosService, private router: Router) { }
  horizontalStepperForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    correo: new FormControl('', Validators.required),
    usuario: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required,Validators.minLength(2),Validators.maxLength(10),]),
    password2: new FormControl('', [Validators.required,Validators.minLength(2),Validators.maxLength(10),
    ]),
  });
  invalidPassword: boolean = false;
  invalidUsername:boolean=false;
  ngOnInit(): void {
  }

  comprobarPassword() {
    const {password, password2}=this.horizontalStepperForm.value
    if(password!=password2){
      this.invalidPassword=true;
    }else{
      this.invalidPassword=false;
    }
  }

  crearUsuario() {
    const { nombre, correo, usuario, password, password2 } = this.horizontalStepperForm.value
    var encriptar = CryptoJS.AES.encrypt(password, "POOGraph").toString()

    this.api.postUsuarios(nombre, correo, usuario, encriptar).subscribe({
      next: (res: any) => {
        this.router.navigate(['/login']);
      },
      error: () => {

      }
    })
  }

  comprobarUsuario(){
    const {usuario}=this.horizontalStepperForm.value

    this.api.getUsuarios().subscribe({
      next: (res:any)=>{
        var band=0;
        res.forEach((element:{username:any}) => {
          console.log(element)
          if(usuario==element.username){
            this.invalidUsername=true;
            band=1;
          }          
        });
        if(band==0){
          this.invalidUsername=false;
        }
      }
    })
  }
}
