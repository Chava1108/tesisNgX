import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  bandLogIn: boolean = false;
  logIn: any;
  constructor() { }

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
        Validators.maxLength(10),
      ]),
    });
  }

}
