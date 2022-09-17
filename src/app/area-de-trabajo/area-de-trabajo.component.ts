import { AfterContentInit, Component, ElementRef, OnInit, ViewChild, Renderer2 } from "@angular/core";
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from "rxjs";
import { BaseDeDatosService } from "../services/base-de-datos.service";
import { MatDialog } from '@angular/material/dialog';
import { ShowclassComponent } from "../dialogs/showclass/showclass.component";
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
 
  constructor(renderer2: Renderer2, private ElementRef: ElementRef,private apis: BaseDeDatosService, public dialog: MatDialog) {

  }
  nodos:any
  links:any
  update$: Subject<any> =new Subject
  clases:any=[]
  herencia:any=[]
  atributos:any=[]
  funciones:any=[]
  calculo=12
  i=0
  imagenes:any= []

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
        this.clases.forEach((element: { nombre: any; imagen: string; }) => {
          this.nodos.push({
            id: element.nombre,
            label: element.nombre,
            imagen: "../../assets/imgs/"+element.imagen, 
            atributos:[],
            funciones:[]
          })
        });
        
        this.updateChart()
        console.log(this.nodos)
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

  Showclass(node:any){
    const dialogRef = this.dialog.open(ShowclassComponent, {
      width:'40%',
      height:'70%',
      data: node
    });  
  }
}
