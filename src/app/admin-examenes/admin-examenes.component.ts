import { Component, OnInit } from '@angular/core';
import { AdminService, GRUPOS, TIPOS_EXAMEN, descargarCsv, etiquetaGrupo } from '../services/admin.service';

type Pestana = 'examenes' | 'resultados' | 'ganancia';

@Component({
  selector: 'app-admin-examenes',
  templateUrl: './admin-examenes.component.html',
  styleUrls: ['./admin-examenes.component.css'],
})
export class AdminExamenesComponent implements OnInit {
  pestana: Pestana = 'examenes';
  grupos = GRUPOS;
  tipos = TIPOS_EXAMEN;
  etiquetaGrupo = etiquetaGrupo;
  mensaje = '';
  error = '';

  // --- Exámenes ---
  examenes: any[] = [];
  edicion: any = null;          // copia editable del examen
  preguntasDe: any = null;      // examen con preguntas desplegadas

  // --- Resultados ---
  idExamenResultados: number | null = null;
  grupoResultados = '';
  resultados: any = null;
  detalle: any = null;          // detalle de un intento (ventana)

  // --- Ganancia ---
  grupoGanancia = 'estudio';
  ganancia: any = null;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.cargarExamenes();
  }

  cambiarPestana(p: Pestana) {
    this.pestana = p;
    this.limpiarAvisos();
    if (p === 'resultados' && this.idExamenResultados) this.cargarResultados();
    if (p === 'ganancia') this.cargarGanancia();
  }

  etiquetaTipo(valor: string): string {
    return this.tipos.find((t) => t.valor === valor)?.etiqueta || valor;
  }

  // ======================= Exámenes =======================
  cargarExamenes() {
    this.admin.examenes().subscribe({
      next: (res) => (this.examenes = res),
      error: (err) => this.fallo(err),
    });
  }

  editar(examen: any) {
    // datetime-local necesita "YYYY-MM-DDTHH:mm" en hora local
    const fecha = new Date(examen.fecha_disponible);
    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.edicion = { ...examen, fecha_disponible: local };
  }

  guardarEdicion() {
    const e = this.edicion;
    this.limpiarAvisos();
    this.admin.actualizarExamen(e.id, {
      titulo: e.titulo, tipo: e.tipo, activo: e.activo, duracion_minutos: e.duracion_minutos,
      fecha_disponible: new Date(e.fecha_disponible).toISOString(),
    }).subscribe({
      next: () => {
        this.mensaje = `Examen "${e.titulo}" actualizado.`;
        this.edicion = null;
        this.cargarExamenes();
      },
      error: (err) => this.fallo(err),
    });
  }

  cambiarCampo(examen: any, campo: string, valor: any) {
    this.limpiarAvisos();
    this.admin.actualizarExamen(examen.id, { [campo]: valor }).subscribe({
      next: (res) => Object.assign(examen, res),
      error: (err) => this.fallo(err),
    });
  }

  verPreguntas(examen: any) {
    if (this.preguntasDe?.id === examen.id) {
      this.preguntasDe = null;
      return;
    }
    this.admin.examen(examen.id).subscribe({
      next: (res) => (this.preguntasDe = res),
      error: (err) => this.fallo(err),
    });
  }

  eliminar(examen: any) {
    if (!confirm(`¿Eliminar el examen "${examen.titulo}"? Esta acción no se puede deshacer.`)) return;
    this.admin.eliminarExamen(examen.id).subscribe({
      next: () => {
        this.mensaje = 'Examen eliminado.';
        this.cargarExamenes();
      },
      error: (err) => this.fallo(err),
    });
  }

  irAResultados(examen: any) {
    this.idExamenResultados = examen.id;
    this.cambiarPestana('resultados');
  }

  // ======================= Resultados =======================
  cargarResultados() {
    if (!this.idExamenResultados) return;
    this.admin.resultados(this.idExamenResultados, this.grupoResultados).subscribe({
      next: (res) => (this.resultados = res),
      error: (err) => this.fallo(err),
    });
  }

  get gruposConEstadisticas(): string[] {
    return Object.keys(this.resultados?.estadisticas_por_grupo || {});
  }

  verDetalle(intento: any) {
    this.admin.intento(intento.id_intento).subscribe({
      next: (res) => (this.detalle = res),
      error: (err) => this.fallo(err),
    });
  }

  reiniciar(intento: any) {
    const nombre = intento.estudiante.username;
    if (!confirm(`¿Borrar el intento de ${nombre}? Sus respuestas se eliminan y podrá presentar el examen de nuevo.`)) return;
    this.admin.reiniciarIntento(intento.id_intento).subscribe({
      next: () => {
        this.mensaje = `${nombre} puede volver a presentar el examen.`;
        this.cargarResultados();
        this.cargarExamenes();
      },
      error: (err) => this.fallo(err),
    });
  }

  exportarResultados() {
    const r = this.resultados;
    descargarCsv(`resultados_${r.examen.titulo}.csv`, r.intentos, [
      { clave: 'estudiante.id', titulo: 'ID' }, { clave: 'estudiante.username', titulo: 'Usuario' },
      { clave: 'estudiante.name', titulo: 'Nombre' }, { clave: 'estudiante.grupo', titulo: 'Grupo' },
      { clave: 'calificacion', titulo: 'Calificación' }, { clave: 'completado', titulo: 'Completado' },
      { clave: 'fecha_inicio', titulo: 'Inicio' }, { clave: 'fecha_fin', titulo: 'Fin' },
      { clave: 'duracion_min', titulo: 'Duración (min)' },
    ]);
  }

  // ======================= Ganancia =======================
  cargarGanancia() {
    this.admin.ganancia(this.grupoGanancia).subscribe({
      next: (res) => (this.ganancia = res),
      error: (err) => this.fallo(err),
    });
  }

  get gruposGanancia(): string[] {
    return Object.keys(this.ganancia?.resumen_por_grupo || {});
  }

  exportarGanancia() {
    descargarCsv('ganancia_aprendizaje.csv', this.ganancia.estudiantes, [
      { clave: 'estudiante.id', titulo: 'ID' }, { clave: 'estudiante.username', titulo: 'Usuario' },
      { clave: 'estudiante.name', titulo: 'Nombre' }, { clave: 'estudiante.grupo', titulo: 'Grupo' },
      { clave: 'pre', titulo: 'Pre-test' }, { clave: 'post', titulo: 'Post-test' }, { clave: 'ganancia', titulo: 'Ganancia g' },
    ]);
  }

  // ======================= Utilidades =======================
  private limpiarAvisos() {
    this.mensaje = this.error = '';
  }

  private fallo(err: any) {
    this.error = err.status === 403 || err.status === 401
      ? 'Tu sesión no tiene permisos de administrador. Vuelve a iniciar sesión.'
      : err.error?.error || 'No se pudo completar la operación.';
  }
}
