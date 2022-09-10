import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class BaseDeDatosService {

  servidor='http://localhost:9000/';
  constructor(private httpClient: HttpClient) { }
  
  getClases(): any{
    return this.httpClient.get(`${this.servidor}clases`);
  }

  getAtributos(): any{
    return this.httpClient.get(`${this.servidor}atributos`);
  }

  getFunciones(): any{
    return this.httpClient.get(`${this.servidor}funciones`);
  }

  getHerencia(): any{
    return this.httpClient.get(`${this.servidor}herencia`);
  }
  
}
