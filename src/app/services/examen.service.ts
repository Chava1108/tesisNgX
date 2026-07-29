import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamenService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  // --- DOCENTE ---
  crearExamen(payload: any) {
    return this.http.post(`${this.baseUrl}/examenes/crear`, payload);
  }

  listarExamenes() {
    return this.http.get(`${this.baseUrl}/examenes`);
  }

  // --- ESTUDIANTE ---
  listarExamenesDisponibles(idEstudiante: number) {
    return this.http.get(`${this.baseUrl}/examenes/disponibles/${idEstudiante}`);
  }

  obtenerExamenEstudiante(idExamen: number) {
    return this.http.get(`${this.baseUrl}/examenes/${idExamen}/estudiante`);
  }

  iniciarIntento(idExamen: number, idEstudiante: number) {
    return this.http.post(`${this.baseUrl}/examenes/iniciar`, {
      id_examen: idExamen,
      id_estudiante: idEstudiante,
    });
  }

  enviarRespuestas(idIntento: number, respuestas: any[]) {
    return this.http.post(`${this.baseUrl}/examenes/enviar`, {
      id_intento: idIntento,
      respuestas: respuestas,
    });
  }

  obtenerResultados(idIntento: number) {
    return this.http.get(`${this.baseUrl}/examenes/resultados/${idIntento}`);
  }
}
