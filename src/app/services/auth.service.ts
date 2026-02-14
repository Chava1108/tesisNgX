// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL de tu API en Django (ajusta esto)
  private apiUrl = 'http://localhost:8000/api/login/'; 

  // BehaviorSubject permite saber si estás logueado en tiempo real en cualquier componente
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) { 
    // Al iniciar, verificamos si ya existe una sesión guardada
    const token = sessionStorage.getItem('token'); // O 'usrid' si no usas tokens aún
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
    // sessionStorage se borra al cerrar la pestaña/navegador
    sessionStorage.setItem('Usrid', user.id.toString());
    sessionStorage.setItem('usrTmp', user.username);
    // Si tu backend devuelve un token, guárdalo también
    if(user.token) sessionStorage.setItem('token', user.token);
  }

  logout() {
    sessionStorage.clear(); // Borra todo
    localStorage.clear();   // Por si acaso quedó basura
    this._isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  obtenerUsuarioActual() {
    return {
      id: sessionStorage.getItem('Usrid'),
      username: sessionStorage.getItem('usrTmp')
    };
  }

  // Verifica si hay sesión activa (útil para el Guard)
  estaAutenticado(): boolean {
    return !!sessionStorage.getItem('Usrid'); // Retorna true si existe el ID
  }
}