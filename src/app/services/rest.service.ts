import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http:HttpClient) {

  }

  sendPost(body:FormData):Observable<any>{
    return this.http.post(`${environment.apiUrl}api/upload`,body)
  }
}