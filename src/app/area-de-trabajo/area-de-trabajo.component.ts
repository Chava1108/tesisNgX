import { PrismService } from './../service/prism.service';
import {
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
import { PoryectosService } from '../services/poryectos.service';
import { CodeService } from '../services/code.service';
import { MatDialog } from '@angular/material/dialog';
import { ShowclassComponent } from '../dialogs/showclass/showclass.component';
import { Observable, forkJoin } from 'rxjs';
import {  Subscription } from 'rxjs';
import {  map, switchMap } from 'rxjs/operators'
import { Router } from '@angular/router';

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

  onInitEditor(editor: any) {
    // Accedemos a la variable global monaco
    const monaco = (window as any).monaco;

    // Definimos el tema "StackBlitz-Like"
    monaco.editor.defineTheme('my-dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorCursor.foreground': '#A79696',
        'editor.lineHighlightBackground': '#2F3337',
        'editorLineNumber.foreground': '#858585',
        'editorIndentGuide.background': '#404040',
        'editor.selectionBackground': '#264F78',
      },
    });

    // Aplicamos el tema
    monaco.editor.setTheme('my-dark-theme');
  }

  sub!: Subscription;
  highlighted = false;
  codeType = 'java';
  bandCode = 0;
  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required),
  });

  editorOptions = {
    theme: 'vs-dark', // El que creamos arriba
    language: 'java',
    fontFamily: "'Fira Code', 'Consolas', monospace", // Usar Fira Code
    fontLigatures: true, // ¡ACTIVAR LIGADURAS! (La magia visual)
    fontSize: 14,
    lineHeight: 24, // Un poco más de aire entre líneas se ve mejor
    minimap: {
      enabled: true, // El mapa pequeño a la derecha
    },
    scrollBeyondLastLine: false, // Para que no scrollee al infinito abajo
    automaticLayout: true,
    renderLineHighlight: 'all', // Resaltar toda la línea actual
    smoothScrolling: true,
    cursorBlinking: 'smooth', // Cursor suave tipo fase
    padding: { top: 15, bottom: 15 }, // Margen interno para que no pegue al borde
  };

  code: string = 'public class MiClase {\n    // Escribe tu código aquí\n}';
  mostrarEditor: boolean = false;
  salidaTerminal: any = [];
  toggleEditor() {
    this.mostrarEditor = !this.mostrarEditor;
    // Un pequeño hack para que la gráfica se redibuje bien al cambiar el tamaño del div
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  public layoutSettings = {
    orientation: 'TB',
  };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private apis: BaseDeDatosService,
    private proyectosService: PoryectosService,
    public dialog: MatDialog,
    private primsmService: PrismService,
    private fb: FormBuilder,
    private codeService: CodeService,
  ) {}
  nombrePadre = '';
  nombreHijo = '';
  nodos: any;
  links: any;
  update$: Subject<boolean> = new Subject();
  clases: any = [];
  herencia: any = [];
  funciones: any = [];
  calculo = 12;
  i = 0;
  imagenes: any = [];
  entradasUsuario: any = '';

  //valores del proyecto
  idProyect: number = 0;
  nameProyect: any;

  listaArchivos: any[] = [];
  archivoActivo: any = null;

  form = this.fb.group({
    content: '',
  });

  get contentControl() {
    return this.form.get('content');
  }

  text =
    ' Bienvenidos a POOGraph \n La Programación Orientada a objetos permite que el \n código sea reutilizable, organizado y fácil de mantener \n  En este sitio podras personalizar tus diagramas para \n trabajar con POO, es ideal por si';
  aributosHeredados: any = [];
  lenguajeActual: string = 'java';
  ngOnInit(): void {
    this.idProyect = Number(sessionStorage.getItem('Id_Proyecto'));
    this.nameProyect = sessionStorage.getItem('Nombre_Proyecto');
    this.proyectosService
      .getProyectoIndividual(
        this.nameProyect,
        Number(sessionStorage.getItem('Usrid')),
      )
      .subscribe((res: any) => {
        console.log('proyecto individuL');
        console.log(res);
        this.lenguajeActual = res[0].lenguaje || 'java';
        // 2. ACTUALIZAR LAS OPCIONES DE MONACO
        this.actualizarEditorOptions();
      });
    this.nodos = [];
    this.links = [];
    this.getClase();
    this.listenForm();
  }

  getClase() {
    this.nodos = [];
    this.links = [];
    this.apis
      .getClasesProyectId(this.idProyect)
      .pipe(
        switchMap((clases: any[]) => {
          this.clases = clases;
          if (clases.length === 0) {
            return [];
          }
          const peticionesPorClase = clases.map((clase: any) => {
            return forkJoin({
              atributosData: this.getAtributos(clase.id),
              funcionesData: this.getFunciones(clase.id),
            }).pipe(
              map((detalles: any) => {
                return {
                  ...clase,
                  listadoAtributos: detalles.atributosData,
                  listadoFunciones: detalles.funcionesData,
                };
              }),
            );
          });
          return forkJoin(peticionesPorClase);
        }),
      )
      .subscribe({
        next: (clasesCompletas: any) => {
          this.nodos = [];
          clasesCompletas.forEach((element: any) => {
            this.nodos.push({
              id: element.nombre,
              label: element.nombre,
              imagen: 'http://127.0.0.1:8000/archivos/' + element.imagen,
              atributos: element.listadoAtributos,
              funciones: element.listadoFunciones,
              identificador: element.id,
            });
          });

          this.updateChart();
          this.getHerencia();
        },
        error: (err: any) => console.error('Error cargando clases:', err),
      });
  }

  getHerencia() {
    this.apis.getHerencia(this.idProyect).subscribe({
      next: (res: any) => {
        this.herencia = res;
        this.herencia.forEach((element: { Padre: any; Hijo: any }) => {
          var bandF = true;
          if (this.clases.length > 0) {
            this.clases.forEach((element2: { nombre: any }) => {
              if (
                (element2.nombre == element.Padre ||
                  element2.nombre == element.Hijo) &&
                bandF
              ) {
                bandF = false;
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

  getAtributos(idClase: number) {
    return this.apis.getAtributosClase(idClase);
  }

  getFunciones(idClase: number) {
    return this.apis.getFuncionesClase(idClase);
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
      console.log('Diálogo cerrado, recargando diagrama...');
      this.getClase();
    });
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
        val.content,
      );

      this.renderer.setProperty(
        this.codeContent.nativeElement,
        'innerHTML',
        modifiedContent,
      );

      this.highlighted = true;
    });
  }

  onCodeChange(value: string) {
    console.log('Código actual:', value);
  }

  sincronizarDiagrama() {
    console.log('Enviando código a Python...');

    // ID temporal, luego usaremos el real del login
    const usuarioId = 1;

    this.codeService.analizarCodigo(this.code, usuarioId).subscribe({
      next: (res: any) => {
        console.log('Respuesta Python:', res);

        if (res.errores && res.errores.length > 0) {
          alert('Errores de sintaxis: ' + res.errores[0]);
          return;
        }

        // LIMPIEZA Y LLENADO DEL DIAGRAMA
        this.nodos = [];
        this.links = [];

        // Convertir Clases -> Nodos
        res.clases.forEach((clase: any) => {
          this.nodos.push({
            id: clase.nombre,
            label: clase.nombre,
            imagen: 'assets/monaco/min/vs/editor/editor.main.css', // Imagen temporal
            dimension: { width: 150, height: 200 },
            data: clase, // Guardamos todo el objeto por si acaso
          });

          // Convertir Herencia -> Links
          if (clase.padre) {
            this.links.push({
              id: `link-${clase.padre}-${clase.nombre}`,
              source: clase.padre,
              target: clase.nombre,
              label: 'extends',
            });
          }
        });

        this.update$.next(true);
      },
      error: (err: any) => {
        console.error('Error conectando con el parser:', err);
        alert('Error al conectar con el servidor Python');
      },
    });
  }

  // Esta función se llama al dar clic en "Ver código"
  reinicio(id: any, node: any) {
    this.cargarArchivosProyecto();
    this.codeService.obtenerCodigoFuente(id).subscribe({
      next: (res: any) => {
        this.code = res.codigo;
        if (!this.mostrarEditor) {
          this.toggleEditor();
        }
        console.log('Código cargado exitosamente');
      },
      error: (err) => {
        console.error('Error al cargar código:', err);
        this.code =
          '// Error: No se pudo cargar el código fuente.\n// ' +
            err.error?.error || err.message;
        if (!this.mostrarEditor) this.toggleEditor();
      },
    });
  }

  cargarArchivosProyecto() {
    // Asumiendo que tienes el ID del proyecto en una variable
    var idProyect = Number(sessionStorage.getItem('Id_Proyecto'));
    console.log('entra extraer archivos' + this.idProyect);
    if (!idProyect) return;

    this.codeService.listarArchivos(idProyect).subscribe((res: any) => {
      this.listaArchivos = res;
      console.log(this.listaArchivos);
      // Opcional: Abrir Main.java por defecto si no hay nada abierto
      const main = this.listaArchivos.find((f) => f.es_main);
      if (main && !this.archivoActivo) {
        this.abrirArchivo(main);
      }
    });
  }

  abrirArchivo(archivo: any) {
    this.archivoActivo = archivo;
    console.log(this.archivoActivo);
    // Pedimos el contenido al backend
    this.codeService
      .leerArchivoPorRuta(archivo.ruta_relativa)
      .subscribe((res: any) => {
        this.code = res.codigo;
      });
  }

  ejecutarProyecto() {
    if (!this.archivoActivo) {
      this.salidaTerminal.push({
        texto: '⚠️ Selecciona un archivo o el Main antes de ejecutar.',
        tipo: 'error',
      });
      return;
    }
    this.salidaTerminal = []; // Limpiamos terminal
    this.salidaTerminal.push({
      texto: '> Preparando ejecución...',
      tipo: 'info',
    });
    this.guardarCambios().subscribe({
      next: () => {
        this.iniciarCompilacionReal();
      },
      error: (err) => {
        this.salidaTerminal.push({
          texto: '❌ Error crítico al guardar. Se canceló la compilación.',
          tipo: 'error',
        });
      },
    });
  }

  iniciarCompilacionReal() {
    var idProyect = Number(sessionStorage.getItem('Id_Proyecto'));
    this.salidaTerminal.push({
      texto: '> Compilando y Ejecutando...',
      tipo: 'info',
    });
    this.codeService
      .compilarProyecto(this.idProyect, this.entradasUsuario)
      .subscribe({
        next: (res: any) => {
          if (res.exito) {
            this.salidaTerminal.push({ texto: res.mensaje, tipo: 'info' });
          } else {
            this.salidaTerminal.push({ texto: res.mensaje, tipo: 'error' });
          }
        },
        error: (err) =>
          this.salidaTerminal.push({
            texto: 'Error de conexión con el servidor',
            tipo: 'error',
          }),
      });
  }

  guardarCambios(): Observable<any> {
    // Retornamos la petición del servicio directamente
    return this.codeService.guardarArchivo(
      this.archivoActivo.ruta_relativa,
      this.code,
      this.idProyect,
    );
  }

  btnGuardar() {
    if (!this.archivoActivo) {
      this.salidaTerminal.push({
        texto: '⚠️ No hay ningún archivo seleccionado para guardar.',
        tipo: 'error',
      });
      return; // Detiene la función aquí
    }

    this.salidaTerminal.push({ texto: '> Guardando...', tipo: 'info' });

    this.guardarCambios().subscribe({
      next: () => {
        this.salidaTerminal.push({
          texto: '✅ Archivo guardado correctamente.',
          tipo: 'info',
        });
      },
      error: (err) => {
        this.salidaTerminal.push({
          texto: '❌ Error al guardar: ' + err.message,
          tipo: 'error',
        });
      },
    });
  }

  limpiarTerminal() {
    this.entradasUsuario = '';
    this.salidaTerminal = [];
  }

  actualizarEditorOptions() {
    const lenguajeMonaco = this.lenguajeActual === 'cpp' ? 'cpp' : 'java';
    this.editorOptions = {
      ...this.editorOptions,
      language: lenguajeMonaco,
    };
  }

  irAlHome() {
    if (confirm('¿Deseas salir? Asegúrate de haber guardado.')) {
      this.router.navigate(['/home']);
    }
  }
}
