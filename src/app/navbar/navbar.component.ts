import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FormularioComponent } from '../dialogs/formulario/formulario.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router, @Inject(DOCUMENT) private document: any, public dialog: MatDialog) { }
  bandLogeo: boolean = false
  bandAreaTrabajo=false
  ngOnInit(): void {
    if (localStorage.getItem("usrTmp") != null) {
      this.bandLogeo = true;
    }
    if(this.document.URL=="http://localhost:4200/area-de-trabajo.component"){
      this.bandAreaTrabajo=true;
    }else{
      this.bandAreaTrabajo=false;
    }
   
  }

  comprobar(){
    document.location.href = "../home"
    if(this.document.URL=="http://localhost:4200/area-de-trabajo.component"){
      this.bandAreaTrabajo=true;
    }else{
      this.bandAreaTrabajo=false;
    }
  }

  cerrarSesion() {
    localStorage.clear()
    document.location.href = "../login"
  }

  abrirCrearClase() {
    
    console.log(this.router.url)
    const dialogRef = this.dialog.open(FormularioComponent, {
      width: '80%',
      height: '80%',
      data: "Formulario"
    });
    dialogRef.afterClosed().subscribe(res => {
      console.log(res);

    });
  }

}
