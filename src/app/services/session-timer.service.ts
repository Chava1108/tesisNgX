import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { SessionExpiringComponent } from '../dialogs/session-expiring/session-expiring.component';
import { SecureStorageService } from './secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimerService implements OnDestroy {
  // Tiempo de sesión en milisegundos (15 minutos por defecto)
  private readonly SESSION_DURATION = 15 * 60 * 1000;
  // Tiempo antes de expirar para mostrar advertencia (1 minuto)
  private readonly WARNING_BEFORE_EXPIRE = 60 * 1000;
  
  private sessionTimer?: Subscription;
  private warningTimer?: Subscription;
  private dialogRef?: MatDialogRef<SessionExpiringComponent>;
  private lastActivity: number = Date.now();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private storage: SecureStorageService
  ) {}

  ngOnDestroy(): void {
    this.detenerTemporizadores();
  }

  iniciarSesion() {
    this.lastActivity = Date.now();
    this.storage.setItem('session_start', this.lastActivity.toString());
    this.iniciarTemporizadores();
  }

  private iniciarTemporizadores() {
    this.detenerTemporizadores();
    
    // Timer para mostrar advertencia (1 minuto antes de expirar)
    const tiempoParaAdvertencia = this.SESSION_DURATION - this.WARNING_BEFORE_EXPIRE;
    
    this.warningTimer = timer(tiempoParaAdvertencia).subscribe(() => {
      this.mostrarAdvertencia();
    });

    // Timer para expirar sesión
    this.sessionTimer = timer(this.SESSION_DURATION).subscribe(() => {
      this.expirarSesion();
    });
  }

  private mostrarAdvertencia() {
    // Si ya hay un diálogo abierto, no abrir otro
    if (this.dialogRef) return;

    this.dialogRef = this.dialog.open(SessionExpiringComponent, {
      width: '400px',
      disableClose: true,
      data: { segundos: 60 }
    });

    this.dialogRef.afterClosed().subscribe((resultado) => {
      this.dialogRef = undefined;
      
      switch (resultado) {
        case 'extend':
          this.extenderSesion();
          break;
        case 'logout':
        case 'expired':
          this.expirarSesion();
          break;
      }
    });
  }

  extenderSesion() {
    this.lastActivity = Date.now();
    this.storage.setItem('session_start', this.lastActivity.toString());
    this.iniciarTemporizadores();
  }

  registrarActividad() {
    // Solo reiniciar si no está mostrando el diálogo de advertencia
    if (!this.dialogRef) {
      this.lastActivity = Date.now();
      // Reiniciar temporizadores en cada actividad del usuario
      this.iniciarTemporizadores();
    }
  }

  private expirarSesion() {
    this.detenerTemporizadores();
    this.storage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private detenerTemporizadores() {
    this.warningTimer?.unsubscribe();
    this.sessionTimer?.unsubscribe();
  }

  detenerSesion() {
    this.detenerTemporizadores();
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = undefined;
    }
  }
}
