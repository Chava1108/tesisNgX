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

  getClasesId(nombre:string): any{
    return this.httpClient.get(`${this.servidor}clases/${nombre}`);
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
  
  postClase(nivel: String, clase:string, imagen:string):any{
    const body={nivel:nivel,nombre:clase,imagen:imagen}
    return this.httpClient.post(`${this.servidor}clases`,body);
  }

  postAtributos(nivel:string, nombre:string, tipo:string, id_clase:number):any{
    const body={nivel:nivel,nombre:nombre,tipo:tipo,id_clase:id_clase}
    return this.httpClient.post(`${this.servidor}atributos`,body);
  }

  postFunciones(nivel:string, nombre:string, tipo:string, id_clase:number):any{
    const body={nivel:nivel,nombre:nombre,tipo:tipo,id_clase:id_clase}
    return this.httpClient.post(`${this.servidor}funciones`,body);
  }

  postHerencia(id_clasePadre:number, id_claseHijo:number):any{
    const body={id_clasePadre:id_clasePadre,id_claseHijo:id_claseHijo}
    return this.httpClient.post(`${this.servidor}herencia`,body);
  }

  deleteClase(id:number){
    return this.httpClient.delete(`${this.servidor}clase/${id}`);
  }

  deleteAtributos(id:number){
    return this.httpClient.delete(`${this.servidor}atributos/${id}`);
  }

  deleteFunciones(id:number){
    return this.httpClient.delete(`${this.servidor}funciones/${id}`);
  }

  deleteHerencia(id:number){
    return this.httpClient.delete(`${this.servidor}herencia/${id}`);
  }

  putAtributos(nivel:String, tipo:string, nombre:string, id:any):any{
    const body = {nivel:nivel, nombre:nombre, tipo:tipo}
    return this.httpClient.put(`${this.servidor}atributos/${id}`,body);
  }

  putFunciones(nivel:String, tipo:string,nombre:string, id:any):any{
    const body = {nivel:nivel, nombre:nombre, tipo:tipo}
    return this.httpClient.put(`${this.servidor}funciones/${id}`,body);
  }
}
