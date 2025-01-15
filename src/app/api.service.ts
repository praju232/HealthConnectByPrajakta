import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http:HttpClient) { }
  url = 'http://localhost:3000'; 
  getDataExp(){
    return this.http.get('localhost:3000/users');
  }
  post(url:any,data:any){
    return this.http.post(this.url+url,data);
  }
}
