import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { RestService } from 'src/app/services/rest.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-formulario',
  templateUrl: './editar-formulario.component.html',
  styleUrls: ['./editar-formulario.component.css']
})
export class EditarFormularioComponent implements OnInit {

  constructor(public dialgRef: MatDialogRef<EditarFormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, @Inject(MAT_DIALOG_DATA) public id: any,
    private api: BaseDeDatosService, private restService: RestService) { }

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
  list = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "String"]
  list2 = ["void", "int", "float", "char", "byte", "boolean", "double", "long", "short", "String"]
  listNivel = ["public", "private", "protected"]
  listNivel2 = ["public", "private"]
  bandAtributos = false;
  bandFunciones = false;
  boton: string = ""
  idClase: number=0
  clases: any
  datos: any = []
  ngOnInit(): void {
    this.datos = this.data.item
    console.log(this.datos)
    if ('tipoAgregar' in  this.data) {
      if (this.data.tipoAgregar == "Funcion") {
        this.bandFunciones = true;
        this.boton = "Agregar"
        this.idClase=this.datos.identificador
      } else if (this.data.tipoAgregar == "Atributo") {
        this.bandAtributos = true;
        this.boton = "Agregar"
        this.idClase=this.datos.identificador
      }
    } else {
      if (this.data.bandera == "Funciones") {
        this.bandFunciones = true;
        this.boton = "Actualizar"
      } else {
        this.bandAtributos = true;
        this.boton = "Actualizar"
      }
    }
    this.obtenerClases()

  }

  onClickNo() {
    this.dialgRef.close();
  }

  editarAtributos() {
    const {nivelAtributo, tipoAtributo, atributo } = this.formulario.value
    console.log(this.idClase)
    console.log(this.datos);
   if (this.boton == "Actualizar") {
      this.api.putAtributos(nivelAtributo, tipoAtributo, atributo, this.datos.id).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
        }
      })
    } else {
      this.api.postAtributos(nivelAtributo, atributo, tipoAtributo, this.idClase).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
          console.log("Agregar Funcion ERROR")
        }
      })
    }

  }

  editarFunciones() {
    const {nivelFuncion, tipoFuncion, funcion } = this.formulario2.value
    if (this.boton == "Actualizar") {
      console.log(this.data)
      this.api.putFunciones(nivelFuncion, tipoFuncion, funcion, this.datos.id).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
          this.dialgRef.close();
        }
      })
    } else {
      this.api.postFunciones(nivelFuncion, funcion, tipoFuncion, this.idClase).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
          this.dialgRef.close();
        }
      })
    }
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

  eliminarFunciones(){

  }

  eliminarAtributos(){

  }

}
