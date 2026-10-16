import { PoryectosService } from './../../services/poryectos.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmComponent } from '../confirm/confirm.component';
import { SecureStorageService } from 'src/app/services/secure-storage.service';
import { environment } from 'src/environments/environment.prod';
@Component({
  selector: 'app-form-proyect',
  templateUrl: './form-proyect.component.html',
  styleUrls: ['./form-proyect.component.css']
})
export class FormProyectComponent implements OnInit {
  idUsr: any
  bandPost:boolean = false;
  nameProject=""
  formularioProyecto = new FormGroup({
    nombreProyecto: new FormControl('', Validators.required),
    lenguaje: new FormControl('java', [Validators.required])
  })
  
  constructor(public dialgRef: MatDialogRef<FormProyectComponent>,private api: PoryectosService, private router:Router, public dialog: MatDialog, private storage: SecureStorageService) { }

  ngOnInit(): void {
     this.idUsr = this.storage.getItem('Usrid')
  }

  obtenerProyecto(nombre:any, id:any){
    this.api.getProyectoIndividual(nombre, id).subscribe({
      next: (res:any)=>{
        localStorage.setItem("Id_Proyecto", res[0].id.toString())
        localStorage.setItem("Nombre_Proyecto", res[0].nombre)
        this.router.navigate(['/area-de-trabajo.component']);
      }
    })
  }
 

  crearProyecto(){
    const { nombreProyecto, lenguaje } = this.formularioProyecto.value

    this.api.postProyectos(nombreProyecto, this.idUsr, lenguaje).subscribe({
      next: (res:any)=>{
        this.dialog.open(ConfirmComponent,{
          width:'300px',
          data:'El proyecto se creó con éxito. Ya puedes verlo en tu lista de proyectos.'
        })
        // Cerrar con true para indicar que se creó el proyecto
        this.dialgRef.close(true);
      },
      error: () =>{
        this.dialog.open(ConfirmComponent,{
          width:'300px',
          data:'Error al crear el proyecto. Inténtalo de nuevo.'
        })
      }
    })
  }

  checkProyecto(){
    const { nombreProyecto } = this.formularioProyecto.value
    this.nameProject=nombreProyecto
    this.api.getProyectos(this.idUsr).subscribe({
      next: (res:any)=>{
        if(res.length == 0){
          this.bandPost = false;
        }else{
          var band = false;
          res.forEach((element: {nombre:any}) => {
            if(nombreProyecto == element.nombre){
              band = true;
            }
          });

          if(band){
            this.bandPost = true;
          }else{
            this.bandPost = false;
          }

        }
      },

      error: () =>{

      }


    })
  }

}
