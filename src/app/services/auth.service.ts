// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SecureStorageService } from './secure-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}api/login/`; 

  // BehaviorSubject permite saber si estás logueado en tiempo real en cualquier componente
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router, private storage: SecureStorageService) { 
    // Al iniciar, verificamos si ya existe una sesión guardada
    const token = this.storage.getItem('token');
    this._isLoggedIn.next(!!token);
  }

  login(credentials: any): Observable<any> {
    // IMPORTANTE: En lugar de pedir todos los usuarios, enviamos user/pass al backend
    // y el backend nos dice si es correcto o no.
    return this.http.post(this.apiUrl, credentials).pipe(
      tap((response: any) => {
        // Asumimos que el backend devuelve { id: 1, username: 'chava', token: '...' }
        if (response && response.id) {
          this.guardarSesion(response);
          this._isLoggedIn.next(true);
        }
      })
    );
  }

  private guardarSesion(user: any) {
    this.storage.setItem('Usrid', user.id.toString());
    this.storage.setItem('usrTmp', user.username);
    if(user.token) this.storage.setItem('token', user.token);
    if(user.is_admin !== undefined) this.storage.setItem('is_admin', user.is_admin.toString());
  }

  logout() {
    this.storage.clear();
    localStorage.clear();
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  obtenerUsuarioActual() {
    return {
      id: this.storage.getItem('Usrid'),
      username: this.storage.getItem('usrTmp')
    };
  }

  // Verifica si hay sesión activa (útil para el Guard)
  estaAutenticado(): boolean {
    return !!this.storage.getItem('Usrid');
  }
}