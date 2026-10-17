import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';
import { SessionExpiringComponent } from '../dialogs/session-expiring/session-expiring.component';
import { environment } from '../../environments/environment';

/**
 * Único temporizador de sesión de la aplicación.
 * Cierra la sesión tras 10 minutos sin actividad real del usuario y avisa 1 minuto antes.
 * Se basa en la marca de tiempo de la última actividad (no en un setTimeout), por lo que
 * también funciona si el equipo se suspende o la pestaña queda en segundo plano.
 */
@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {

  private readonly LIMITE_INACTIVIDAD = 10 * 60 * 1000;
  private readonly AVISO_ANTES = 60 * 1000;
  private readonly INTERVALO_REVISION = 5 * 1000;
  private readonly CLAVE_ULTIMA_ACTIVIDAD = 'ultima_actividad';
  private readonly EVENTOS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart', 'scroll'];

  private apiUrl = `${environment.apiUrl}api/logout/`;
  private ultimaActividad = Date.now();
  private intervalo: any = null;
  private monitoreando = false;
  private cerrando = false;
  private avisoRef?: MatDialogRef<SessionExpiringComponent>;

  /**
   * Acción opcional que se ejecuta antes de cerrar la sesión por inactividad
   * (por ejemplo, guardar el archivo abierto en el área de trabajo).
   */
  antesDeCerrarSesion: (() => Observable<any>) | null = null;

  // Referencia fija para que removeEventListener elimine el mismo manejador
  private manejadorActividad = () => this.registrarActividad();

  constructor(
    private authService: AuthService,
    private ngZone: NgZone,
    private http: HttpClient,
    private dialog: MatDialog,
    private storage: SecureStorageService
  ) { }

  startMonitoring() {
    if (this.monitoreando || !this.authService.estaAutenticado()) return;
    this.monitoreando = true;
    this.cerrando = false;

    // Al recargar la página se conserva la última actividad de la pestaña
    const guardada = Number(sessionStorage.getItem(this.CLAVE_ULTIMA_ACTIVIDAD));
    this.ultimaActividad = guardada > 0 ? guardada : Date.now();
    this.guardarUltimaActividad();

    this.ngZone.runOutsideAngular(() => {
      // Fase de captura: el editor Monaco detiene la propagación de varias teclas
      this.EVENTOS.forEach((e) =>
        window.addEventListener(e, this.manejadorActividad, { capture: true, passive: true })
      );
      this.intervalo = setInterval(() => this.revisarInactividad(), this.INTERVALO_REVISION);
    });
    this.revisarInactividad();
  }

  stopMonitoring() {
    this.monitoreando = false;
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.EVENTOS.forEach((e) =>
      window.removeEventListener(e, this.manejadorActividad, { capture: true })
    );
    this.cerrarAviso();
  }

  private registrarActividad() {
    // Con el aviso abierto, el usuario debe elegir explícitamente si continúa
    if (this.avisoRef || this.cerrando) return;
    const ahora = Date.now();
    // Limitar escrituras a una por segundo (mousemove se dispara constantemente)
    if (ahora - this.ultimaActividad < 1000) return;
    this.ultimaActividad = ahora;
    this.guardarUltimaActividad();
  }

  private guardarUltimaActividad() {
    sessionStorage.setItem(this.CLAVE_ULTIMA_ACTIVIDAD, String(this.ultimaActividad));
  }

  private revisarInactividad() {
    if (!this.monitoreando || this.cerrando) return;
    if (!this.authService.estaAutenticado()) {
      this.ngZone.run(() => this.stopMonitoring());
      return;
    }

    const inactivo = Date.now() - this.ultimaActividad;
    if (inactivo >= this.LIMITE_INACTIVIDAD) {
      this.ngZone.run(() => this.cerrarSesion('timeout'));
    } else if (inactivo >= this.LIMITE_INACTIVIDAD - this.AVISO_ANTES && !this.avisoRef) {
      const segundos = Math.ceil((this.LIMITE_INACTIVIDAD - inactivo) / 1000);
      this.ngZone.run(() => this.mostrarAviso(segundos));
    }
  }

  private mostrarAviso(segundos: number) {
    this.avisoRef = this.dialog.open(SessionExpiringComponent, {
      width: '400px',
      disableClose: true,
      data: { segundos },
    });
    this.avisoRef.afterClosed().subscribe((resultado) => {
      this.avisoRef = undefined;
      if (resultado === 'extend') {
        this.ultimaActividad = Date.now();
        this.guardarUltimaActividad();
      } else if (resultado === 'logout') {
        this.cerrarSesion('manual');
      } else if (resultado === 'expired') {
        this.cerrarSesion('timeout');
      }
    });
  }

  private cerrarAviso() {
    if (this.avisoRef) {
      const ref = this.avisoRef;
      this.avisoRef = undefined;
      ref.close();
    }
  }

  private cerrarSesion(motivo: 'timeout' | 'manual') {
    if (this.cerrando) return;
    this.cerrando = true;
    this.cerrarAviso();

    // 1. Guardar el trabajo pendiente (máximo 5 s para no bloquear el cierre)
    const guardar$ = this.antesDeCerrarSesion
      ? this.antesDeCerrarSesion().pipe(timeout(5000), catchError(() => of(null)))
      : of(null);

    guardar$.subscribe(() => {
      // 2. Registrar el cierre en el backend (log de analítica)
      const token = this.storage.getItem('token');
      if (!token) {
        this.finalizarSesionLocal(motivo);
        return;
      }
      const headers = new HttpHeaders({ Authorization: `Token ${token}` });
      this.http.post(this.apiUrl, { motivo }, { headers }).subscribe({
        next: () => this.finalizarSesionLocal(motivo),
        error: (err) => {
          console.error('No se pudo registrar el cierre de sesión', err);
          this.finalizarSesionLocal(motivo);
        },
      });
    });
  }

  private finalizarSesionLocal(motivo: 'timeout' | 'manual') {
    this.stopMonitoring();
    this.antesDeCerrarSesion = null;
    this.authService.logout();
    if (motivo === 'timeout') {
      alert('Tu sesión se cerró por 10 minutos de inactividad. Si tenías un archivo abierto, se guardó automáticamente.');
    }
  }
}
