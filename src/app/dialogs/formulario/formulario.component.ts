import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { RestService } from 'src/app/services/rest.service';
import { Subject } from "rxjs";
@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  constructor(public dialgRef: MatDialogRef<FormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string,
    private api: BaseDeDatosService, private restService:RestService) { }

  formularioAtributo = new FormGroup({
    tipoAtributo: new FormControl('', Validators.required),
    nivelAtributo: new FormControl('',Validators.required),
    atributo: new FormControl('', Validators.required),
  })
  formularioFuncion = new FormGroup({
    tipoFuncion: new FormControl('', Validators.required),
    nivelFuncion: new FormControl('', Validators.required),
    funcion: new FormControl('', Validators.required),
  })
  formularioClase = new FormGroup({
    nombre: new FormControl('', Validators.required),
    nivelClase: new FormControl('',Validators.required),
    imagen: new FormControl('', Validators.required),
  })
  formularioHerencia = new FormGroup({
    clases: new FormControl('', Validators.required),
  })
  list = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "String"]
  list2 = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "void", "String"]
  listNivel = ["public", "private", "protected"]
  listNivel2 = ["public", "private"]
  clases: any = []
  private fileTemp: any;
  atributos: any = []
  funciones: any = []
  update$: Subject<any> = new Subject
  bandClase = true
  nameClase = ""
  idClase: number = 0
  idClasePadre: number = 0;
  ngOnInit(): void {
    this.obtenerClases()
  }

  onClickNo() {
    this.dialgRef.close();
  }

  obtenerClases() {
    var idProyect = Number(localStorage.getItem("Id_Proyecto"))
    this.api.getClasesProyectId(idProyect).subscribe({
      next: (res: any) => {
        this.clases = res;
        
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

  crearClase() {
    var idProyect = Number(localStorage.getItem("Id_Proyecto"))
    this.bandClase = false
    const {nivelClase, nombre } = this.formularioClase.value
    this.nameClase = nombre
    this.api.postClase(nivelClase, nombre, this.fileTemp.fileName, idProyect).subscribe({
      next: (res: any) => {
        const body=new FormData();
        body.append('myFile',this.fileTemp.fileRaw,this.fileTemp.fileName)
        this.restService.sendPost(body).subscribe(res=>console.log(res))
      },
      error: () => {

      }
    })
  }

  capturarArchivo($event: any) {
    const [file] = $event.target.files
    this.fileTemp = {
      fileRaw: file,
      fileName: file.name
    }
  }

  agregarAtributo() {
    const {nivelAtributo, tipoAtributo, atributo, nombre } = this.formularioAtributo.value
    this.atributos.push(nivelAtributo + " " + tipoAtributo + " " + atributo)
    this.api.getClasesId(this.nameClase).subscribe({
      next: (res: any) => {
        this.idClase = res[0].id
        this.api.postAtributos(nivelAtributo, atributo, tipoAtributo, this.idClase).subscribe({
          next: (res: any) => { },
          error: () => { }
        })
      },
      error: () => { }
    })

    this.formularioAtributo.reset();
  }

  agregarFuncion() {
    const {nivelFuncion, tipoFuncion, funcion, nombre } = this.formularioFuncion.value
    this.funciones.push(nivelFuncion + " " + tipoFuncion + " " + funcion)
    this.api.getClasesId(this.nameClase).subscribe({
      next: (res: any) => {
        this.idClase = res[0].id
        this.api.postFunciones(nivelFuncion, funcion, tipoFuncion, this.idClase).subscribe({
          next: (res: any) => { },
          error: () => { }
        })
      },
      error: () => { }
    })
    this.formularioFuncion.reset();
  }

  agregarHerencia() {
    const { clases } = this.formularioHerencia.value
    this.api.getClasesId(clases).subscribe({
      next: (res: any) => {
        this.idClasePadre= res[0].id
        this.api.postHerencia(this.idClasePadre,this.idClase).subscribe({
          next:(res:any)=>{
            
          },
          error:()=>{}
        })
      },
      error: () => { }
    })
  }

  reiniciar(){
    location.reload()
  }
}
