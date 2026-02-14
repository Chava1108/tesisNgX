import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.estaAutenticado()) {
      return true; // Puede pasar
    } else {
      this.router.navigate(['/login']); // No logueado -> Login
      return false;
    }
  }
}