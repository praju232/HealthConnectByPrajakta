import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-patient-auth',
  templateUrl: './patient-auth.component.html',
  styleUrls: ['./patient-auth.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PatientAuthComponent {
  isSignUp = false;
  authForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private auth:AuthService
  ) {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: [''],
      age: [''],
      phoneNumber: [''],
      surgeryHistory: [''],
      illnessHistory: [''],
      profilePicture: [null]
    });

    // Subscribe to route data to determine if we're in signup mode
    this.route.data.subscribe(data => {
      this.isSignUp = data['isSignUp'] ?? false;
      this.updateValidators();
    });
  }

  private updateValidators() {
    const nameControl = this.authForm.get('name');
    const ageControl = this.authForm.get('age');
    const phoneNumberControl = this.authForm.get('phoneNumber');
    const surgeryHistoryControl = this.authForm.get('surgeryHistory');
    const illnessHistoryControl = this.authForm.get('illnessHistory');

    if (this.isSignUp) {
      nameControl?.setValidators([Validators.required]);
      ageControl?.setValidators([Validators.required, Validators.min(0), Validators.max(150)]);
      phoneNumberControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{10}$')]);
      surgeryHistoryControl?.setValidators([Validators.required]);
      illnessHistoryControl?.setValidators([Validators.required]);
    } else {
      nameControl?.clearValidators();
      ageControl?.clearValidators();
      phoneNumberControl?.clearValidators();
      surgeryHistoryControl?.clearValidators();
      illnessHistoryControl?.clearValidators();
    }

    nameControl?.updateValueAndValidity();
    ageControl?.updateValueAndValidity();
    phoneNumberControl?.updateValueAndValidity();
    surgeryHistoryControl?.updateValueAndValidity();
    illnessHistoryControl?.updateValueAndValidity();
  }

  toggleForm() {
    this.isSignUp = !this.isSignUp;
    this.updateValidators();
    this.authForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      this.selectedFile = file;
    }
  }

  async onSubmit() {
    if (this.authForm.valid) {
      console.log(this.isSignUp,"signin");
      
      try {
        if (this.isSignUp) {
          // For signup, use FormData to handle file upload
          const formData = new FormData();
          Object.keys(this.authForm.value).forEach(key => {
            if (this.authForm.value[key] !== null && this.authForm.value[key] !== '') {
              formData.append(key, this.authForm.value[key]);
            }
          });

          if (this.selectedFile) {
            formData.append('profilePicture', this.selectedFile);
          }

          await this.apiService.patientSignup(formData).toPromise();
          this.router.navigate(['/patient/login']);
        } else {
          console.log("response");
          // For signin, just send email and password as JSON
          const signinData = {
            email: this.authForm.value.email,
            password: this.authForm.value.password
          };
          const response = await this.apiService.patientSignin(signinData).toPromise();
          
          // Store token and navigate to dashboard
          localStorage.setItem('token', response.token);
          localStorage.setItem('patientId', response.patientId);
          this.router.navigate(['/patient/dashboard/doctors']);
          this.auth.login('patient');
        }
      } catch (error: any) {
        // Show error message from the server or a default message
        alert(error.error?.message || error.message || 'An error occurred');
      }
    } else {
      // Mark all invalid fields as touched to show validation errors
      Object.keys(this.authForm.controls).forEach(key => {
        const control = this.authForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
