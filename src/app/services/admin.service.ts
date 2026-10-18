import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecureStorageService } from './secure-storage.service';
import { environment } from '../../environments/environment';

export const GRUPOS = [
  { valor: 'sin_asignar', etiqueta: 'Sin asignar' },
  { valor: 'experimental', etiqueta: 'Experimental' },
  { valor: 'control', etiqueta: 'Control' },
  { valor: 'pruebas', etiqueta: 'Pruebas' },
  { valor: 'sinteticos', etiqueta: 'Sintéticos' },
];

export const TIPOS_EXAMEN = [
  { valor: 'pre', etiqueta: 'Pre-test' },
  { valor: 'post', etiqueta: 'Post-test' },
  { valor: 'practica', etiqueta: 'Práctica' },
];

export function etiquetaGrupo(valor: string): string {
  return GRUPOS.find((g) => g.valor === valor)?.etiqueta || valor;
}

/** Endpoints /api/admin/*: requieren el token de un administrador. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl.replace(/\/$/, '') + '/api/admin';

  constructor(private http: HttpClient, private storage: SecureStorageService) {}

  private get opciones() {
    return { headers: new HttpHeaders({ Authorization: `Token ${this.storage.getItem('token')}` }) };
  }

  private conGrupo(url: string, grupo?: string) {
    return grupo ? `${url}?grupo=${encodeURIComponent(grupo)}` : url;
  }

  // Estudiantes y grupos
  estudiantes(grupo?: string) {
    return this.http.get<any>(this.conGrupo(`${this.base}/estudiantes`, grupo), this.opciones);
  }
  asignarGrupo(ids: number[], grupo: string) {
    return this.http.post<any>(`${this.base}/estudiantes/grupo`, { ids, grupo }, this.opciones);
  }

  // Exámenes
  examenes() {
    return this.http.get<any[]>(`${this.base}/examenes`, this.opciones);
  }
  examen(id: number) {
    return this.http.get<any>(`${this.base}/examenes/${id}`, this.opciones);
  }
  actualizarExamen(id: number, cambios: any) {
    return this.http.patch<any>(`${this.base}/examenes/${id}`, cambios, this.opciones);
  }
  eliminarExamen(id: number) {
    return this.http.delete<any>(`${this.base}/examenes/${id}`, this.opciones);
  }

  // Resultados
  resultados(idExamen: number, grupo?: string) {
    return this.http.get<any>(this.conGrupo(`${this.base}/examenes/${idExamen}/resultados`, grupo), this.opciones);
  }
  intento(id: number) {
    return this.http.get<any>(`${this.base}/intentos/${id}`, this.opciones);
  }
  reiniciarIntento(id: number) {
    return this.http.delete<any>(`${this.base}/intentos/${id}`, this.opciones);
  }
  ganancia(grupo?: string) {
    return this.http.get<any>(this.conGrupo(`${this.base}/ganancia`, grupo), this.opciones);
  }
}

/** Descarga un arreglo de objetos como CSV (UTF-8 con BOM para que Excel respete los acentos). */
export function descargarCsv(nombre: string, filas: any[], columnas: { clave: string; titulo: string }[]) {
  const celda = (v: any) => {
    const t = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const lineas = [columnas.map((c) => celda(c.titulo)).join(',')];
  filas.forEach((f) => lineas.push(columnas.map((c) => celda(c.clave.split('.').reduce((o, k) => o?.[k], f))).join(',')));
  const blob = new Blob(['﻿' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}
