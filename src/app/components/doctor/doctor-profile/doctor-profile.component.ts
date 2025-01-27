import { Component } from '@angular/core';
import { ApiService } from '../../../api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent {
  doctorProfile: any;
  appointments: any;
  stats = {
    totalPatientsCount: 0,
    totalAppointments: 0,
    totalEarnings: 0
  };  constructor(private apiService: ApiService,
    private router: Router
  ) {}
  ngOnInit() {
    this.loadDoctorProfile();
    this.loadAppointments();
    this.loadStats();
  }
  private loadDoctorProfile() {
    // Get doctor ID from localStorage or auth service
    const doctorId = localStorage.getItem('doctorId');
    
    if (!doctorId) {
      console.error('Doctor ID not found');
      return;
    }

    this.apiService.getDoctorProfile(doctorId).subscribe({
      next: (profile) => {
        this.doctorProfile = profile;
        console.log(profile,"njn")
        
        // Load these after profile is available
        this.loadAppointments();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }
  private loadAppointments() {
    if (this.doctorProfile?._id) {
      this.apiService.getDoctorAppointments(this.doctorProfile._id).subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          console.log(appointments,"appointments");
          
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
        }
      });
    }
  }

  private loadStats() {
    this.apiService.getDoctorStats().subscribe({
      next: (stats) => {
        console.log(stats,"stats");
        
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }
 
  navigateToPrescription(appointmentId: string) {
    console.log(appointmentId);
    
    this.router.navigate(['/doctor/prescription', appointmentId]);
  }

  writePrescription(consultationId: string) {
    this.router.navigate(['/doctor/prescription/new', consultationId]);
  }

  editPrescription(consultationId: string) {
    this.router.navigate(['/doctor/prescription/edit', consultationId]);
  }
}
