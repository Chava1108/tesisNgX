import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ClaseCreada {
  id: number;
  nombre: string;
}

/** Eventos entre la barra de navegación (que abre los diálogos) y el área de trabajo. */
@Injectable({ providedIn: 'root' })
export class AreaEventosService {
  private claseCreadaSubject = new Subject<ClaseCreada>();
  readonly claseCreada$ = this.claseCreadaSubject.asObservable();

  notificarClaseCreada(clase: ClaseCreada) {
    this.claseCreadaSubject.next(clase);
  }
}
