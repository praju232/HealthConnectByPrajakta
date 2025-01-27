import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private role: string | null = null;

  constructor(private http: HttpClient) { }

  login(role: string) {
    this.role = role;
    localStorage.setItem('userRole', role); // Optionally store role in localStorage
  }

  logout() {
    this.role = null;
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('doctorId');
  }

  isLoggedIn(): boolean {
    return this.role !== null; // Check if user is logged in
  }

  getUserRole(): string | null {
    if (this.role) {
      return this.role; // Return the stored role
    } else {
      return localStorage.getItem('userRole'); // Get role from localStorage if not set
    }
  }

 
}
