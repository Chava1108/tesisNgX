import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PoryectosService {
  servidor='http://localhost:9000/';
  constructor( private httpClient: HttpClient ) { }

  getProyectos(id: any){
    return this.httpClient.get(`${this.servidor}proyecto/${id}`)
  }

  postProyectos(nombre:any, id_usr:any){
    const body={nombre:nombre,id_usr:id_usr}
    return this.httpClient.post(`${this.servidor}proyecto`,body);
  }
}
