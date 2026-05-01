import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SecureStorageService } from '../services/secure-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private storage: SecureStorageService) {}

  canActivate(): boolean {
    if (!this.authService.estaAutenticado()) {
      this.router.navigate(['/login']);
      return false;
    }

    const isAdmin = this.storage.getItem('is_admin');
    if (isAdmin === '1') {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
