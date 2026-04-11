import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CodeService {
  constructor(private httpClient: HttpClient) {}
  servidor = 'http://hilite.me/api';
  servidorPython = 'http://127.0.0.1:8000/';
  postCode(code: string, linenos: number, lexers: string, style: string) {
    const body = { code: code, linenos: linenos, lexers: lexers, style: style };
    return this.httpClient.post(`${this.servidor}`, body);
  }

  analizarCodigo(code: string, idUsuario: number) {
    const body = {};
    return this.httpClient.post(`${this.servidor}`, body);
  }

  obtenerCodigoFuente(idClase: string | number) {
    return this.httpClient.get(
      `${this.servidorPython}/clases/${idClase}/codigo`
    );
  }

  listarArchivos(idProyecto: number) {
    return this.httpClient.get(
      `${this.servidorPython}/archivos-proyecto/${idProyecto}`
    );
  }

  leerArchivoPorRuta(rutaRelativa: string) {
    return this.httpClient.post(`${this.servidorPython}/leer-archivo`, {
      ruta: rutaRelativa,
    });
  }

  compilarProyecto(idProyecto: number, entradas: string = "") {
    return this.httpClient.post(`${this.servidorPython}/compilar-proyecto`, {
      id_proyecto: idProyecto, entradas: entradas
    });
  }

  guardarArchivo(rutaRelativa: string, contenido: string, id_proyecto:number) {
    return this.httpClient.post(`${this.servidorPython}/guardar-archivo`, {
      ruta_relativa: rutaRelativa,
      codigo: contenido,
      id_proyecto: id_proyecto
    });
  }

  registrarTooltip(idUsuario: number, palabra: string, lenguaje: string) {
    return this.httpClient.post(`${this.servidorPython}/api/tooltip-log`, {
      id_usuario: idUsuario,
      palabra: palabra,
      lenguaje: lenguaje
    });
  }
}
