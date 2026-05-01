import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartConfiguration, ChartData } from 'chart.js';
import { SecureStorageService } from '../services/secure-storage.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private apiUrl = 'http://localhost:8000/api/dashboard-analytics';

  // Filtros
  usuarios: any[] = [];
  usuarioSeleccionado: string = '';
  diasSeleccionados: number = 14;

  // Resumen
  resumen: any = {};

  // Charts
  tiempoSesionData: ChartData<'bar'> = { labels: [], datasets: [] };
  tiempoSesionOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Tiempo en sesión por día (min)', color: '#cdd6f4' }
    },
    scales: {
      x: { ticks: { color: '#bac2de' }, grid: { color: '#313244' } },
      y: { ticks: { color: '#bac2de' }, grid: { color: '#313244' }, beginAtZero: true }
    }
  };

  compilacionesData: ChartData<'bar'> = { labels: [], datasets: [] };
  compilacionesOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Compilaciones por día', color: '#cdd6f4' }
    },
    scales: {
      x: { ticks: { color: '#bac2de' }, grid: { color: '#313244' } },
      y: { ticks: { color: '#bac2de' }, grid: { color: '#313244' }, beginAtZero: true }
    }
  };

  tiempoDiagramasData: ChartData<'line'> = { labels: [], datasets: [] };
  tiempoDiagramasOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Tiempo viendo diagramas por día (min)', color: '#cdd6f4' }
    },
    scales: {
      x: { ticks: { color: '#bac2de' }, grid: { color: '#313244' } },
      y: { ticks: { color: '#bac2de' }, grid: { color: '#313244' }, beginAtZero: true }
    }
  };

  accionesData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  accionesOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'right', labels: { color: '#cdd6f4' } },
      title: { display: true, text: 'Distribución de acciones', color: '#cdd6f4' }
    }
  };

  cargando = false;

  constructor(private http: HttpClient, private storage: SecureStorageService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    const token = this.storage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Token ${token}` });

    let url = `${this.apiUrl}?dias=${this.diasSeleccionados}`;
    if (this.usuarioSeleccionado) {
      url += `&usuario_id=${this.usuarioSeleccionado}`;
    }

    this.http.get<any>(url, { headers }).subscribe({
      next: (data) => {
        this.usuarios = data.usuarios || [];
        this.resumen = data.resumen || {};
        this.actualizarGraficas(data);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando analytics:', err);
        this.cargando = false;
      }
    });
  }

  actualizarGraficas(data: any): void {
    // Tiempo en sesión
    const sesionLabels = data.tiempo_sesion_por_dia.map((d: any) => d.fecha.slice(5)); // MM-DD
    const sesionValues = data.tiempo_sesion_por_dia.map((d: any) => d.minutos);
    this.tiempoSesionData = {
      labels: sesionLabels,
      datasets: [{
        label: 'Minutos en sesión',
        data: sesionValues,
        backgroundColor: 'rgba(137, 180, 250, 0.6)',
        borderColor: '#89b4fa',
        borderWidth: 1
      }]
    };

    // Compilaciones (errores vs éxitos)
    const allDates = new Set<string>();
    data.errores_compilacion_por_dia.forEach((d: any) => allDates.add(d.fecha));
    data.exitos_compilacion_por_dia.forEach((d: any) => allDates.add(d.fecha));
    const sortedDates = Array.from(allDates).sort();
    const erroresMap: any = {};
    const exitosMap: any = {};
    data.errores_compilacion_por_dia.forEach((d: any) => erroresMap[d.fecha] = d.cantidad);
    data.exitos_compilacion_por_dia.forEach((d: any) => exitosMap[d.fecha] = d.cantidad);

    this.compilacionesData = {
      labels: sortedDates.map(d => d.slice(5)),
      datasets: [
        {
          label: 'Exitosas',
          data: sortedDates.map(d => exitosMap[d] || 0),
          backgroundColor: 'rgba(166, 227, 161, 0.6)',
          borderColor: '#a6e3a1',
          borderWidth: 1
        },
        {
          label: 'Errores',
          data: sortedDates.map(d => erroresMap[d] || 0),
          backgroundColor: 'rgba(243, 139, 168, 0.6)',
          borderColor: '#f38ba8',
          borderWidth: 1
        }
      ]
    };

    // Tiempo viendo diagramas
    const diagLabels = data.tiempo_diagramas_por_dia.map((d: any) => d.fecha.slice(5));
    const diagValues = data.tiempo_diagramas_por_dia.map((d: any) => d.minutos);
    this.tiempoDiagramasData = {
      labels: diagLabels,
      datasets: [{
        label: 'Minutos viendo diagramas',
        data: diagValues,
        borderColor: '#cba6f7',
        backgroundColor: 'rgba(203, 166, 247, 0.2)',
        fill: true,
        tension: 0.3
      }]
    };

    // Acciones resumen (doughnut)
    const colores = [
      '#89b4fa', '#a6e3a1', '#f38ba8', '#fab387', '#f9e2af',
      '#cba6f7', '#94e2d5', '#89dceb', '#74c7ec', '#b4befe'
    ];
    this.accionesData = {
      labels: data.acciones_resumen.map((a: any) => a.accion),
      datasets: [{
        data: data.acciones_resumen.map((a: any) => a.total),
        backgroundColor: colores.slice(0, data.acciones_resumen.length),
      }]
    };
  }

  filtrar(): void {
    this.cargarDatos();
  }
}
