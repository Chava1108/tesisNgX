import { PoryectosService } from './../../services/poryectos.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';


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
  
  constructor(private api: PoryectosService) { }

  ngOnInit(): void {
     this.idUsr = localStorage.getItem('Usrid')
  }

 

  crearProyecto(){
   
  
    const { nombreProyecto } = this.formularioProyecto.value

    this.api.postProyectos(nombreProyecto, this.idUsr).subscribe({
      next: (res:any)=>{
        if(res.length == 0){
          this.bandPost = true;
        }
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
