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

  // Imagen de la clase (comentada de momento)
  imagenClase: string = this.data.imagen;

  // Datos para vista gráfica
  atributosPropios: any[] = [];
  funcionesPropias: any[] = [];
  atributosHeredados: any[] = [];
  funcionesHeredadas: any[] = [];
  atributosNoAccesibles: any[] = [];
  funcionesNoAccesibles: any[] = [];
  clasesPadre: any[] = [];

  // Tooltip de código
  tooltipVisible: boolean = false;
  tooltipContent: string = '';
  tooltipX: number = 0;
  tooltipY: number = 0;

  ngOnInit(): void {
    console.log('Datos recibidos en ShowclassComponent:', this.data);
    this.cargarInfoCompleta();
  }

  cargarInfoCompleta() {
    this.apis.getInfoCompletaClase(this.data.identificador).subscribe({
      next: (res: any) => {
        this.atributosPropios = res.atributos_propios || [];
        this.funcionesPropias = res.funciones_propias || [];
        this.atributosHeredados = res.atributos_heredados || [];
        this.funcionesHeredadas = res.funciones_heredadas || [];
        this.atributosNoAccesibles = res.atributos_no_accesibles || [];
        this.funcionesNoAccesibles = res.funciones_no_accesibles || [];
        this.clasesPadre = res.clases_padre || [];
      },
      error: () => {
        // Fallback con datos que ya trae el nodo
        this.atributosPropios = this.data.atributos || [];
        this.funcionesPropias = this.data.funciones || [];
      }
    });
  }

  mostrarCodigo(event: MouseEvent, func: any) {
    console.log('Función seleccionada:', func);
    
    const mostrar = (codigo: string) => {
      this.tooltipContent = codigo;
      this.tooltipX = event.clientX + 15;
      this.tooltipY = event.clientY - 50;
      if (this.tooltipX + 450 > window.innerWidth) {
        this.tooltipX = event.clientX - 460;
      }
      if (this.tooltipY + 300 > window.innerHeight) {
        this.tooltipY = window.innerHeight - 310;
      }
      if (this.tooltipY < 10) this.tooltipY = 10;
      this.tooltipVisible = true;
    };

    if (func.codigo) {
      mostrar(func.codigo);
    } else if (func.id_clase_padre) {
      // Fetch on-demand desde el backend usando nombre y tipo
      this.apis.getCodigoFuncion(func.id_clase_padre, func.nombre, func.tipo).subscribe({
        next: (res: any) => {
          if (res.codigo) {
            func.codigo = res.codigo; // Cache para futuras consultas
            mostrar(res.codigo);
          } else {
            mostrar('// No se pudo extraer el código de esta función');
          }
        },
        error: () => {
          mostrar('// Error al obtener el código');
        }
      });
    } else {
      mostrar('// Código no disponible');
    }
  }

  cerrarTooltip() {
    this.tooltipVisible = false;
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

  agregarAtributo() {
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width: '60%',
      height: '40%',
      data: {
        item : this.data,
        tipoAgregar: 'Atributo' 
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.cargarInfoCompleta();
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
    dialogRef.afterClosed().subscribe(() => {
      this.cargarInfoCompleta();
    });
  }

  agregarHerencia() {
    const dialogRef = this.dialog.open(EditarFormularioComponent, {
      width: '60%',
      height: '40%',
      data: {
        item: this.data,
        tipoAgregar: 'Herencia'
      },
    });
    dialogRef.afterClosed().subscribe(() => {
      this.cargarInfoCompleta();
    });
  }
}
