import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-session-expiring',
  templateUrl: './session-expiring.component.html',
  styleUrls: ['./session-expiring.component.css']
})
export class SessionExpiringComponent implements OnInit, OnDestroy {
  segundosRestantes: number = 60;
  private countdownSub?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<SessionExpiringComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { segundos: number }
  ) {
    if (data?.segundos) {
      this.segundosRestantes = data.segundos;
    }
  }

  ngOnInit(): void {
    this.iniciarContador();
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
  }

  iniciarContador() {
    this.countdownSub = interval(1000)
      .pipe(take(this.segundosRestantes))
      .subscribe({
        next: () => {
          this.segundosRestantes--;
          if (this.segundosRestantes <= 0) {
            this.dialogRef.close('expired');
          }
        },
        complete: () => {
          if (this.segundosRestantes <= 0) {
            this.dialogRef.close('expired');
          }
        }
      });
  }

  extenderSesion() {
    this.countdownSub?.unsubscribe();
    this.dialogRef.close('extend');
  }

  cerrarSesion() {
    this.countdownSub?.unsubscribe();
    this.dialogRef.close('logout');
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.segundosRestantes / 60);
    const segundos = this.segundosRestantes % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }
}
