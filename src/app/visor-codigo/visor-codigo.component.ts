import { Component, OnInit } from '@angular/core';
import { BaseDeDatosService } from '../services/base-de-datos.service';
import { PoryectosService } from '../services/poryectos.service';
import { CodeService } from '../services/code.service';

@Component({
  selector: 'app-visor-codigo',
  templateUrl: './visor-codigo.component.html',
  styleUrls: ['./visor-codigo.component.css'],
})
export class VisorCodigoComponent implements OnInit {
  // Vistas: 'usuarios' | 'proyectos' | 'codigo'
  vistaActual: string = 'usuarios';

  usuarios: any[] = [];
  proyectos: any[] = [];
  listaArchivos: any[] = [];

  usuarioSeleccionado: any = null;
  proyectoSeleccionado: any = null;
  archivoActivo: any = null;

  code: string = '// Selecciona un archivo para ver el código';

  // Consola de compilación
  mostrarConsola: boolean = false;
  salidaTerminal: any[] = [];
  entradasUsuario: string = '';
  compilando: boolean = false;

  editorOptions: any = {
    theme: 'vs-dark',
    language: 'java',
    readOnly: true,
    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace",
    fontLigatures: true,
    fontSize: 14,
    lineHeight: 22,
    minimap: { enabled: true, renderCharacters: false, showSlider: 'mouseover' },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderLineHighlight: 'all',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    padding: { top: 15, bottom: 15 },
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    folding: true,
    showFoldingControls: 'mouseover',
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  };

  constructor(
    private apiService: BaseDeDatosService,
    private proyectosService: PoryectosService,
    private codeService: CodeService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  onInitEditor(editor: any) {
    const monaco = (window as any).monaco;
    monaco.editor.defineTheme('visor-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'storage', foreground: '569CD6' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'delimiter.bracket', foreground: 'FFD700' },
        { token: 'annotation', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1E1E2E',
        'editor.foreground': '#CDD6F4',
        'editorCursor.foreground': '#F5E0DC',
        'editor.lineHighlightBackground': '#2A2B3D',
        'editorLineNumber.foreground': '#6C7086',
        'editorLineNumber.activeForeground': '#CDD6F4',
        'editor.selectionBackground': '#45475A80',
        'editorBracketMatch.border': '#F5C2E7',
      },
    });
    monaco.editor.setTheme('visor-dark');
  }

  cargarUsuarios() {
    this.apiService.getUsuarios().subscribe({
      next: (res: any) => {
        this.usuarios = res;
      },
      error: (err: any) => console.error('Error cargando usuarios:', err),
    });
  }

  seleccionarUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.vistaActual = 'proyectos';
    this.proyectosService.getProyectos(usuario.id).subscribe({
      next: (res: any) => {
        this.proyectos = res;
      },
      error: (err: any) => console.error('Error cargando proyectos:', err),
    });
  }

  seleccionarProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.vistaActual = 'codigo';
    this.archivoActivo = null;
    this.code = '// Selecciona un archivo de la lista';

    const lenguajeMonaco = proyecto.lenguaje === 'cpp' ? 'cpp' : 'java';
    this.editorOptions = { ...this.editorOptions, language: lenguajeMonaco };

    this.codeService.listarArchivos(proyecto.id).subscribe({
      next: (res: any) => {
        this.listaArchivos = res;
        // Abrir Main por defecto
        const main = this.listaArchivos.find((f: any) => f.es_main);
        if (main) {
          this.abrirArchivo(main);
        }
      },
      error: (err: any) => console.error('Error cargando archivos:', err),
    });
  }

  abrirArchivo(archivo: any) {
    this.archivoActivo = archivo;
    this.codeService.leerArchivoPorRuta(archivo.ruta_relativa).subscribe({
      next: (res: any) => {
        this.code = res.codigo;
      },
      error: () => {
        this.code = '// Error al leer el archivo';
      },
    });
  }

  volverAUsuarios() {
    this.vistaActual = 'usuarios';
    this.usuarioSeleccionado = null;
    this.proyectos = [];
  }

  volverAProyectos() {
    this.vistaActual = 'proyectos';
    this.proyectoSeleccionado = null;
    this.listaArchivos = [];
    this.archivoActivo = null;
    this.code = '';
  }

  getIconoArchivo(): string {
    if (this.proyectoSeleccionado?.lenguaje === 'cpp') {
      return 'assets/imgs/cpp-icon.svg';
    }
    return 'assets/imgs/java-icon.svg';
  }

  // --- Compilación ---
  ejecutarProyecto() {
    if (!this.proyectoSeleccionado) return;

    this.salidaTerminal = [];
    this.mostrarConsola = true;
    this.compilando = true;
    this.pushTerminal({ texto: '> Compilando proyecto...', tipo: 'info' });

    this.codeService.compilarProyecto(this.proyectoSeleccionado.id, this.entradasUsuario).subscribe({
      next: (res: any) => {
        this.compilando = false;
        if (res.exito) {
          this.pushTerminal({ texto: res.mensaje, tipo: 'info' });
        } else {
          this.pushTerminal({ texto: res.mensaje, tipo: 'error' });
        }
      },
      error: (err) => {
        this.compilando = false;
        this.pushTerminal({ texto: 'Error de conexión con el servidor', tipo: 'error' });
      },
    });
  }

  pushTerminal(msg: { texto: string; tipo: string }) {
    this.salidaTerminal.push(msg);
  }

  limpiarTerminal() {
    this.salidaTerminal = [];
    this.entradasUsuario = '';
  }
}
