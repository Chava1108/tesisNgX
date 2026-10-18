import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { BaseDeDatosService } from '../../services/base-de-datos.service';
import { RestService } from '../../services/rest.service';
import { SecureStorageService } from '../../services/secure-storage.service';
import { ClaseCreada } from '../../services/area-eventos.service';

type Nivel = 'private' | 'protected' | 'public';

interface Miembro {
  nombre: string;
  tipo: string;
  nivel: Nivel;
  parametros: string;
}

interface GrupoTipos {
  etiqueta: string;
  tipos: string[];
}

interface LineaCodigo {
  texto: string;
  nueva: boolean;
}

/**
 * Editor UML para crear una clase (propuesta B): el alumno llena la tarjeta UML y ve en vivo
 * el código que genera el servidor. La vista previa usa el mismo generador que la creación
 * (POST /api/clases/completa con vista_previa), así que lo que ve es exactamente lo que se crea.
 */
@Component({
  selector: 'app-crear-clase',
  templateUrl: './crear-clase.component.html',
  styleUrls: ['./crear-clase.component.css'],
})
export class CrearClaseComponent implements OnInit, OnDestroy {
  readonly niveles: { valor: Nivel; simbolo: string; nombre: string }[] = [
    { valor: 'private', simbolo: '−', nombre: 'privado' },
    { valor: 'protected', simbolo: '#', nombre: 'protegido' },
    { valor: 'public', simbolo: '+', nombre: 'público' },
  ];

  lenguaje = 'java';
  idProyecto = 0;
  idUsuario = 0;
  clasesProyecto: string[] = [];

  nombre = '';
  padre = '';
  atributos: Miembro[] = [];
  metodos: Miembro[] = [];
  imagen: File | null = null;

  lineas: LineaCodigo[] = [];
  errores: { [campo: string]: string } = {};
  errorGeneral = '';
  cargandoVista = false;
  creando = false;
  confirmarSalida = false;

