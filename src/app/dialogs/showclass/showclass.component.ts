import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { BaseDeDatosService } from 'src/app/services/base-de-datos.service';
import { EditarFormularioComponent } from '../editar-formulario/editar-formulario.component';
import { ConfirmComponent } from '../confirm/confirm.component';
@Component({
  selector: 'app-showclass',
  templateUrl: './showclass.component.html',
  styleUrls: ['./showclass.component.css'],
})
export class ShowclassComponent implements OnInit {
  constructor(
    public dialRef: MatDialogRef<ShowclassComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public apis: BaseDeDatosService,
    public dialog: MatDialog
  ) {}

  bandEditar: boolean = false;
  id = this.data.identificador;
  ngOnInit(): void {
    console.log(this.data);
  }

  eliminarClase() {
    this.apis.deleteClase(this.data.identificador).subscribe((res: any) => {
      this.dialog.open(ConfirmComponent, {
        width: '300px',
        data: 'La clase ha sido eliminada',
      });
      this.dialRef.close();
    });
  }

  editarClase() {
    this.bandEditar = true;
  }

  editar(item: any, cadena: string) {
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width: '60%',
      height: '40%',
      data: { 
        item: item,       // Tu objeto original
        bandera: cadena    // Tu nueva variable string
      }
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.dialRef.close();
    });
  }

  eliminar(item: any, cadena: string) {
    if (cadena === 'Atributos') {
      this.apis.deleteAtributos(item.id).subscribe((res: any) => {
        this.dialog.open(ConfirmComponent, {
          width: '300px',
          data: 'El atributo ha sido eliminado',
        });
        this.dialRef.close();
      });
    } else {
      this.apis.deleteFunciones(item.id).subscribe((res: any) => {
        this.dialog.open(ConfirmComponent, {
          width: '300px',
          data: 'El método ha sido eliminado',
        });
        this.dialRef.close();
      });
    }
  }

  agregarAtributo() {
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width: '60%',
      height: '40%',
      data: {
        item : this.data,
        tipoAgregar: 'Atributo' 
      },
    });
  }

  agregarFuncion() {
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width: '60%',
      height: '40%',
      data: {
        item : this.data,
        tipoAgregar: 'Funcion' 
      },
    });
  }
}
