import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  servidor = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getUsuarios(): any{
    return this.httpClient.get(`${this.servidor}usuario`);
  }

  postUsuarios(name:string, email:string, username:string, password:string):any{
    const body={name:name, email:email, username:username, password:password}
    return this.httpClient.post(`${this.servidor}usuario`,body);
  }

  registrar(data: any): any {
    return this.httpClient.post(`${this.servidor}api/register/`, data);
  }
}
