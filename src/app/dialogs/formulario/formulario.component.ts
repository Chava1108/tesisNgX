import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { Subject } from "rxjs";
@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  constructor(public dialgRef:MatDialogRef<FormularioComponent>,
     @Inject(MAT_DIALOG_DATA) public message:string,
      private  api: BaseDeDatosService) { }
  public layoutSettings={
        orientation : 'TB'
  };
  formulario = new FormGroup({
    nombre: new FormControl('', Validators.required),
    tipoAtributo: new FormControl('', Validators.required),
    atributo: new FormControl('', Validators.required),
    tipoFuncion:new FormControl('', Validators.required),
    funcion:new FormControl('',Validators.required),
    clases:new FormControl('',Validators.required),
  })
  list=["int", "float","char","byte","boolean","double","long","short"]
  list2=["int", "float","char","byte","boolean","double","long","short","void"]
  clases:any=[]
  nodos:any=[]
  links:any=[]
  update$: Subject<any> =new Subject
  bandClase=true
  ngOnInit(): void {
    this.obtenerClases()
  }

  onClickNo(){
    this.dialgRef.close();
  }

  obtenerClases(){
    this.api.getClases().subscribe({
      next: (res: any) => {
        this.clases=res;
        console.log(this.clases)
      },
      error: () => {

      }
    });
  }

  crearClase(){
    this.bandClase=false
    const {nombre} = this.formulario.value
    console.log(nombre)
    this.nodos.push({
      id: nombre,
      label: nombre,
      atributos:[],
      funciones:[]
    })
    this.updateChart()
  }

  updateChart(){
    this.update$.next(true)
  }

  agregarAtributo(){
    const {tipoAtributo,atributo,nombre}=this.formulario.value

    this.nodos.forEach((nodo: { label: any; atributos: any; }) => {
      if (nodo.label==nombre){
        nodo.atributos.push(tipoAtributo+" "+atributo)
      }
    });
  }

  agregarFuncion(){
    const {tipoFuncion,funcion,nombre}=this.formulario.value

    this.nodos.forEach((nodo: { label: any; funciones: any; }) => {
      if (nodo.label==nombre){
        nodo.funciones.push(tipoFuncion+" "+funcion)
      }
    });
  }

  agregarHerencia(){
    const {nombre,clases}=this.formulario.value
    
    this.nodos.push({
      id: clases,
      label: clases,
      atributos:[],
      funciones:[]
    })
    this.links.push({
      id: clases+nombre,
      source: clases,
      target: nombre,
      label: 'Es padre de'
    })
    this.updateChart()
  }
}
