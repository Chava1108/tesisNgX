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

  constructor(public dialog: MatDialog, private apis: PoryectosService) { }
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

  openDialog(){
    const formDialog = this.dialog.open(FormProyectComponent, {
      width: '50%' ,
      height: '50%'
    });
  }

}
