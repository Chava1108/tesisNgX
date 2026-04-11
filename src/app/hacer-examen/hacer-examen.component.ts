import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ExamenService } from '../services/examen.service';

@Component({
  selector: 'app-hacer-examen',
  templateUrl: './hacer-examen.component.html',
  styleUrls: ['./hacer-examen.component.css'],
})
export class HacerExamenComponent implements OnInit, OnDestroy {
  // Estado de la vista
  vista: 'lista' | 'examen' | 'resultado' = 'lista';

  // Lista de exámenes disponibles
  examenesDisponibles: any[] = [];

  // Examen activo
  examen: any = null;
  idIntento: number = 0;
  respuestas: { [idPregunta: number]: number } = {}; // idPregunta -> idOpcion
  enviando: boolean = false;

  // Temporizador
  tiempoRestante: number = 0; // en segundos
  timerInterval: any = null;

  // Resultado
  resultado: any = null;

  idEstudiante: number = 0;

  constructor(private router: Router, private examenService: ExamenService) {}

  ngOnInit(): void {
    this.idEstudiante = Number(sessionStorage.getItem('Usrid'));
    this.cargarExamenesDisponibles();
  }

  ngOnDestroy(): void {
    this.detenerTimer();
  }

  cargarExamenesDisponibles() {
    this.examenService.listarExamenesDisponibles(this.idEstudiante).subscribe({
      next: (res: any) => {
        this.examenesDisponibles = res;
      },
      error: (err: any) => console.error('Error cargando exámenes:', err),
    });
  }

  iniciarExamen(examen: any) {
    // 1. Registrar intento
    this.examenService.iniciarIntento(examen.id, this.idEstudiante).subscribe({
      next: (intento: any) => {
        this.idIntento = intento.id;

        // 2. Cargar preguntas
        this.examenService.obtenerExamenEstudiante(examen.id).subscribe({
          next: (data: any) => {
            this.examen = data;
            this.respuestas = {};
            this.vista = 'examen';
            this.iniciarTimer(data.duracion_minutos);
          },
          error: (err: any) => {
            console.error('Error cargando examen:', err);
            alert('No se pudo cargar el examen.');
          },
        });
      },
      error: (err: any) => {
        console.error('Error iniciando intento:', err);
        alert(err.error?.error || 'No se pudo iniciar el examen.');
      },
    });
  }

  seleccionarOpcion(idPregunta: number, idOpcion: number) {
    this.respuestas[idPregunta] = idOpcion;
  }

  enviarExamen() {
    const totalPreguntas = this.examen.preguntas.length;
    const totalRespondidas = Object.keys(this.respuestas).length;

    if (totalRespondidas < totalPreguntas) {
      const sinResponder = totalPreguntas - totalRespondidas;
      if (!confirm(`Tienes ${sinResponder} pregunta(s) sin responder. ¿Deseas enviar de todas formas?`)) {
        return;
      }
    }

    this.enviando = true;
    this.detenerTimer();

    const payload = this.examen.preguntas.map((p: any) => ({
      id_pregunta: p.id,
      id_opcion_elegida: this.respuestas[p.id] || null,
    }));

    this.examenService.enviarRespuestas(this.idIntento, payload).subscribe({
      next: (res: any) => {
        this.enviando = false;
        this.resultado = res;
        this.vista = 'resultado';
      },
      error: (err: any) => {
        this.enviando = false;
        console.error('Error enviando respuestas:', err);
        alert('Error al enviar. Intenta de nuevo.');
      },
    });
  }

  // --- TEMPORIZADOR ---
  iniciarTimer(minutos: number) {
    this.tiempoRestante = minutos * 60;
    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        this.detenerTimer();
        alert('Se acabó el tiempo. Tu examen será enviado automáticamente.');
        this.enviarExamen();
      }
    }, 1000);
  }

  detenerTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get tiempoFormateado(): string {
    const min = Math.floor(this.tiempoRestante / 60);
    const seg = this.tiempoRestante % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }

  get preguntasRespondidas(): number {
    return Object.keys(this.respuestas).length;
  }

  volverALista() {
    this.vista = 'lista';
    this.examen = null;
    this.resultado = null;
    this.cargarExamenesDisponibles();
  }

  irAlHome() {
    this.router.navigate(['/home']);
  }
}
