import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TopbarComponent } from "./layouts/topbar/topbar.component";
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ToastrModule } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule,CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule, HttpClientModule, TopbarComponent,ToastrModule]
})
export class AppComponent {
  title = 'express-angular';
  data: any=[];

    showTopbar: boolean = true;
  userRole: any;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        // Hide topbar on login/signup pages
        const currentPath = event.urlAfterRedirects;
        if (currentPath.includes('/patient/login') || currentPath.includes('/patient/signup') || 
            currentPath.includes('/doctor/login') || currentPath.includes('') || currentPath.includes('/doctor/signup')) {
          this.showTopbar = false;
        } else {
          this.showTopbar = true;
        }

        // Update the userRole based on login status
        this.userRole = this.authService.getUserRole();

      });
  }

  logout() {
    this.authService.logout(); // Log the user out (use your auth logic here)
    this.userRole = null;
    this.router.navigate(['/patient/login']); // Redirect to login after logout
  }
// ngOnInit(): void {
//   this.api.getDataExp()
//   .subscribe((data) => {
//     console.log('Data from Express API:', data);
//     this.data=data;
//   })
// }
//   onSubmit() {
//     console.log('Form Submitted!', this.userForm.value);
//     if (this.userForm.valid) {
//       this.api.post("/api/create", this.userForm.value).subscribe((res:any) => {
//         console.log('Data sent to Express API:', res);
//       });

//     }
//   }
}
