import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  userRole: any;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  constructor(private router: Router,private authService:AuthService) {
    this.checkUserRole();

   
  }
  checkUserRole() {
    const userRole = this.authService.getUserRole(); // Implement this method in AuthService
    this.isDoctor = userRole === 'doctor';
    this.isPatient = userRole === 'patient';
  }

  navigateToProfile() {
    if (this.isDoctor) {
      this.router.navigate(['doctor/dashboard/profile']); // Adjust the route as necessary
    } else if (this.isPatient) {
      this.router.navigate(['patient/dashboard/profile']); // Adjust the route as necessary
    }
  }
  appointment(){
    this.router.navigate(['doctor/dashboard/doctor-profile']); // Adjust the route as necessary

  }
  logout() {
    // Implement your logout logic here
    // For example, clear user data from local storage
    localStorage.removeItem('user');
    console.log();
    const userRole = this.authService.getUserRole(); // Implement this method in AuthService

    if (userRole === 'patient') {
      this.router.navigate(['/patient/login']);
    } else if (userRole === 'doctor') {
      this.router.navigate(['/doctor/login']);
    } else{
     this.router.navigate(['/login']); // redirects to default login if no userRole is found
    }
  }
}
