import { PrismService } from './../service/prism.service';
import {
  AfterContentInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { BaseDeDatosService } from '../services/base-de-datos.service';
import { CodeService } from '../services/code.service';
import { MatDialog } from '@angular/material/dialog';
import { ShowclassComponent } from '../dialogs/showclass/showclass.component';
import { Node, Edge, ClusterNode } from '@swimlane/ngx-graph';
import { ThisReceiver } from '@angular/compiler';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-area-de-trabajo',
  templateUrl: './area-de-trabajo.component.html',
  styleUrls: ['./area-detrabajo-component.scss'],
})
export class AreaDeTrabajoComponent implements OnInit {
  @ViewChild('codeContent', { static: true })
  codeContent!: ElementRef;
  @ViewChild('pre', { static: true })
  pre!: ElementRef;

  sub!: Subscription;
  highlighted = false;
  codeType = 'java';
  bandCode = 0;
  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required),
  });

  public layoutSettings = {
    orientation: 'TB',
  };

  constructor(
    private renderer: Renderer2,
    private ElementRef: ElementRef,
    private apis: BaseDeDatosService,
    private apiCode: CodeService,
    public dialog: MatDialog,
    private primsmService: PrismService,
    private fb: FormBuilder
  ) {}
  nombrePadre = '';
  nombreHijo = '';
  nodos: any;
  links: any;
  update$: Subject<any> = new Subject();
  clases: any = [];
  herencia: any = [];
  atributos: any = [];
  funciones: any = [];
  calculo = 12;
  i = 0;
  imagenes: any = [];

  //valores del proyecto
  idProyect: number = 0;
  nameProyect: any;

  form = this.fb.group({
    content: '',
  });

  get contentControl() {
    return this.form.get('content');
  }

  text =
    ' Bienvenidos a POOGraph \n La Programación Orientada a objetos permite que el \n código sea reutilizable, organizado y fácil de mantener \n  En este sitio podras personalizar tus diagramas para \n trabajar con POO, es ideal por si';
  aributosHeredados: any = [];
  ngOnInit(): void {
    this.idProyect = Number(localStorage.getItem('Id_Proyecto'));
    this.nameProyect = localStorage.getItem('Nombre_Proyecto');

    this.nodos = [];
    this.links = [];
    this.getClase();
    this.getAtributos();
    this.getFunciones();
    this.listenForm();
  }

  getClase() {
    this.apis.getClasesProyectId(this.idProyect).subscribe({
      next: (res: any) => {
        this.clases = res;
        if (this.clases.length > 0) {
          this.clases.forEach(
            (element: { id: any; nombre: any; imagen: string }) => {
              this.nodos.push({
                id: element.nombre,
                label: element.nombre,
                imagen: 'http://localhost:9000/' + element.imagen,
                atributos: [],
                funciones: [],
                identificador: element.id,
              });
            }
          );
        }
        this.updateChart();
        this.getHerencia();
      },
      error: () => {},
    });
  }

  getHerencia() {
    this.apis.getHerencia().subscribe({
      next: (res: any) => {
        this.herencia = res;
        this.herencia.forEach((element: { Padre: any; Hijo: any }) => {
          var bandF=true;
          if (this.clases.length > 0) {
            this.clases.forEach((element2: { nombre: any }) => {
              if (
                (element2.nombre == element.Padre ||
                element2.nombre == element.Hijo) && bandF
              ) {
                bandF=false
                this.links.push({
                  id: element.Padre + element.Hijo,
                  source: element.Padre,
                  target: element.Hijo,
                  label: 'Es padre de',
                });
                
              }
            });
          }
        });
        this.updateChart();
      },
      error: () => {},
    });
  }

  getAtributos() {
    var aux: any = [];
    this.apis.getAtributos().subscribe({
      next: (res: any) => {
        this.atributos = res;
        this.atributos.forEach(
          (atributo: {
            id: any;
            nombre: any;
            nivel: String;
            tipo: string;
            atributos: string;
          }) => {
            this.nodos.forEach(
              (nodo: { identificador: any; label: any; atributos: any }) => {
                if (nodo.label == atributo.nombre) {
                  nodo.atributos.push({
                    id: atributo.id,
                    nivel: atributo.nivel,
                    tipo: atributo.tipo,
                    nombre: atributo.atributos,
                    bandera: 'Atributo',
                    id_Clase: nodo.identificador,
                  });
                }
              }
            );
          }
        );
      },
      error: () => {},
    });
  }

  getFunciones() {
    this.apis.getFunciones().subscribe({
      next: (res: any) => {
        this.funciones = res;
        this.funciones.forEach(
          (funcion: {
            id: any;
            nivel: any;
            nombre: any;
            tipo: string;
            funciones: string;
          }) => {
            this.nodos.forEach(
              (nodo: { identificador: any; label: any; funciones: any }) => {
                if (nodo.label == funcion.nombre) {
                  nodo.funciones.push({
                    id: funcion.id,
                    nivel: funcion.nivel,
                    tipo: funcion.tipo,
                    nombre: funcion.funciones,
                    bandera: 'Funcion',
                    id_Clase: nodo.identificador,
                  });
                }
              }
            );
          }
        );
      },
      error: () => {},
    });
  }

  updateChart() {
    this.update$.next(true);
  }

  Showclass(node: any) {
    const dialogRef = this.dialog.open(ShowclassComponent, {
      width: '40%',
      height: '75%',
      data: node,
    });
    dialogRef.afterClosed().subscribe((res) => {
      location.reload()
    });
  }

  Showcode(node: any) {
    this.bandCode = 1;
    var atributosCadena = '';
    var funcionesCadena = '';
    var atributosConstructor = '';
    var igualacionesConstructor = '';
    var contA = 0;
    
    node.atributos.forEach(
      (element: { nivel: any; tipo: any; nombre: any }) => {
        atributosCadena +=
          '&nbsp;' +
          '&nbsp;' +
          '&nbsp;' +
          element.nivel +
          ' ' +
          element.tipo +
          ' ' +
          element.nombre +
          '; \n';
        if (contA < node.atributos.length - 1) {
          atributosConstructor += element.tipo + ' ' + element.nombre + ', ';
          igualacionesConstructor +=
            '&nbsp;' +
            '&nbsp;' +
            '&nbsp;&nbsp;&nbsp;&nbsp;' +
            'this.' +
            element.nombre +
            ' = ' +
            element.nombre +
            ';\n';
          contA++;
        } else {
          atributosConstructor += element.tipo + ' ' + element.nombre;
          igualacionesConstructor +=
            '&nbsp;' +
            '&nbsp;' +
            '&nbsp;&nbsp;&nbsp;&nbsp;' +
            'this.' +
            element.nombre +
            ' = ' +
            element.nombre +
            ';';
        }
      }
    );
    contA = 0;
    var extendsPadre = '';
    if (this.aributosHeredados.length > 0) {
      atributosConstructor += ', ';
      extendsPadre = ' extends ' + this.aributosHeredados[0].Padre;
      this.aributosHeredados.forEach((element: { nombre: any; tipo: any }) => {
        if (contA < this.aributosHeredados.length - 1) {
          atributosConstructor += element.tipo + ' ' + element.nombre + ', ';
          contA++;
        } else {
          atributosConstructor += element.tipo + ' ' + element.nombre;
        }
      });
    }
    node.funciones.forEach(
      (element: { nivel: any; tipo: any; nombre: any }) => {
        funcionesCadena +=
          '&nbsp;' +
          '&nbsp;' +
          '&nbsp;' +
          element.nivel +
          ' ' +
          element.tipo +
          ' ' +
          element.nombre +
          '{ \n' +
          '&nbsp;&nbsp;&nbsp;//Código de la funcion ' +
          '\n &nbsp;&nbsp;&nbsp;} \n';
      }
    );

    var superAtributos = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;super(';
    contA = 0;
    if (this.aributosHeredados.length > 0) {
      this.aributosHeredados.forEach((element: { Padre: any; nombre: any }) => {
        superAtributos += element.nombre + ',';
      });
    }
    superAtributos = superAtributos.slice(0, -1);
    superAtributos += '); \n';
    var bandSuper = '';
    if (this.aributosHeredados.length > 0) {
      bandSuper = superAtributos;
    }
    var constructor =
      '&nbsp;&nbsp;&nbsp;public ' +
      node.id +
      '(' +
      atributosConstructor +
      '){ \n' +
      bandSuper +
      igualacionesConstructor +
      '  \n &nbsp;&nbsp;&nbsp;}';
    this.text =
      ' class ' +
      node.id +
      extendsPadre +
      ' { ' +
      ' \n &nbsp;&nbsp//Atributos \n' +
      atributosCadena +
      '\n' +
      constructor +
      '\n &nbsp;&nbsp;//Funciones \n' +
      funcionesCadena +
      ' \n' +
      ' }';
    //const modifiedContent = this.primsmService.convertHtmlIntoString(this.text);

    this.renderer.setProperty(
      this.codeContent.nativeElement,
      'innerHTML',
      this.text
    );

    this.highlighted = true;
  }

  ngAfterViewInit() {
    this.primsmService.highlightAll();
  }

  ngAfterViewChecked() {
    if (this.highlighted) {
      this.primsmService.highlightAll();
      this.highlighted = false;
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private listenForm() {
    this.sub = this.form.valueChanges.subscribe((val) => {
      const modifiedContent = this.primsmService.convertHtmlIntoString(
        val.content
      );

      this.renderer.setProperty(
        this.codeContent.nativeElement,
        'innerHTML',
        modifiedContent
      );

      this.highlighted = true;
    });
  }

  reinicio(nombre: any, nodo: any) {
    this.aributosHeredados = [];
    if (this.links.length == 0) {
      this.Showcode(nodo);
    } else {
      this.getAtributosHeredados(nombre, nodo);
    }
  }

  getAtributosHeredados(nombre: any, nodo: any) {
    console.log(this.links)
    this.links.forEach((element: { target: any; source: any }) => {
      if (element.target == nombre) {
        this.nombrePadre = element.source;
        this.nombreHijo = element.target;
        this.apis.getClasesId(this.nombreHijo).subscribe({
          next: (res: any) => {
            this.apis.getAtributosHeredos(res[0].id).subscribe({
              next: (res: any) => {
                this.aributosHeredados = this.aributosHeredados.concat(res[0]);
                console.log(this.aributosHeredados)
                this.getAtributosHeredados(this.nombrePadre, nodo);
                this.Showcode(nodo);
              },
            });
          },
        });
      } else {
        this.Showcode(nodo);
      }
    });
  }
}
