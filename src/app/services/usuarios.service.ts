import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  servidor = environment.apiUrl+'api/';

  constructor(private httpClient: HttpClient) { }

  // Solo responde si el nombre está libre: el registro ya no descarga la lista de cuentas (A-12)
  usuarioDisponible(username: string) {
    return this.httpClient.get<{ disponible: boolean }>(
      `${this.servidor}usuario-disponible?username=${encodeURIComponent(username)}`);
  }

  registrar(data: any): any {
    return this.httpClient.post(`${this.servidor}register/`, data);
  }
}
