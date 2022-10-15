import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { EditarFormularioComponent } from '../editar-formulario/editar-formulario.component';
@Component({
  selector: 'app-showclass',
  templateUrl: './showclass.component.html',
  styleUrls: ['./showclass.component.css']
})
export class ShowclassComponent implements OnInit {

  constructor(public dialRef: MatDialogRef<ShowclassComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public apis: BaseDeDatosService, public dialog: MatDialog) { }

    bandEditar:boolean=false;
    id=this.data.identificador
  ngOnInit(): void {
    
  }

  eliminarClase() {
    this.apis.deleteAtributos(this.data.identificador).subscribe((res: any) => {
      this.apis.deleteFunciones(this.data.identificador).subscribe((res: any) => {
        this.apis.deleteHerencia(this.data.identificador).subscribe((res: any) => {
          this.apis.deleteClase(this.data.identificador).subscribe((res: any) => {
            this.dialRef.close();
          });
        });
      });
    });
  }

  editarClase(){
    this.bandEditar=true;
  }

  editar(item:any,cadena:string){
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width:'60%',
      height:'40%',
      data:item,
    });
    dialogRef.afterClosed().subscribe(res=>{
      this.dialRef.close();
    });
  }

  agregarAtributo(){
    var data2:any=[]
    data2.push(this.data)
    data2.push({tipoAgregar:"Atributo"})
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width:'60%',
      height:'40%',
      data:data2,
    });
  }

  agregarFuncion(){
    var data2:any=[]
    data2.push(this.data)
    data2.push({tipoAgregar:"Funcion"})
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width:'60%',
      height:'40%',
      data:data2,
    });
  }

}
