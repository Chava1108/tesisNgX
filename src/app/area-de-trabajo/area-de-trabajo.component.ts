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
import { Observable, Subscription, of } from 'rxjs';
import { Router } from '@angular/router';
import { SecureStorageService } from '../services/secure-storage.service';
import { AutoLogoutService } from '../services/auto-logout.service';
import { AreaEventosService } from '../services/area-eventos.service';
import { environment } from '../../environments/environment';

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

  editorInstance: any = null;

  onInitEditor(editor: any) {
    this.editorInstance = editor;
    const monaco = (window as any).monaco;

    // Tema profesional inspirado en One Dark Pro
    monaco.editor.defineTheme('poograph-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.doc', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'keyword.control', foreground: 'C586C0' },
        { token: 'keyword.operator', foreground: 'C586C0' },
        { token: 'storage', foreground: '569CD6' },
        { token: 'storage.type', foreground: '569CD6' },
        { token: 'storage.modifier', foreground: '569CD6' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'type.identifier', foreground: '4EC9B0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.escape', foreground: 'D7BA7D' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.float', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'delimiter.bracket', foreground: 'FFD700' },
        { token: 'delimiter.parenthesis', foreground: 'DA70D6' },
        { token: 'delimiter.square', foreground: '179FFF' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'annotation', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'variable.predefined', foreground: '4FC1FF' },
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
      ],
      colors: {
        'editor.background': '#1E1E2E',
        'editor.foreground': '#CDD6F4',
        'editorCursor.foreground': '#F5E0DC',
        'editor.lineHighlightBackground': '#2A2B3D',
        'editor.lineHighlightBorder': '#2A2B3D00',
        'editorLineNumber.foreground': '#6C7086',
        'editorLineNumber.activeForeground': '#CDD6F4',
        'editorIndentGuide.background1': '#313244',
        'editorIndentGuide.activeBackground1': '#45475A',
        'editor.selectionBackground': '#45475A80',
        'editor.selectionHighlightBackground': '#45475A40',
        'editor.wordHighlightBackground': '#45475A60',
        'editorBracketMatch.background': '#45475A80',
        'editorBracketMatch.border': '#F5C2E7',
        'editorGutter.background': '#1E1E2E',
        'editorOverviewRuler.border': '#1E1E2E',
        'scrollbar.shadow': '#11111B',
        'scrollbarSlider.background': '#45475A40',
        'scrollbarSlider.hoverBackground': '#45475A80',
        'scrollbarSlider.activeBackground': '#585B70',
        'editorWidget.background': '#1E1E2E',
        'editorWidget.border': '#313244',
        'editorSuggestWidget.background': '#1E1E2E',
        'editorSuggestWidget.border': '#313244',
        'editorSuggestWidget.selectedBackground': '#45475A',
        'editorHoverWidget.background': '#1E1E2E',
        'editorHoverWidget.border': '#313244',
        'minimap.background': '#1E1E2E',
      },
    });

    monaco.editor.setTheme('poograph-dark');

    // Tooltip educativo solo al hacer doble clic (se registra automáticamente)
    this.registrarDobleClicTooltip(editor, monaco);

    // Bloquear pegado de código y registrar el intento
    this.bloquearPegado(editor, monaco);
  }

  sub!: Subscription;
  highlighted = false;
  codeType = 'java';
  bandCode = 0;
  horizontalStepperForm = new FormGroup({
    clase: new FormControl('', Validators.required),
  });

  editorOptions: any = {
    theme: 'vs-dark',
    language: 'java',
    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace",
    fontLigatures: true,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.3,
    minimap: {
      enabled: true,
      maxColumn: 80,
      renderCharacters: false,
      showSlider: 'mouseover',
    },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderLineHighlight: 'all',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    cursorWidth: 2,
    padding: { top: 15, bottom: 15 },
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true,
      highlightActiveIndentation: true,
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      preview: true,
      showIcons: true,
    },
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: 'off',
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'mouseover',
    renderWhitespace: 'selection',
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      verticalSliderSize: 6,
      horizontalSliderSize: 6,
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    glyphMargin: false,
  };

  code: string = 'public class MiClase {\n    // Escribe tu código aquí\n}';
  mostrarEditor: boolean = false;
  mostrarExplorador: boolean = true;
  mostrarDiagrama: boolean = true;
  mostrarConsola: boolean = false;
  salidaTerminal: any = [];

  pushTerminal(msg: { texto: string; tipo: string }) {
    this.salidaTerminal.push(msg);
    this.mostrarConsola = true;
  }

  toggleEditor() {
    this.mostrarEditor = !this.mostrarEditor;
    // Hack para que la gráfica se redibuje bien al cambiar el tamaño del div
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  toggleDiagrama() {
    this.mostrarDiagrama = !this.mostrarDiagrama;
    this.registrarDiagrama(this.mostrarDiagrama, 'botón');
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
    private storage: SecureStorageService,
    private autoLogout: AutoLogoutService,
    private areaEventos: AreaEventosService,
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
  // Mientras se carga un archivo, archivoActivo y code aún corresponden al anterior:
  // se bloquea el guardado para no escribir código en el archivo equivocado.
  cargandoArchivo = false;
  private cargaSub?: Subscription;
  claseSeleccionada: string | null = null;

  // El overlay de carga del editor usa el mismo indicador que bloquea el guardado
  get cargandoCodigo(): boolean {
    return this.cargandoArchivo;
  }

  form = this.fb.group({
    content: '',
  });

  text =
    ' Bienvenidos a POOGraph \n La Programación Orientada a objetos permite que el \n código sea reutilizable, organizado y fácil de mantener \n  En este sitio podras personalizar tus diagramas para \n trabajar con POO, es ideal por si';
  aributosHeredados: any = [];
  lenguajeActual: string = 'java';
  // Usuario del log de analítica; se guarda al entrar porque al cerrar sesión el storage se limpia
  private idUsuarioLog = 0;
  private alCerrarPestana = () => {
    if (this.mostrarDiagrama && this.idUsuarioLog) {
      this.codeService.registrarTooltipAlSalir(this.idUsuarioLog, 'OCULTAR_DIAGRAMA', this.lenguajeActual, 'cierre_pestaña');
    }
  };

  /**
   * Registra cuándo el diagrama queda visible u oculto para medir el tiempo con el diagrama.
   * El diagrama está visible por defecto, así que también se registra al entrar y al salir
   * del área de trabajo, no solo con el botón.
   */
  private registrarDiagrama(visible: boolean, contexto: string) {
    if (!this.idUsuarioLog) return;
    const palabra = visible ? 'MOSTRAR_DIAGRAMA' : 'OCULTAR_DIAGRAMA';
    this.codeService.registrarTooltip(this.idUsuarioLog, palabra, this.lenguajeActual, contexto).subscribe({
      error: (err: any) => console.error('Error registrando el diagrama:', err)
    });
  }

  private claseCreadaSub?: Subscription;

  ngOnInit(): void {
    // Al crear una clase con el editor UML: recargar el diagrama y abrir su archivo
    this.claseCreadaSub = this.areaEventos.claseCreada$.subscribe((clase) => {
      this.pushTerminal({ texto: `✅ Clase ${clase.nombre} creada.`, tipo: 'info' });
      this.getClase();
      this.reinicio(clase.id, { label: clase.nombre });
    });

    // Si la sesión se cierra por inactividad, guardar antes el archivo abierto
    this.autoLogout.antesDeCerrarSesion = () => this.guardarArchivoAbierto();

    this.idUsuarioLog = Number(this.storage.getItem('Usrid')) || 0;
    window.addEventListener('pagehide', this.alCerrarPestana);

    this.idProyect = Number(this.storage.getItem('Id_Proyecto'));
    this.nameProyect = this.storage.getItem('Nombre_Proyecto');
    this.proyectosService
      .getProyectoIndividual(
        this.nameProyect,
        Number(this.storage.getItem('Usrid')),
      )
      .subscribe((res: any) => {
        console.log('proyecto individuL');
        console.log(res);
        this.lenguajeActual = res[0].lenguaje || 'java';
        this.storage.setItem('lenguajeActual', this.lenguajeActual);
        // 2. ACTUALIZAR LAS OPCIONES DE MONACO
        this.actualizarEditorOptions();
        // El diagrama está visible al entrar (se registra ya con el lenguaje del proyecto)
        if (this.mostrarDiagrama) this.registrarDiagrama(true, 'entrada');
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
    .subscribe({
      next: (clases: any[]) => {
        this.clases = clases;
        
        // Mapeo directo de clases a nodos sin peticiones extra
        this.nodos = clases.map((element: any) => ({
          id: element.nombre,
          label: element.nombre,
          // Sin imagen: el nodo muestra la inicial de la clase
          imagen: element.imagen ? environment.apiUrl + 'archivos/' + element.imagen : '',
          inicial: (element.nombre || '?').charAt(0).toUpperCase(),
          atributos: [], // Se llenarán después mediante el Parser si lo deseas
          funciones: [], 
          identificador: element.id,
          nombrePadre: element.nombre_padre // El backend nos enviará esto ahora
        }));

        this.updateChart();
        this.construirHerenciaDesdeNodos(); // Nuevo método local
      },
      error: (err: any) => console.error('Error cargando clases:', err),
    });
}

  construirHerenciaDesdeNodos() {
    this.links = [];
    this.nodos.forEach((nodo: { nombrePadre: any; id: any; }) => {
      console.log(nodo)
      if (nodo.nombrePadre) {
        this.links.push({
          id: `link-${nodo.nombrePadre}-${nodo.id}`,
          source: nodo.nombrePadre,
          target: nodo.id,
          label: 'Herencia'
        });
      }
    });
    this.updateChart(); // Refresca el diagrama con las flechas
  }

  updateChart() {
    this.update$.next(true);
  }

  Showclass(node: any) {
    const dialogRef = this.dialog.open(ShowclassComponent, {
      width: '80%',
      height: '85%',
      data: node,
    });
    dialogRef.afterClosed().subscribe((res) => {
      console.log('Diálogo cerrado, recargando diagrama...');
      this.getClase();
      this.cargarArchivosProyecto();
      if (this.archivoActivo) {
        this.abrirArchivo(this.archivoActivo);
      }
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
    this.claseCreadaSub?.unsubscribe();
    this.sub?.unsubscribe();
    this.cargaSub?.unsubscribe();
    this.autoLogout.antesDeCerrarSesion = null;
    window.removeEventListener('pagehide', this.alCerrarPestana);
    if (this.mostrarDiagrama) this.registrarDiagrama(false, 'salida');
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

  // Esta función se llama al dar clic en "Código" de un nodo del diagrama.
  // Abre el ARCHIVO de la clase (no solo su texto) para que archivoActivo y code
  // siempre correspondan a la misma clase al guardar.
  reinicio(id: any, node: any) {
    // Resaltar la clase en el diagrama
    this.claseSeleccionada = node.label;

    const ext = this.lenguajeActual === 'cpp' ? '.cpp' : '.java';
    this.codeService.listarArchivos(this.idProyect).subscribe({
      next: (res: any) => {
        this.listaArchivos = res;
        const archivo = this.listaArchivos.find(
          (f) => f.nombre === node.label + ext,
        );
        if (archivo) {
          this.abrirArchivo(archivo);
        } else {
          this.pushTerminal({
            texto: `⚠️ No se encontró el archivo de la clase ${node.label}.`,
            tipo: 'error',
          });
        }
        if (!this.mostrarEditor) this.toggleEditor();
      },
      error: (err) => {
        console.error('Error al cargar archivos:', err);
        this.pushTerminal({
          texto: '⚠️ No se pudo cargar el código fuente.',
          tipo: 'error',
        });
      },
    });
  }

  cargarArchivosProyecto() {
    // Asumiendo que tienes el ID del proyecto en una variable
    var idProyect = Number(this.storage.getItem('Id_Proyecto'));
    console.log('entra extraer archivos' + this.idProyect);
    if (!idProyect) return;

    this.codeService.listarArchivos(idProyect).subscribe((res: any) => {
      this.listaArchivos = res;
      console.log(this.listaArchivos);
      // Opcional: Abrir Main.java por defecto si no hay nada abierto
      const main = this.listaArchivos.find((f) => f.es_main);
      if (main && !this.archivoActivo && !this.cargandoArchivo) {
        this.abrirArchivo(main);
      }
    });
  }

  abrirArchivo(archivo: any) {
    // Si hay un archivo activo y es diferente al nuevo, guardar primero
    if (this.archivoActivo && this.archivoActivo.ruta_relativa !== archivo.ruta_relativa) {
      this.pushTerminal({ 
        texto: `> Guardando cambios de ${this.archivoActivo.nombre}...`, 
        tipo: 'info' 
      });
      
      this.guardarCambios('cambio_archivo').subscribe({
        next: () => {
          this.pushTerminal({ 
            texto: `✅ ${this.archivoActivo.nombre} guardado correctamente.`, 
            tipo: 'info' 
          });
          this.cargarNuevoArchivo(archivo);
        },
        error: (err) => {
          this.pushTerminal({
            texto: `⚠️ Error al guardar ${this.archivoActivo.nombre}: ${err.message}`,
            tipo: 'error',
          });
          // Aun con error, permitir cambiar de archivo
          this.cargarNuevoArchivo(archivo);
        }
      });
    } else {
      // Si no hay archivo activo o es el mismo, cargar directamente
      this.cargarNuevoArchivo(archivo);
    }
  }

  private cargarNuevoArchivo(archivo: any) {
    // Cancela una carga previa para que una respuesta tardía no sobrescriba la actual
    this.cargaSub?.unsubscribe();
    this.cargandoArchivo = true;
    // Pedimos el contenido al backend; archivoActivo y code se asignan juntos al llegar
    this.cargaSub = this.codeService
      .leerArchivoPorRuta(archivo.ruta_relativa)
      .subscribe({
        next: (res: any) => {
          this.archivoActivo = archivo;
          this.code = res.codigo;
          // Resaltar en el diagrama la clase del archivo abierto (nombre sin extensión)
          this.claseSeleccionada = archivo.nombre.replace(/\.(java|cpp|h)$/i, '');
          this.cargandoArchivo = false;
        },
        error: (err) => {
          this.cargandoArchivo = false;
          this.pushTerminal({
            texto: `⚠️ No se pudo abrir ${archivo.nombre}: ${err.message}`,
            tipo: 'error',
          });
        },
      });
  }

  ejecutarProyecto() {
    if (!this.archivoActivo) {
      this.pushTerminal({
        texto: '⚠️ Selecciona un archivo o el Main antes de ejecutar.',
        tipo: 'error',
      });
      return;
    }
    if (this.cargandoArchivo) {
      this.pushTerminal({
        texto: '⚠️ Espera a que termine de cargar el archivo.',
        tipo: 'error',
      });
      return;
    }
    this.salidaTerminal = []; // Limpiamos terminal
    this.pushTerminal({
      texto: '> Preparando ejecución...',
      tipo: 'info',
    });
    this.guardarCambios('ejecutar').subscribe({
      next: () => {
        this.iniciarCompilacionReal();
      },
      error: (err) => {
        this.pushTerminal({
          texto: '❌ Error crítico al guardar. Se canceló la compilación.',
          tipo: 'error',
        });
      },
    });
  }

  iniciarCompilacionReal() {
    var idProyect = Number(this.storage.getItem('Id_Proyecto'));
    this.pushTerminal({
      texto: '> Compilando y Ejecutando...',
      tipo: 'info',
    });
    this.codeService
      .compilarProyecto(this.idProyect, this.entradasUsuario)
      .subscribe({
        next: (res: any) => {
          // Compiló, pero el programa terminó con error (por ejemplo, una excepción): se muestra en rojo
          const ok = res.exito && !res.codigo_salida;
          this.pushTerminal({ texto: res.mensaje, tipo: ok ? 'info' : 'error' });
        },
        error: (err) =>
          this.pushTerminal({
            texto: 'Error de conexión con el servidor',
            tipo: 'error',
          }),
      });
  }

  // Guarda el archivo abierto si es seguro hacerlo (usado al cerrar sesión por inactividad)
  private guardarArchivoAbierto(): Observable<any> {
    if (!this.archivoActivo || this.cargandoArchivo) return of(null);
    return this.guardarCambios('inactividad');
  }

  // origen: manual | ejecutar | cambio_archivo | inactividad (distingue guardados automáticos en la analítica)
  guardarCambios(origen: string = 'manual'): Observable<any> {
    return this.codeService.guardarArchivo(
      this.archivoActivo.ruta_relativa,
      this.code,
      this.idProyect,
      origen,
    );
  }

  btnGuardar() {
    if (!this.archivoActivo) {
      this.pushTerminal({
        texto: '⚠️ No hay ningún archivo seleccionado para guardar.',
        tipo: 'error',
      });
      return;
    }
    if (this.cargandoArchivo) {
      this.pushTerminal({
        texto: '⚠️ Espera a que termine de cargar el archivo.',
        tipo: 'error',
      });
      return;
    }

    this.pushTerminal({ texto: '> Guardando...', tipo: 'info' });

    this.guardarCambios().subscribe({
      next: () => {
        this.pushTerminal({
          texto: '✅ Archivo guardado correctamente.',
          tipo: 'info',
        });
        // Actualizar el diagrama después de guardar
        this.getClase();
      },
      error: (err) => {
        this.pushTerminal({
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

  private tooltipKeywords: { [key: string]: { java?: string; cpp?: string; ambos?: string } } = {
    // Modificadores de acceso
    'public': { ambos: '**public** — Modificador de acceso que permite que un miembro sea accesible desde cualquier clase o archivo.' },
    'private': { ambos: '**private** — Modificador de acceso que restringe el acceso solo a la clase que lo define. Uso: encapsulamiento de datos.' },
    'protected': { ambos: '**protected** — Modificador de acceso que permite el acceso desde la clase, sus subclases y (en Java) el mismo paquete.' },
    // POO
    'class': { ambos: '**class** — Define una nueva clase. Una clase es un plano/plantilla para crear objetos con atributos y métodos.' },
    'extends': { java: '**extends** — Indica que una clase hereda de otra (clase padre). Java solo permite herencia simple.' },
    'implements': { java: '**implements** — Indica que una clase cumple con un contrato definido por una interfaz.' },
    'interface': { java: '**interface** — Define un contrato: un conjunto de métodos que las clases deben implementar.' },
    'abstract': { java: '**abstract** — Una clase abstracta no puede instanciarse directamente. Un método abstracto debe ser implementado por las subclases.' },
    'super': { java: '**super** — Referencia a la clase padre. Se usa para llamar constructores o métodos del padre: `super()`, `super.metodo()`.' },
    'this': { java: '**this** — Referencia al objeto actual. Se usa para distinguir atributos de parámetros con el mismo nombre.' },
    'new': { java: '**new** — Crea una nueva instancia (objeto) de una clase, llamando a su constructor.' },
    'static': { java: '**static** — Pertenece a la clase, no a una instancia. Se comparte entre todos los objetos de la clase.', cpp: '**static** — Variable o método que pertenece a la clase en lugar de a un objeto. Conserva su valor entre llamadas.' },
    'final': { java: '**final** — Hace que una variable sea constante, un método no pueda ser sobrescrito, o una clase no pueda ser heredada.' },
    'void': { ambos: '**void** — Tipo de retorno que indica que un método/función no devuelve ningún valor.' },
    'return': { ambos: '**return** — Finaliza la ejecución de un método/función y opcionalmente devuelve un valor.' },
    'override': { cpp: '**override** — Especifica que una función virtual redefine la implementación del padre. Ayuda al compilador a verificar.' },
    'virtual': { cpp: '**virtual** — Permite que un método sea redefinido (polimorfismo) en las clases derivadas.' },
    'Override': { java: '**@Override** — Anotación que indica que un método sobrescribe uno de la clase padre. El compilador verifica la firma.' },
    // Control de flujo
    'if': { ambos: '**if** — Estructura de control condicional. Ejecuta un bloque de código solo si la condición es verdadera.' },
    'else': { ambos: '**else** — Bloque alternativo que se ejecuta si la condición del `if` es falsa.' },
    'for': { ambos: '**for** — Bucle que repite un bloque de código un número determinado de veces. Sintaxis: `for(inicio; condición; incremento)`.' },
    'while': { ambos: '**while** — Bucle que se ejecuta mientras la condición sea verdadera. Cuidado: puede generar bucles infinitos.' },
    'do': { ambos: '**do** — Parte de `do...while`. Garantiza que el bloque se ejecute al menos una vez.' },
    'switch': { ambos: '**switch** — Estructura de selección múltiple. Evalúa una expresión y ejecuta el caso (`case`) que coincida.' },
    'case': { ambos: '**case** — Define un caso dentro de un `switch`. Se ejecuta si coincide con el valor evaluado.' },
    'break': { ambos: '**break** — Sale inmediatamente de un bucle (`for`, `while`) o de un `switch`.' },
    'continue': { ambos: '**continue** — Salta la iteración actual de un bucle y pasa a la siguiente.' },
    // Tipos de datos
    'int': { ambos: '**int** — Tipo de dato entero (números sin decimales). En Java: 32 bits. En C++: mínimo 16 bits.' },
    'float': { ambos: '**float** — Tipo de dato para números decimales de precisión simple (32 bits).' },
    'double': { ambos: '**double** — Tipo de dato para números decimales de doble precisión (64 bits). Más preciso que float.' },
    'char': { java: '**char** — Tipo de dato para un solo carácter Unicode (16 bits en Java).', cpp: '**char** — Tipo de dato para un carácter ASCII (8 bits en C++).' },
    'boolean': { java: '**boolean** — Tipo de dato lógico. Solo puede ser `true` o `false`.' },
    'bool': { cpp: '**bool** — Tipo de dato lógico. Solo puede ser `true` o `false`.' },
    'String': { java: '**String** — Clase que representa cadenas de texto. Es inmutable: cada modificación crea un nuevo objeto.' },
    'string': { cpp: '**string** — Clase de la librería estándar para manejar cadenas de texto. Requiere `#include <string>`.' },
    'long': { ambos: '**long** — Tipo entero de mayor rango. En Java: 64 bits. En C++: mínimo 32 bits.' },
    'short': { ambos: '**short** — Tipo entero de rango reducido (16 bits). Usa menos memoria que `int`.' },
    'byte': { java: '**byte** — Tipo entero de 8 bits (-128 a 127). Ãštil para ahorrar memoria en arreglos grandes.' },
    'auto': { cpp: '**auto** — Deduce automáticamente el tipo de una variable a partir de su valor inicial. C++11+.' },
    // Manejo de errores
    'try': { ambos: '**try** — Bloque para capturar excepciones. El código que puede fallar va dentro del `try`.' },
    'catch': { ambos: '**catch** — Captura y maneja una excepción lanzada dentro del bloque `try`.' },
    'throw': { ambos: '**throw** — Lanza una excepción manualmente. Ãštil para señalar errores personalizados.' },
    'finally': { java: '**finally** — Bloque que se ejecuta SIEMPRE, sin importar si hubo excepción o no. Ãštil para liberar recursos.' },
    // C++ específicos
    'cout': { cpp: '**cout** — Objeto de salida estándar. Se usa con `<<` para imprimir en consola: `cout << "Hola";`.' },
    'cin': { cpp: '**cin** — Objeto de entrada estándar. Se usa con `>>` para leer desde teclado: `cin >> variable;`.' },
    'endl': { cpp: '**endl** — Inserta un salto de línea y limpia el buffer de salida.' },
    'include': { cpp: '**#include** — Directiva del preprocesador que incluye el contenido de un archivo de cabecera.' },
    'namespace': { cpp: '**namespace** — Agrupa declaraciones bajo un nombre para evitar conflictos. Ej: `std::cout`.' },
    'using': { cpp: '**using** — Permite usar nombres de un namespace sin escribir el prefijo. Ej: `using namespace std;`.' },
    'nullptr': { cpp: '**nullptr** — Valor nulo para punteros en C++11+. Más seguro que usar `NULL` o `0`.' },
    'const': { cpp: '**const** — Declara una variable como constante. Su valor no puede cambiar después de la inicialización.' },
    'template': { cpp: '**template** — Permite escribir código genérico que funciona con diferentes tipos de datos (programación genérica).' },
    'vector': { cpp: '**vector** — Contenedor dinámico de la STL. Similar a un arreglo pero con tamaño variable. Requiere `#include <vector>`.' },
    // Java específicos  
    'System': { java: '**System** — Clase del sistema. `System.out.println()` imprime en consola. `System.in` lee del teclado.' },
    'println': { java: '**println** — Método que imprime texto en consola seguido de un salto de línea.' },
    'Scanner': { java: '**Scanner** — Clase para leer entrada del usuario. Se crea con `new Scanner(System.in)`.' },
    'null': { java: '**null** — Representa la ausencia de un objeto. Una referencia que no apunta a ningún objeto.' },
    'true': { ambos: '**true** — Valor booleano verdadero.' },
    'false': { ambos: '**false** — Valor booleano falso.' },
    'import': { java: '**import** — Permite usar clases de otros paquetes sin escribir la ruta completa.' },
    'package': { java: '**package** — Define a qué paquete pertenece la clase. Organiza el código en módulos.' },
  };

  private tooltipWidget: any = null;

  registrarDobleClicTooltip(editor: any, monaco: any) {
    editor.onMouseDown((e: any) => {
      // detail === 2 significa doble clic
      if (e.event.detail !== 2) return;
      const position = e.target?.position;
      if (!position) return;

      const model = editor.getModel();
      if (!model) return;

      const word = model.getWordAtPosition(position);
      if (!word) return;

      const keyword = word.word;
      const tooltipData = this.tooltipKeywords[keyword];
      if (!tooltipData) return;

      const currentLang = this.lenguajeActual === 'cpp' ? 'cpp' : 'java';
      const contenido = tooltipData.ambos || (currentLang === 'cpp' ? tooltipData.cpp : tooltipData.java);
      if (!contenido) return;

      // Mostrar tooltip como widget overlay en el editor
      this.mostrarTooltipWidget(editor, position, keyword, contenido);

      // Registrar automáticamente en logs
      const userId = Number(this.storage.getItem('Usrid'));
      if (userId) {
        this.codeService.registrarTooltip(userId, keyword, currentLang).subscribe({
          error: (err: any) => console.error('Error registrando tooltip:', err)
        });
      }
    });
  }

  mostrarTooltipWidget(editor: any, position: any, keyword: string, contenido: string) {
    // Remover widget anterior si existe
    if (this.tooltipWidget) {
      editor.removeContentWidget(this.tooltipWidget);
      this.tooltipWidget = null;
    }

    const widgetId = 'poograph.tooltip.' + Date.now();
    const domNode = document.createElement('div');
    domNode.style.cssText = `
      background: #1E1E2E;
      border: 1px solid #45475A;
      border-radius: 6px;
      padding: 10px 14px;
      width: 400px;
      color: #CDD6F4;
      font-size: 13px;
      line-height: 1.5;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      z-index: 9999;
    `;
    domNode.innerHTML = `
      <div style="font-weight:bold; color:#89B4FA; margin-bottom:6px;"> POOGraph - Ayuda</div>
      <div style="margin-bottom:6px;"><strong style="color:#F5C2E7;">${keyword}</strong></div>
      <div>${contenido.replace(/\*\*/g, '').replace(/`([^`]+)`/g, '<code style="background:#313244;padding:1px 4px;border-radius:3px;">$1</code>')}</div>
    `;

    const widget = {
      getId: () => widgetId,
      getDomNode: () => domNode,
      getPosition: () => ({
        position: { lineNumber: position.lineNumber, column: position.column },
        preference: [1, 2] // ABOVE, BELOW
      })
    };

    this.tooltipWidget = widget;
    editor.addContentWidget(widget);

    // Cerrar al hacer clic en cualquier lugar o al presionar Escape
    const closeTooltip = () => {
      if (this.tooltipWidget === widget) {
        editor.removeContentWidget(widget);
        this.tooltipWidget = null;
      }
      disposeClic.dispose();
      disposeKey.dispose();
    };

    const disposeClic = editor.onMouseDown((evt: any) => {
      // Si hace clic fuera del tooltip, cerrarlo
      if (evt.event.detail !== 2) {
        closeTooltip();
      }
    });

    const disposeKey = editor.onKeyDown(() => {
      closeTooltip();
    });

    // Auto-cerrar después de 8 segundos
    setTimeout(() => closeTooltip(), 8000);
  }

  bloquearPegado(editor: any, monaco: any) {
    // Sobrescribir la acción de pegar para bloquearla
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      // Bloquear y registrar intento
      const userId = Number(this.storage.getItem('Usrid'));
      if (userId) {
        this.codeService.registrarTooltip(userId, 'INTENTO_PEGAR', this.lenguajeActual).subscribe({
          error: (err: any) => console.error('Error registrando intento de pegado:', err)
        });
      }
      this.pushTerminal({
        texto: '⚠️ Pegar código está deshabilitado. Escribe tu código manualmente.',
        tipo: 'error',
      });
    });

    // También bloquear Shift+Insert (alternativa de pegar)
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      const userId = Number(this.storage.getItem('Usrid'));
      if (userId) {
        this.codeService.registrarTooltip(userId, 'INTENTO_PEGAR', this.lenguajeActual).subscribe({
          error: (err: any) => console.error('Error registrando intento de pegado:', err)
        });
      }
      this.pushTerminal({
        texto: '⚠️ Pegar código está deshabilitado. Escribe tu código manualmente.',
        tipo: 'error',
      });
    });

    // Bloquear menú contextual de pegar
    editor.onDidPaste(() => {
      // Si de alguna forma logró pegar (ej. menú contextual del navegador), deshacer
      editor.trigger('poograph', 'undo', null);
      const userId = Number(this.storage.getItem('Usrid'));
      if (userId) {
        this.codeService.registrarTooltip(userId, 'INTENTO_PEGAR', this.lenguajeActual).subscribe({
          error: (err: any) => console.error('Error registrando intento de pegado:', err)
        });
      }
      this.pushTerminal({
        texto: '⚠️ Pegar código está deshabilitado. Escribe tu código manualmente.',
        tipo: 'error',
      });
    });
  }

  irAlHome() {
    if (confirm('¿Deseas salir? Asegúrate de haber guardado.')) {
      this.router.navigate(['/home']);
    }
  }

  recargarDiagrama() {
    this.getClase();
    this.cargarArchivosProyecto();
    this.pushTerminal({ texto: '> Diagrama recargado.', tipo: 'info' });
  }
}