  private cambios$ = new Subject<void>();
  private suscripcion?: Subscription;
  private codigoAnterior: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<CrearClaseComponent, ClaseCreada | undefined>,
    private api: BaseDeDatosService,
    private rest: RestService,
    private storage: SecureStorageService,
  ) {}

  ngOnInit(): void {
    this.dialogRef.disableClose = true;  // Escape o clic fuera no deben perder lo escrito
    this.dialogRef.backdropClick().subscribe(() => this.cancelar());
    this.dialogRef.keydownEvents().subscribe((e) => { if (e.key === 'Escape') this.cancelar(); });

    this.lenguaje = this.storage.getItem('lenguajeActual') || 'java';
    this.idProyecto = Number(this.storage.getItem('Id_Proyecto'));
    this.idUsuario = Number(this.storage.getItem('Usrid'));

    this.api.getClasesProyectId(this.idProyecto).subscribe({
      next: (clases: any[]) => (this.clasesProyecto = clases.map((c) => c.nombre).filter((n) => n !== 'Main')),
    });

    // Vista previa: espera 300 ms sin cambios y cancela la petición anterior si llega otra
    this.suscripcion = this.cambios$.pipe(
      debounceTime(300),
      switchMap(() => {
        this.cargandoVista = true;
        return this.api.crearClaseCompleta({ ...this.payload(), vista_previa: true }).pipe(catchError(() => of(null)));
      }),
    ).subscribe((res) => {
      this.cargandoVista = false;
      if (!res) {
        this.errorGeneral = 'No se pudo obtener la vista previa. Revisa tu conexión.';
        return;
      }
      this.errorGeneral = '';
      this.errores = res.errores || {};
      this.mostrarCodigo(res.codigo || '');
    });
    this.cambio();
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  // ---------------- Tipos disponibles según el lenguaje ----------------
  gruposTipos(conVoid: boolean): GrupoTipos[] {
    const cpp = this.lenguaje === 'cpp';
    const grupos: GrupoTipos[] = [
      { etiqueta: 'Números', tipos: cpp ? ['int', 'double', 'float', 'long', 'short', 'unsigned int', 'long long']
                                        : ['int', 'double', 'float', 'long', 'short', 'byte'] },
      { etiqueta: 'Texto', tipos: cpp ? ['string', 'char'] : ['String', 'char'] },
      { etiqueta: 'Lógico', tipos: [cpp ? 'bool' : 'boolean'] },
    ];
    if (this.clasesProyecto.length) {
      grupos.push({ etiqueta: 'Clases del proyecto', tipos: [...this.clasesProyecto] });
    }
    return conVoid ? [{ etiqueta: 'Sin retorno', tipos: ['void'] }, ...grupos] : grupos;
  }

  // ---------------- Edición ----------------
  agregarAtributo() {
    this.atributos.push({ nombre: '', tipo: 'int', nivel: 'private', parametros: '' });
    this.enfocar(`atributo-${this.atributos.length - 1}`);
  }

  agregarMetodo() {
    this.metodos.push({ nombre: '', tipo: 'void', nivel: 'public', parametros: '' });
    this.enfocar(`metodo-${this.metodos.length - 1}`);
  }

  quitar(lista: Miembro[], indice: number) {
    lista.splice(indice, 1);
    this.cambio();
  }

  cambiarNivel(m: Miembro, nivel: Nivel) {
    m.nivel = nivel;
    this.cambio();
  }

  /** Enter en el nombre de un miembro agrega la siguiente fila del mismo tipo. */
  enterEnMiembro(evento: Event, esMetodo: boolean) {
    evento.preventDefault();
    esMetodo ? this.agregarMetodo() : this.agregarAtributo();
  }

  seleccionarImagen(evento: Event) {
    const archivos = (evento.target as HTMLInputElement).files;
    this.imagen = archivos && archivos.length ? archivos[0] : null;
  }

  cambio() {
    this.confirmarSalida = false;
    this.cambios$.next();
  }

  error(campo: string): string {
    return this.errores[campo] || '';
  }

  get hayErrores(): boolean {
    return Object.keys(this.errores).length > 0 || !this.nombre.trim();
  }

  get sugerencia(): string {
    const n = this.nombre.trim();
    return n && !this.error('nombre') && /^[a-z]/.test(n)
      ? `Por convención las clases inician con mayúscula: ${n[0].toUpperCase() + n.slice(1)}` : '';
  }

  // ---------------- Crear / cancelar ----------------
  crear() {
    if (this.hayErrores || this.creando) return;
    this.creando = true;
    this.errorGeneral = '';
    const payload = this.payload();
    this.api.crearClaseCompleta({ ...payload, vista_previa: false }).subscribe({
      next: (res) => {
        const creada: ClaseCreada = { id: res.id, nombre: res.nombre };
        if (this.imagen && payload.imagen) {
          const datos = new FormData();
          datos.append('myFile', this.imagen, payload.imagen);
          this.rest.sendPost(datos).subscribe({ complete: () => this.dialogRef.close(creada), error: () => this.dialogRef.close(creada) });
        } else {
          this.dialogRef.close(creada);
        }
      },
      error: (err) => {
        this.creando = false;
        this.errores = err.error?.errores || {};
        this.errorGeneral = err.error?.error || 'No se pudo crear la clase.';
      },
    });
  }

  cancelar() {
    const hayTrabajo = this.nombre.trim() || this.atributos.length || this.metodos.length;
    if (hayTrabajo && !this.confirmarSalida) {
      this.confirmarSalida = true;  // primer clic: pide confirmación en la propia ventana
      return;
    }
    this.dialogRef.close();
  }

  trackPorIndice(indice: number): number {
    return indice;
  }

  // ---------------- Internos ----------------
  private payload() {
    const nombre = this.nombre.trim();
    const extension = this.imagen?.name.split('.').pop()?.toLowerCase() || '';
    return {
      id_proyecto: this.idProyecto,
      id_usuario: this.idUsuario,
      nombre,
      padre: this.padre,
      imagen: this.imagen ? `${nombre}_${this.idUsuario}_${this.idProyecto}.${extension}`.slice(0, 50) : '',
      atributos: this.atributos.map((a) => ({ nombre: a.nombre.trim(), tipo: a.tipo, nivel: a.nivel })),
      metodos: this.metodos.map((m) => ({ nombre: m.nombre.trim(), tipo: m.tipo, nivel: m.nivel, parametros: m.parametros.trim() })),
    };
  }

  /** Resalta las líneas que no estaban en la vista previa anterior (lo recién agregado o cambiado). */
  private mostrarCodigo(codigo: string) {
    const nuevas = codigo.split('\n');
    const anteriores = new Set(this.codigoAnterior);
    const primeraVez = this.codigoAnterior.length === 0;
    this.lineas = nuevas.map((texto) => ({ texto, nueva: !primeraVez && texto.trim() !== '' && !anteriores.has(texto) }));
    this.codigoAnterior = nuevas;
  }

  private enfocar(id: string) {
    this.cambio();
    setTimeout(() => document.getElementById(id)?.focus());
  }
}
