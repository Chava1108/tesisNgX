import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { RestService } from 'src/app/services/rest.service';
import { Subject } from "rxjs";
import { SecureStorageService } from 'src/app/services/secure-storage.service';
@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {

  constructor(public dialgRef: MatDialogRef<FormularioComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string,
    private api: BaseDeDatosService, private restService:RestService, private storage: SecureStorageService) { }

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
  list: string[] = []
  list2: string[] = []
  listNivel = ["public", "private", "protected"]
  listNivel2 = ["public", "private", "protected"]
  clases: any = []
  private fileTemp: any;
  atributos: any = []
  funciones: any = []
  update$: Subject<any> = new Subject
  bandClase = true
  bandExistClass = false;
  nameClase = ""
  idClase: number = 0
  idClasePadre: number = 0;
  lenguaje: string = 'java';

  private tiposJava = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "String"];
  private tiposJava2 = ["int", "float", "char", "byte", "boolean", "double", "long", "short", "void", "String"];
  private tiposCpp = ["int", "float", "char", "bool", "double", "long", "short", "string", "unsigned int", "long long", "auto"];
  private tiposCpp2 = ["void", "int", "float", "char", "bool", "double", "long", "short", "string", "unsigned int", "long long", "auto"];

  ngOnInit(): void {
    this.lenguaje = this.storage.getItem('lenguajeActual') || 'java';
    this.actualizarTipos();
    this.obtenerClases();
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

  onClickNo() {
    this.dialgRef.close();
  }

  obtenerClases() {
    var idProyect = Number(this.storage.getItem("Id_Proyecto"))
    this.api.getClasesProyectId(idProyect).subscribe({
      next: (res: any) => {
        this.clases = res;
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
    var idProyect = Number(this.storage.getItem("Id_Proyecto"))
    var usrTemp = this.storage.getItem("usrTmp")+""
    var usrId = Number(this.storage.getItem("Usrid"))
    const {nivelClase, nombre } = this.formularioClase.value
    this.nameClase = nombre
    var nameFile=nombre+usrTemp+idProyect+"."+this.fileTemp.fileName.split('.').pop();
    this.bandExistClass = false;
    this.api.postClase(nivelClase, nombre, nameFile, idProyect, usrId).subscribe({
      next: (res: any) => {
        this.idClase = res.id;
        this.bandClase = false;
        const body=new FormData();
        body.append('myFile',this.fileTemp.fileRaw,nameFile)
        this.restService.sendPost(body).subscribe(res=>console.log(res))
      },
      error: (err:any) => {
        console.log(err)
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
    const {nivelAtributo, tipoAtributo, atributo } = this.formularioAtributo.value
    this.atributos.push(nivelAtributo + " " + tipoAtributo + " " + atributo)
    this.api.postAtributos(nivelAtributo, atributo, tipoAtributo, this.idClase).subscribe({
      next: (res: any) => { console.log('Atributo agregado:', res); },
      error: (err: any) => { console.error('Error agregando atributo:', err); }
    });
    this.formularioAtributo.reset();
  }

  agregarFuncion() {
    const {nivelFuncion, tipoFuncion, funcion } = this.formularioFuncion.value
    this.funciones.push(nivelFuncion + " " + tipoFuncion + " " + funcion)
    this.api.postFunciones(nivelFuncion, funcion, tipoFuncion, this.idClase).subscribe({
      next: (res: any) => { console.log('Función agregada:', res); },
      error: (err: any) => { console.error('Error agregando función:', err); }
    });
    this.formularioFuncion.reset();
  }

  agregarHerencia() {
    const { clases } = this.formularioHerencia.value;
    if (!clases || !this.idClase) return;
    this.api.postHerencia(this.idClase, clases).subscribe({
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

  reiniciar(){
    this.dialgRef.close()
  }

  classExist(){
    const {nivelClase, nombre } = this.formularioClase.value
    var band= false
  
    this.clases.forEach((element: {nombre: any}) => {
      if(nombre == element.nombre){
        band=true
      }
    });

    if(band){
      this.bandExistClass = true;
    }else{
      this.bandExistClass = false;
    }
  }
}
