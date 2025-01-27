import { Component } from '@angular/core';
import { AuthService } from '../../../auth.service';
import { ApiService } from '../../../api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.css'
})
export class PatientProfileComponent {
  patientForm: FormGroup;
  patientData: any;

  constructor(
    private fb: FormBuilder,
    private authService: ApiService,
    // private toastr: ToastrService
  ) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      _id:[],
      profilePicture:[],
      age:[],
      height:[],
      weight:[],
      bloodGroup:[],
      emergencyContact:[],
      surgeryHistory:[],
      illnessHistory:[],
    });
  }

  ngOnInit(): void {
    this.loadPatientProfile();
  }
getFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/'; 
    return baseUrl + imagePath; 
}
  loadPatientProfile() {
   let patientId = localStorage.getItem('patientId')
    this.authService.getPatientById(patientId).subscribe((data: any) => {
      this.patientData = data;
      this.patientForm.patchValue(this.patientData); // Populate form with existing data
    }, (error: any) => {
      console.error('Error fetching patient profile:', error);
      // this.toastr.error('Failed to load patient profile.');
    });
  }

  updateProfile() {
    if (this.patientForm.valid) {
      this.authService.updatePatientProfile(this.patientForm.value).subscribe(() => {
        // this.toastr.success('Profile updated successfully!');
      }, (error: any) => {
        console.error('Error updating profile:', error);
        // this.toastr.error('Failed to update profile.');
      });
    } else {
      // this.toastr.warning('Please fill in all required fields.');
    }
  }

}
