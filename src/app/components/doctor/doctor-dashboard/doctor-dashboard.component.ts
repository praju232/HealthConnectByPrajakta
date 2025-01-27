import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DoctorDashboardComponent implements OnInit {
  doctorProfile: any;
  appointments: any[] = [];
  stats = {
    totalPatientsCount: 0,
    totalAppointments: 0,
    totalEarnings: 0
  };
  consultations: any[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDoctorProfile();

  }
  navigateToEditProfile() {
    // this.router.navigate(['/edit-doctor-profile']); // Or whatever path you want
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
        // this.loadAppointments();
        // this.loadStats();
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }


  downloadPrescription(consultationId: string) {
    this.apiService.downloadPrescription(consultationId).subscribe({
      next: (response: Blob) => {
        // Create a blob from the PDF data
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `prescription_${consultationId}.pdf`;
        link.click();
        
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading prescription:', error);
      }
    });
  }

  sendPrescription(consultationId: string) {
    // this.apiService.sendPrescriptionEmail(consultationId).subscribe({
    //   next: () => {
    //     // Show success message
    //     alert('Prescription sent successfully to patient');
    //   },
    //   error: (error) => {
    //     console.error('Error sending prescription:', error);
    //     alert('Failed to send prescription');
    //   }
    // });
  }

  editProfile() {
    this.router.navigate(['/doctor/dashboard/profile']);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/default-doctor.png'; // Fallback image
  }

  
}
