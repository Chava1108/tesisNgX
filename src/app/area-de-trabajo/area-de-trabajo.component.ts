import { PrismService } from './../service/prism.service';
import { AfterContentInit, Component, ElementRef, OnInit, ViewChild, Renderer2 } from "@angular/core";
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from "rxjs";
import { BaseDeDatosService } from "../services/base-de-datos.service";
import { CodeService } from "../services/code.service";
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from "rxjs";
import { ShowclassComponent } from "../dialogs/showclass/showclass.component";
import { Node, Edge, ClusterNode } from '@swimlane/ngx-graph';
import { ThisReceiver } from "@angular/compiler";


@Component({
  selector: 'app-area-de-trabajo',
  templateUrl: './area-de-trabajo.component.html',
  styleUrls: ['./area-detrabajo-component.scss'],

})
export class AreaDeTrabajoComponent implements OnInit {


  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required)
  });

  public layoutSettings = {
    orientation: 'TB'
  };

  constructor(renderer2: Renderer2, private ElementRef: ElementRef,
    private apis: BaseDeDatosService,private apiCode:CodeService, public dialog: MatDialog,
    private primsmService: PrismService, private fb: FormBuilder) {

  }
  nodos: any
  links: any
  update$: Subject<any> = new Subject
  clases: any = []
  herencia: any = []
  atributos: any = []
  funciones: any = []
  calculo = 12
  i = 0
  imagenes: any = []
  sub!: Subscription;
  highlighted = false;
  codeType = 'javascript';

  form = this.fb.group({
    content: ''
  });

  get contentControl() {
    return this.form.get('content');
  }

  text = `<h1>hello world</h1>`

  ngOnInit(): void {
    this.nodos = []
    this.links = []
    this.getClase()
    this.getHerencia()
    this.getAtributos()
    this.getFunciones()
  }

  getClase() {
    this.apis.getClases().subscribe({
      next: (res: any) => {
        this.clases = res;
        this.clases.forEach((element: { id: any; nombre: any; imagen: string; }) => {
          this.nodos.push({
            id: element.nombre,
            label: element.nombre,
            imagen: "http://localhost:9000/" + element.imagen,
            atributos: [],
            funciones: [],
            identificador: element.id
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
        this.herencia = res;
        this.herencia.forEach((element: { Padre: any; Hijo: any }) => {
          this.links.push({
            id: element.Padre + element.Hijo,
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
    var aux: any = []
    this.apis.getAtributos().subscribe({
      next: (res: any) => {
        this.atributos = res;
        this.atributos.forEach((atributo: { id: any; nombre: any; nivel: String; tipo: string; atributos: string; }) => {
          this.nodos.forEach((nodo: {
            identificador: any; label: any; atributos: any; }) => {
            if (nodo.label == atributo.nombre) {
              nodo.atributos.push({ id: atributo.id, nivel:atributo.nivel, tipo: atributo.tipo, nombre: atributo.atributos, bandera:"Atributo", id_Clase:nodo.identificador })
            }
          });
        });
      },
      error: () => {

      }
    });

  }

  getFunciones() {
    this.apis.getFunciones().subscribe({
      next: (res: any) => {
        this.funciones = res;
        this.funciones.forEach((funcion: { id: any; nivel:any; nombre: any; tipo: string; funciones: string; }) => {
          this.nodos.forEach((nodo: {
            identificador: any; label: any; funciones: any;    
          }) => {
            if (nodo.label == funcion.nombre) {
              nodo.funciones.push({ id: funcion.id, nivel:funcion.nivel, tipo: funcion.tipo, nombre: funcion.funciones, bandera:"Funcion", id_Clase:nodo.identificador  })
            }
          });
        });
      },
      error: () => {

      }
    });

  }

  updateChart() {
    this.update$.next(true)
  }

  Showclass(node: any) {
    const dialogRef = this.dialog.open(ShowclassComponent, {
      width: '40%',
      height: '75%',
      data: node
    });
    dialogRef.afterClosed().subscribe(res => {
      this.nodos = []
      this.links = []
      this.getClase()
      this.getHerencia()
      this.getAtributos()
      this.getFunciones()
    });
  }

  Showcode(node:any){
    console.log(node)
    var atributosCadena=""
    var funcionesCadena=""
    node.atributos.forEach((element: {nivel:any; tipo:any; nombre:any}) => {
      atributosCadena+= element.nivel+" "+element.tipo+" "+element.nombre+";"
    });
    node.funciones.forEach((element: {nivel:any; tipo:any; nombre:any}) => {
      funcionesCadena+= element.nivel+" "+element.tipo+" "+element.nombre+";"
    });
    var code=" class "+node.id+" {/n" + atributosCadena +funcionesCadena+"/n}"
    console.log(code)
    this.apiCode.postCode(code,1,"j","native").subscribe({
      next: (res: any) => {
        console.log(res)
      },
    })
  }
}
