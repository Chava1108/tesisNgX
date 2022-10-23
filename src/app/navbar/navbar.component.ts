import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router : Router,@Inject(DOCUMENT) private document:any) { }
  bandLogeo:boolean=false
  ngOnInit(): void {
    if(localStorage.getItem("usrTmp")!=null){
      this.bandLogeo=true;
    }
  }

  cerrarSesion(){
    localStorage.clear()
    document.location.href="../login"
  }

}
