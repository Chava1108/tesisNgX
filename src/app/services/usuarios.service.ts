import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  servidor='http://localhost:9000/';

  constructor(private httpClient: HttpClient) { }

  getUsuarios(): any{
    return this.httpClient.get(`${this.servidor}usuario`);
  }

  postUsuarios(name:string, email:string, username:string, password:string):any{
    const body={name:name, email:email, username:username, password:password}
    return this.httpClient.post(`${this.servidor}usuario`,body);
  }
}
