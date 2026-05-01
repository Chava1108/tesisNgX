import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { RestService } from 'src/app/services/rest.service';
import { MatDialog } from '@angular/material/dialog';
import { SecureStorageService } from 'src/app/services/secure-storage.service';

@Component({
  selector: 'app-editar-formulario',
  templateUrl: './editar-formulario.component.html',
  styleUrls: ['./editar-formulario.component.css']
})
export class EditarFormularioComponent implements OnInit {

  constructor(public dialgRef: MatDialogRef<EditarFormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, @Inject(MAT_DIALOG_DATA) public id: any,
    private api: BaseDeDatosService, private restService: RestService, private storage: SecureStorageService) { }

  formulario = new FormGroup({
    nivelAtributo: new FormControl(this.data.item.nivel, Validators.required),
    tipoAtributo: new FormControl(this.data.item.tipo, Validators.required),
    atributo: new FormControl(this.data.item.nombre, Validators.required)
  });
  formulario2 = new FormGroup({
    nivelFuncion: new FormControl(this.data.item.nivel, Validators.required),
    tipoFuncion: new FormControl(this.data.item.tipo, Validators.required),
    funcion: new FormControl(this.data.item.nombre, Validators.required)
  });
  formularioHerencia = new FormGroup({
    clasePadre: new FormControl('', Validators.required),
  });
  list: string[] = []
  list2: string[] = []
  listNivel = ["public", "private", "protected"]
  listNivel2 = ["public", "private", "protected"]
  bandAtributos = false;
  bandFunciones = false;
  bandHerencia = false;
  boton: string = ""
  idClase: number=0
  clases: any
  datos: any = []
  lenguaje: string = 'java';

  private tiposJava = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "String"];
  private tiposJava2 = ["void", "int", "float", "char", "byte", "boolean", "double", "long", "short", "String"];
  private tiposCpp = ["int", "float", "char", "bool", "double", "long", "short", "string", "unsigned int", "long long", "auto"];
  private tiposCpp2 = ["void", "int", "float", "char", "bool", "double", "long", "short", "string", "unsigned int", "long long", "auto"];

  ngOnInit(): void {
    this.lenguaje = this.storage.getItem('lenguajeActual') || 'java';
    this.actualizarTipos();
    this.datos = this.data.item
    this.boton = "Agregar"
    if ('tipoAgregar' in this.data) {
      if (this.data.tipoAgregar == "Funcion") {
        this.bandFunciones = true;
        this.idClase = this.datos.identificador;
      } else if (this.data.tipoAgregar == "Atributo") {
        this.bandAtributos = true;
        this.idClase = this.datos.identificador;
      } else if (this.data.tipoAgregar == "Herencia") {
        this.bandHerencia = true;
        this.idClase = this.datos.identificador;
      }
    }
    this.obtenerClases()
  }

  onClickNo() {
    this.dialgRef.close();
  }

  editarAtributos() {
    const {nivelAtributo, tipoAtributo, atributo } = this.formulario.value
    this.api.postAtributos(nivelAtributo, atributo, tipoAtributo, this.idClase).subscribe({
      next: (res: any) => {
        this.dialgRef.close();
      },
      error: () => {
        console.log("Agregar Atributo ERROR")
      }
    })
  }

  editarFunciones() {
    const {nivelFuncion, tipoFuncion, funcion } = this.formulario2.value
    this.api.postFunciones(nivelFuncion, funcion, tipoFuncion, this.idClase).subscribe({
      next: (res: any) => {
        this.dialgRef.close();
      },
      error: () => {
        this.dialgRef.close();
      }
    })
  }

  obtenerClases() {
    var idProyect = Number(this.storage.getItem("Id_Proyecto"))
    this.api.getClasesProyectId(idProyect).subscribe({
      next: (res: any) => {
        // Filtrar la clase actual para no heredar de sí misma
        this.clases = res.filter((c: any) => c.id !== this.idClase);
        
        console.log(this.clases)
        res.forEach((element: {nombre:any} )=> {
          this.list.push(element.nombre)
          this.list2.push(element.nombre)
        });
      },
      error: () => {

      }
    });
  }

  actualizarTipos() {
    if (this.lenguaje === 'cpp') {
      this.list = [...this.tiposCpp];
      this.list2 = [...this.tiposCpp2];
    } else {
      this.list = [...this.tiposJava];
      this.list2 = [...this.tiposJava2];
    }
  }

  eliminarFunciones(){

  }

  eliminarAtributos(){

  }

  agregarHerencia() {
    const { clasePadre } = this.formularioHerencia.value;
    if (!clasePadre || !this.idClase) return;
    this.api.postHerencia(this.idClase, clasePadre).subscribe({
      next: (res: any) => {
        console.log('Herencia agregada:', res);
        this.dialgRef.close();
      },
      error: (err: any) => {
        console.error('Error agregando herencia:', err);
        this.dialgRef.close();
      }
    });
  }
}
