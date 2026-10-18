import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SecureStorageService } from '../services/secure-storage.service';

/**
 * El grupo de control del estudio solo presenta exámenes: no entra a sus proyectos
 * ni al área de trabajo. Se usa junto con AuthGuard.
 */
@Injectable({ providedIn: 'root' })
export class GrupoGuard implements CanActivate {
  constructor(private storage: SecureStorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.storage.getItem('grupo') === 'control') {
      this.router.navigate(['/hacer-examen']);
      return false;
    }
    return true;
  }
}
