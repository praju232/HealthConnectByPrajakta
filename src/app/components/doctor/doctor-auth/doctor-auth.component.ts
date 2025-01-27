import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-doctor-auth',
  templateUrl: './doctor-auth.component.html',
  styleUrls: ['./doctor-auth.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class DoctorAuthComponent {
  isSignUp = false;
  isProfile = false;
  authForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private authService:AuthService
  ) {
    this.initForm();
    
    // Subscribe to route data
    this.route.data.subscribe(data => {
      this.isSignUp = data['isSignUp'] ?? false;
      this.isProfile = data['isProfile'] ?? false;
      this.updateValidators();
      
      if (this.isProfile) {
        this.loadDoctorProfile();
      }
    });
  }

  private initForm() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: [''],
      specialty: [''],
      yearsOfExperience: [''],
      phoneNumber: [''],
      consultationFee: [''],
      profilePicture: [null],
      upiId:[Validators.required]
    });
  }

  private updateValidators() {
    const commonValidators = {
      email: [Validators.required, Validators.email],
      password: [Validators.required, Validators.minLength(6)]
    };

    // Reset all validators first
    Object.keys(this.authForm.controls).forEach(key => {
      this.authForm.get(key)?.clearValidators();
    });

    // Set validators based on form mode
    if (this.isSignUp || this.isProfile) {
      this.authForm.get('name')?.setValidators([Validators.required]);
      this.authForm.get('specialty')?.setValidators([Validators.required]);
      this.authForm.get('yearsOfExperience')?.setValidators([Validators.required]);
      this.authForm.get('phoneNumber')?.setValidators([Validators.required]);
      this.authForm.get('consultationFee')?.setValidators([Validators.required]);
    }

    // Always set email validator unless in profile mode
    if (!this.isProfile) {
      this.authForm.get('email')?.setValidators(commonValidators.email);
      this.authForm.get('password')?.setValidators(commonValidators.password);
    }
    
    // Update validity for all fields
    Object.keys(this.authForm.controls).forEach(key => {
      this.authForm.get(key)?.updateValueAndValidity();
    });
  }

  private loadDoctorProfile() {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      console.error('Doctor ID not found');
      return;
    }
    
    this.apiService.getDoctorProfile(doctorId).subscribe({
      next: (profile) => {
        this.authForm.patchValue(profile);
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        alert('Failed to load profile. Please try again.');
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.authForm.valid) {
      const formData = new FormData();
      Object.keys(this.authForm.value).forEach(key => {
        if (key !== 'profilePicture') {
          formData.append(key, this.authForm.value[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('profilePicture', this.selectedFile);
      }

      if (this.isSignUp) {
        this.apiService.doctorSignup(formData).subscribe({
          next: (response) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('doctorId', response.doctorId);
            this.router.navigate(['/doctor/login']);
            alert(response.message || 'Success');
            this.isSignUp=false
          },
          error: (error) => {
            console.error('Signup error:', error);
            alert(error.error.message || 'Failed to sign up. Please try again.');
          }
        });
      } else {
        this.apiService.doctorSignin(this.authForm.value).subscribe({
          next: (response) => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('doctorId', response.doctorId);
            this.router.navigate(['/doctor/dashboard/profile']);
            this.authService.login('doctor');
          },
          error: (error) => {
            console.error('Login error:', error);
            alert(error.error.message || 'Failed to log in. Please try again.');
          }
        });
      }
    }
  }

  toggleForm() {
    this.isSignUp = !this.isSignUp;
    this.updateValidators();
    this.authForm.reset();
  }
}
