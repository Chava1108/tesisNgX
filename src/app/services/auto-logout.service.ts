import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecureStorageService } from './secure-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {

  // CONFIGURACIÓN: 5 Minutos (según tu código) o 10
  private TIMEOUT_LIMIT = 10 * 60 * 1000; 
  private logoutTimer: any;
  private apiUrl = `${environment.apiUrl}api/logout/`; 

  // 1. CREAMOS UNA REFERENCIA FIJA AL MANEJADOR DE EVENTOS
  // Esto es vital para que removeEventListener funcione
  private eventHandler = () => this.resetTimer();

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private http: HttpClient,
    private storage: SecureStorageService
  ) { }

  startMonitoring() {
    // Solo iniciamos si está autenticado
    if (this.authService.estaAutenticado()) {
      this.resetTimer(); 
      
      // Agregamos la referencia fija
      window.addEventListener('click', this.eventHandler);
      window.addEventListener('mousemove', this.eventHandler);
      window.addEventListener('keypress', this.eventHandler);
      window.addEventListener('scroll', this.eventHandler, true);
      console.log('👁️ Vigilancia de inactividad iniciada');
    }
  }

  stopMonitoring() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    
    // 2. AHORA SÍ SE ELIMINAN LOS EVENTOS CORRECTAMENTE
    // Al pasar la misma referencia 'this.eventHandler', JS sabe cuál borrar
    window.removeEventListener('click', this.eventHandler);
    window.removeEventListener('mousemove', this.eventHandler);
    window.removeEventListener('keypress', this.eventHandler);
    window.removeEventListener('scroll', this.eventHandler, true);
    console.log('😴 Vigilancia detenida');
  }

  private resetTimer() {
    // 3. SEGURIDAD EXTRA: Si por alguna razón esto se dispara en el Login, lo frenamos
    if (!this.authService.estaAutenticado()) {
      this.stopMonitoring();
      return;
    }

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.ngZone.runOutsideAngular(() => {
      this.logoutTimer = setTimeout(() => {
        this.ngZone.run(() => {
          // 4. DOBLE CHECK ANTES DE CERRAR
          // Verificamos de nuevo antes de lanzar la alerta
          if (this.authService.estaAutenticado()) {
             this.logoutPorInactividad();
          } else {
             this.stopMonitoring();
          }
        });
      }, this.TIMEOUT_LIMIT);
    });
  }

  private logoutPorInactividad() {
    console.log("Cerrando sesión por inactividad...");
    
    const token = this.storage.getItem('token');
    
    // Si no hay token, no tiene caso llamar a la API, solo limpiamos local
    if (!token) {
        this.finalizarSesionLocal();
        return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Token ${token}` });
    
    this.http.post(this.apiUrl, { motivo: 'timeout' }, { headers: headers }).subscribe({
      next: () => {
        console.log("Log de inactividad guardado en BD");
        this.finalizarSesionLocal();
      },
      error: (err) => {
        console.error("No se pudo guardar el log", err);
        this.finalizarSesionLocal();
      }
    });
  }

  private finalizarSesionLocal() {
    this.stopMonitoring(); 
    this.authService.logout(); 
    alert("Tu sesión ha expirado por inactividad.");
  }
}