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
    tipoAtributo: new FormControl(this.data.tipo, Validators.required),
    atributo: new FormControl(this.data.nombre, Validators.required)
  });
  formulario2 = new FormGroup({
    tipoFuncion: new FormControl(this.data.tipo, Validators.required),
    funcion: new FormControl(this.data.nombre, Validators.required)
  });
  list = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "string"]
  list2 = ["void", "int", "float", "char", "byte", "boolean", "double", "long", "short", "string"]
  bandAtributos = false;
  bandFunciones = false;
  boton: string = ""
  idClase: number=0
  ngOnInit(): void {
    if (this.data.length > 1) {
      if (this.data[1].tipoAgregar == "Funcion") {
        this.bandFunciones = true;
        this.boton = "Agregar"
        this.idClase=this.data[0].identificador
      } else if (this.data[1].tipoAgregar == "Atributo") {
        this.bandAtributos = true;
        this.boton = "Agregar"
        this.idClase=this.data[0].identificador
      }
    } else {
      if (this.data.bandera == "Funcion") {
        this.bandFunciones = true;
        this.boton = "Actualizar"
      } else {
        this.bandAtributos = true;
        this.boton = "Actualizar"
      }
    }

    console.log(this.data)
  }

  onClickNo() {
    this.dialgRef.close();
  }

  editarAtributos() {

    const { tipoAtributo, atributo } = this.formulario.value
    console.log(this.idClase)
   if (this.boton == "Actualizar") {
      this.api.putAtributos(tipoAtributo, atributo, this.data.id).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
        }
      })
    } else {
      this.api.postAtributos(atributo, tipoAtributo, this.idClase).subscribe({
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
    const { tipoFuncion, funcion } = this.formulario2.value
    if (this.boton == "Actualizar") {
      this.api.putFunciones(tipoFuncion, funcion, this.data.id).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
          this.dialgRef.close();
        }
      })
    } else {
      this.api.postFunciones(funcion, tipoFuncion, this.idClase).subscribe({
        next: (res: any) => {
          this.dialgRef.close();
        },
        error: () => {
          this.dialgRef.close();
        }
      })
    }
  }

}