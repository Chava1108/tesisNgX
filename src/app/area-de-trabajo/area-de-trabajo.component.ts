import { AfterContentInit, Component, ElementRef, OnInit, ViewChild, Renderer2 } from "@angular/core";
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from "rxjs";
import { BaseDeDatosService } from "../services/base-de-datos.service";
import { Node, Edge, ClusterNode } from '@swimlane/ngx-graph';
import { ThisReceiver } from "@angular/compiler";

@Component({
  selector: 'app-area-de-trabajo',
  templateUrl: './area-de-trabajo.component.html',
  styleUrls: ['./area-de-trabajo.component.css'],
  
})
export class AreaDeTrabajoComponent implements OnInit{ 

  
  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required)
  });

  public layoutSettings={
   orientation : 'TB'
  };
 
  constructor(renderer2: Renderer2, private ElementRef: ElementRef,private apis: BaseDeDatosService) {

  }
  nodos:any
  links:any
  update$: Subject<any> =new Subject
  clases:any=[]
  herencia:any=[]
  atributos:any=[]
  funciones:any=[]
  calculo=12
  ngOnInit(): void {
    this.nodos=[]
    this.links=[]
    this.getClase()
    this.getHerencia()
    this.getAtributos()
    this.getFunciones()
  }

  getClase() {
    this.apis.getClases().subscribe({
      next: (res: any) => {
        this.clases=res;
        this.clases.forEach((element: { nombre: any; }) => {
          this.nodos.push({
            id: element.nombre,
            label: element.nombre,
            atributos:[],
            funciones:[]
          })
        });
        
        this.updateChart()
      },
      error: () => {

      }
    });

  }

  getHerencia() {
    this.apis.getHerencia().subscribe({
      next: (res: any) => {
        this.herencia=res;
        this.herencia.forEach((element: { Padre: any; Hijo:any }) => {
          this.links.push({
            id: element.Padre+element.Hijo,
            source: element.Padre,
            target: element.Hijo,
            label: 'Es padre de'
          })
        });
        this.updateChart()
      },
      error: () => {

      }
    });

  }

  getAtributos() {
    var aux:any=[]
    this.apis.getAtributos().subscribe({
      next: (res: any) => {
        this.atributos=res;
        this.atributos.forEach((atributo: { nombre: any; tipo: string; atributos: string; }) => {
          this.nodos.forEach((nodo: { label: any; atributos: any; }) => {
            if (nodo.label==atributo.nombre){
              nodo.atributos.push(atributo.tipo+" "+atributo.atributos)
            }
          });
        });
        
        console.log(this.nodos)
      },
      error: () => {

      }
    });

  }

  getFunciones() {
    this.apis.getFunciones().subscribe({
      next: (res: any) => {
        this.funciones=res;
        this.funciones.forEach((funcion: { nombre: any; tipo: string; funciones: string; }) => {
          this.nodos.forEach((nodo: { label: any; funciones: any; }) => {
            if (nodo.label==funcion.nombre){
              nodo.funciones.push(funcion.tipo+" "+funcion.funciones)
            }
          });
        });
        console.log(this.funciones)
      },
      error: () => {

      }
    });

  }

  updateChart(){
    this.update$.next(true)
  }

  agregarNodo(){
    this.nodos.push({
      id: 'iu',
      label: 'J'
    })
    this.updateChart()
  }

  imprimir(node:any){
    console.log(node)
  }
}
