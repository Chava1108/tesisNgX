import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SecureStorageService } from './secure-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class BaseDeDatosService {

  servidor = environment.apiUrl+'api/';
  constructor(private httpClient: HttpClient, private storage: SecureStorageService) { }
  
  getClases(): any{
    return this.httpClient.get(`${this.servidor}clases`);
  }

  getUsuarios(): any {
    return this.httpClient.get(`${this.servidor}usuario`);
  }

  getClasesProyectId(id:number): any{
    return this.httpClient.get(`${this.servidor}clasesProyectId/${id}`);
  }

  getClasesId(nombre:string, id:number): any{
    return this.httpClient.get(`${this.servidor}clasesId?n1=${id}&n2=${nombre}`);
  }
  
  postClase(nivel: String, clase:string, imagen:string, id_proyecto:number, id_usuario:number):any{
    const body={nivel:nivel,nombre:clase,imagen:imagen, id_proyecto: id_proyecto, id_usuario:id_usuario}
    return this.httpClient.post(`${this.servidor}clases`,body);
  }

  postAtributos(nivel:string, nombre:string, tipo:string, id_clase:number):any{
    const body={nivel:nivel,nombre:nombre,tipo:tipo,id_clase:id_clase}
    return this.httpClient.post(`${this.servidor}atributos`,body);
  }

  postFunciones(nivel:string, nombre:string, tipo:string, id_clase:number):any{
    const body={nivel:nivel,nombre:nombre,tipo:tipo,id_clase:id_clase, es_metodo:true}
    return this.httpClient.post(`${this.servidor}funciones`,body);
  }

  postHerencia(idClaseHija: number, nombrePadre: string): any {
    const body = { id_clase_hija: idClaseHija, nombre_padre: nombrePadre };
    return this.httpClient.post(`${this.servidor}herencia`, body);
  }

  deleteClase(id:number){
    return this.httpClient.delete(`${this.servidor}clase/${id}`);
  }

  getInfoCompletaClase(idClase: number) {
    const userId = this.storage.getItem('Usrid') || '0';
    return this.httpClient.get(`${this.servidor}clase-info/${idClase}?user_id=${userId}`);
  }

  getCodigoFuncion(idClase: number, nombreFuncion: string, tipoRetorno: string) {
    const userId = this.storage.getItem('Usrid') || '0';
    return this.httpClient.get(
      `${this.servidor}clase-info/${idClase}/codigo-funcion?nombre=${encodeURIComponent(nombreFuncion)}&tipo=${encodeURIComponent(tipoRetorno)}&user_id=${userId}`
    );
  }
}
