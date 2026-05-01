import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamenService } from '../services/examen.service';
import { SecureStorageService } from '../services/secure-storage.service';

interface Pregunta {
  texto: string;
  opciones: string[];
  respuestaCorrecta: number; // índice 0-3
}

@Component({
  selector: 'app-realizar-test',
  templateUrl: './realizar-test.component.html',
  styleUrls: ['./realizar-test.component.css'],
})
export class RealizarTestComponent implements OnInit {
  tituloExamen: string = '';
  fechaDisponible: string = '';
  duracionMinutos: number = 30;

  preguntaActual: string = '';
  opciones: string[] = ['', '', '', ''];
  respuestaSeleccionada: number = -1;
  preguntas: Pregunta[] = [];
  guardando: boolean = false;

  constructor(private router: Router, private examenService: ExamenService, private storage: SecureStorageService) {}

  ngOnInit(): void {}

  agregarPregunta() {
    if (!this.preguntaActual.trim()) {
      alert('Escribe una pregunta antes de continuar.');
      return;
    }
    if (this.opciones.some((o) => !o.trim())) {
      alert('Completa todas las opciones de respuesta.');
      return;
    }
    if (this.respuestaSeleccionada < 0) {
      alert('Selecciona la respuesta correcta.');
      return;
    }

    this.preguntas.push({
      texto: this.preguntaActual.trim(),
      opciones: [...this.opciones.map((o) => o.trim())],
      respuestaCorrecta: this.respuestaSeleccionada,
    });

    this.preguntaActual = '';
    this.opciones = ['', '', '', ''];
    this.respuestaSeleccionada = -1;
  }

  eliminarPregunta(index: number) {
    this.preguntas.splice(index, 1);
  }

  finalizarTest() {
    if (!this.tituloExamen.trim()) {
      alert('Escribe un título para el examen.');
      return;
    }
    if (!this.fechaDisponible) {
      alert('Selecciona la fecha en que estará disponible el examen.');
      return;
    }
    if (this.preguntas.length === 0) {
      alert('Agrega al menos una pregunta antes de finalizar.');
      return;
    }

    this.guardando = true;
    const payload = {
      titulo: this.tituloExamen.trim(),
      fecha_disponible: this.fechaDisponible,
      duracion_minutos: this.duracionMinutos,
      creado_por: Number(this.storage.getItem('Usrid')),
      preguntas: this.preguntas.map((p, i) => ({
        texto: p.texto,
        orden: i + 1,
        opciones: p.opciones.map((op, j) => ({
          texto: op,
          letra: ['A', 'B', 'C', 'D'][j],
          es_correcta: j === p.respuestaCorrecta,
        })),
      })),
    };

    this.examenService.crearExamen(payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        alert(`Examen "${this.tituloExamen}" guardado con ${this.preguntas.length} pregunta(s).`);
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al guardar examen:', err);
        alert('Error al guardar el examen. Revisa la consola.');
      },
    });
  }

  letraOpcion: string[] = ['A', 'B', 'C', 'D'];

  trackByIndex(index: number): number {
    return index;
  }
}
