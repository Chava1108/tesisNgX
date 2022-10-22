import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CodeService {

  constructor(private httpClient: HttpClient) { }
  servidor='http://hilite.me/api';

  postCode(code:string, linenos:number, lexers:string, style:string){
  
    const body={code:code,linenos:linenos,lexers:lexers,style:style}
    return this.httpClient.post(`${this.servidor}`,body);
  }
}
