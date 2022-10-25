import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormProyectComponent } from '../dialogs/form-proyect/form-proyect.component';
import { PoryectosService } from '../services/poryectos.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public dialog: MatDialog, private apis: PoryectosService, private router: Router) { }
  username:any
  id:any
  proyectos:any
  ngOnInit(): void {
   this.username= localStorage.getItem("usrTmp")
   this.id=localStorage.getItem("Usrid");
   this.obtenerProyectos()
  }

  obtenerProyectos(){
    this.apis.getProyectos(this.id).subscribe({
      next:(res:any)=>{
        this.proyectos=res
      }
    })
  }

  openProyect(proyect: any){
    console.log(proyect)
    localStorage.setItem("Id_Proyecto", proyect.id)
    localStorage.setItem("Nombre_Proyecto", proyect.nombre)
    this.router.navigate(["/area-de-trabajo.component"])
  }

  openDialog(){
    const formDialog = this.dialog.open(FormProyectComponent, {
      width: '50%' ,
      height: '50%'
    });
  }

}
