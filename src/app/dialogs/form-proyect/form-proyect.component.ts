import { PoryectosService } from './../../services/poryectos.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-proyect',
  templateUrl: './form-proyect.component.html',
  styleUrls: ['./form-proyect.component.css']
})
export class FormProyectComponent implements OnInit {
  idUsr: any
  bandPost:boolean = false;
  formularioProyecto = new FormGroup({
    nombreProyecto: new FormControl('', Validators.required)
  })
  
  constructor(private api: PoryectosService, private router:Router) { }

  ngOnInit(): void {
     this.idUsr = localStorage.getItem('Usrid')
  }

  obtenerProyecto(nombre:any, id:any){
    this.api.getProyectoIndividual(nombre, id).subscribe({
      next: (res:any)=>{
        localStorage.setItem("Id_Proyecto", res[0].id.toString())
        localStorage.setItem("Nombre_Proyecto", res[0].nombre)
        this.router.navigate(["/area-de-trabajo.component"])
      }
    })
  }
 

  crearProyecto(){
   
  
    const { nombreProyecto } = this.formularioProyecto.value

    this.api.postProyectos(nombreProyecto, this.idUsr).subscribe({
      next: (res:any)=>{
        this.obtenerProyecto(nombreProyecto, this.idUsr)
      },
      error: () =>{

      }
    })
  }

  checkProyecto(){
    const { nombreProyecto } = this.formularioProyecto.value
    this.api.getProyectos(this.idUsr).subscribe({
      next: (res:any)=>{
        if(res.length == 0){
          this.bandPost = false;
        }else{
          var band = false;
          console.log(res);
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
