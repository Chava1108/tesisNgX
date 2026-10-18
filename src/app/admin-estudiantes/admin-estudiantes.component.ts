import { Component, OnInit } from '@angular/core';
import { AdminService, GRUPOS, descargarCsv, etiquetaGrupo } from '../services/admin.service';

@Component({
  selector: 'app-admin-estudiantes',
  templateUrl: './admin-estudiantes.component.html',
  styleUrls: ['../admin-examenes/admin-examenes.component.css'],
})
export class AdminEstudiantesComponent implements OnInit {
  grupos = GRUPOS;
  etiquetaGrupo = etiquetaGrupo;

  estudiantes: any[] = [];
  conteo: { [grupo: string]: number } = {};
  filtroGrupo = '';
  busqueda = '';
  seleccionados = new Set<number>();
  grupoMasivo = 'experimental';
  cargando = false;
  mensaje = '';
  error = '';

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.admin.estudiantes().subscribe({
      next: (res) => {
        this.estudiantes = res.estudiantes;
        this.conteo = res.conteo_por_grupo || {};
        this.cargando = false;
      },
      error: (err) => this.fallo(err),
    });
  }

  get total(): number {
    return this.estudiantes.length;
  }

  get visibles(): any[] {
    const q = this.busqueda.trim().toLowerCase();
    return this.estudiantes.filter((e) =>
      (!this.filtroGrupo || e.grupo === this.filtroGrupo) &&
      (!q || [e.username, e.name, e.email].some((v) => (v || '').toLowerCase().includes(q))));
  }

  alternar(id: number) {
    this.seleccionados.has(id) ? this.seleccionados.delete(id) : this.seleccionados.add(id);
  }

  get todosMarcados(): boolean {
    return this.visibles.length > 0 && this.visibles.every((e) => this.seleccionados.has(e.id));
  }

  alternarTodos() {
    const marcar = !this.todosMarcados;
    this.visibles.forEach((e) => (marcar ? this.seleccionados.add(e.id) : this.seleccionados.delete(e.id)));
  }

  cambiarGrupo(estudiante: any, grupo: string) {
    this.asignar([estudiante.id], grupo);
  }

  asignarSeleccionados() {
    const ids = Array.from(this.seleccionados);
    if (!ids.length) return;
    if (!confirm(`¿Asignar ${ids.length} estudiante(s) al grupo "${etiquetaGrupo(this.grupoMasivo)}"?`)) return;
    this.asignar(ids, this.grupoMasivo);
  }

  private asignar(ids: number[], grupo: string) {
    this.mensaje = this.error = '';
    this.admin.asignarGrupo(ids, grupo).subscribe({
      next: (res) => {
        this.mensaje = res.msg;
        this.seleccionados.clear();
        this.cargar();
      },
      error: (err) => this.fallo(err),
    });
  }

  exportar() {
    descargarCsv('estudiantes.csv', this.visibles, [
      { clave: 'id', titulo: 'ID' }, { clave: 'username', titulo: 'Usuario' }, { clave: 'name', titulo: 'Nombre' },
      { clave: 'email', titulo: 'Correo' }, { clave: 'grupo', titulo: 'Grupo' }, { clave: 'semestre', titulo: 'Semestre' },
      { clave: 'proyectos', titulo: 'Proyectos' }, { clave: 'eventos', titulo: 'Eventos' },
      { clave: 'examenes_completados', titulo: 'Exámenes completados' }, { clave: 'ultimo_acceso', titulo: 'Último acceso' },
    ]);
  }

  private fallo(err: any) {
    this.cargando = false;
    this.error = err.status === 403 || err.status === 401
      ? 'Tu sesión no tiene permisos de administrador. Vuelve a iniciar sesión.'
      : err.error?.error || 'No se pudo completar la operación.';
  }
}
