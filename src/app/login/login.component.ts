import { UsuariosService } from './../services/usuarios.service';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { Router,ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  bandLogin: boolean = false;
  userID: number = 0
  bandError: boolean = false;
  logIn: any;
  constructor(private api: UsuariosService, @Inject(DOCUMENT) private document:any,private router: Router) { }

  ngOnInit(): void {
    this.logIn = new FormGroup({
      usrName: new FormControl('', [
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

   validateUser(){
    const values = this.logIn.getRawValue();
    var passDesncypt= ""
     this.api.getUsuarios().subscribe({
       next: (res:any)=>{
         console.log(res);
         res.forEach((element: {id:any, username:any , password:any}) => {
          passDesncypt = CryptoJS.AES.decrypt(element.password,"POOGraph").toString(CryptoJS.enc.Utf8)
          if(values.usrName == element.username && values.passwd == passDesncypt){
              this.bandLogin = true
              this.userID = element.id
            }
         });

        if(this.bandLogin){
          localStorage.clear();
          this.guardarEnStorage(values)
        }else{
         this.bandError = true
        }

       },

       error: ()=>{
       }
     })

    
  }

  guardarEnStorage(values: any){
    if(localStorage.getItem('usrTmp')) {
      localStorage.removeItem('usrTmp'); 
      localStorage.setItem('usrTmp', values.usrName);
    } else {
      localStorage.setItem('usrTmp', values.usrName);
    }

    if(localStorage.getItem('Usrid')) {
      localStorage.removeItem('Usrid'); 
      localStorage.setItem('Usrid', this.userID.toString());
    } else {
      localStorage.setItem('Usrid', this.userID.toString());
    }

    document.location.href="../home"

  }

}
