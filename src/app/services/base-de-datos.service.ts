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

  getClasesProyectId(id:number): any{
    return this.httpClient.get(`${this.servidor}clasesProyectId/${id}`);
  }

  getClasesId(nombre:string, id:number): any{
    return this.httpClient.get(`${this.servidor}clasesId?n1=${id}&n2=${nombre}`);
  }

  getAtributos(): any{
    return this.httpClient.get(`${this.servidor}atributos`);
  }

  getFunciones(): any{
    return this.httpClient.get(`${this.servidor}funciones`);
  }

  getHerencia(id_proyecto:any): any{
    return this.httpClient.get(`${this.servidor}herencia/${id_proyecto}`);
  }
  
  postClase(nivel: String, clase:string, imagen:string, id_proyecto:number):any{
    const body={nivel:nivel,nombre:clase,imagen:imagen, id_proyecto: id_proyecto}
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

  deleteHerenciaPadre(id:number){
    return this.httpClient.delete(`${this.servidor}herenciaP/${id}`);
  }

  putAtributos(nivel:String, tipo:string, nombre:string, id:any):any{
    const body = {nivel:nivel, nombre:nombre, tipo:tipo}
    return this.httpClient.put(`${this.servidor}atributos/${id}`,body);
  }

  putFunciones(nivel:String, tipo:string,nombre:string, id:any):any{
    const body = {nivel:nivel, nombre:nombre, tipo:tipo}
    return this.httpClient.put(`${this.servidor}funciones/${id}`,body);
  }

  getAtributosHeredos(id:number){
    return this.httpClient.get(`${this.servidor}atributosHeredados/${id}`);
  }
}
