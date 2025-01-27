import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DoctorListComponent implements OnInit {
  doctors: any[] = [];
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.apiService.getDoctors().subscribe({
      next: (response: any) => {
        this.doctors = response;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load doctors. Please try again later.';
        this.loading = false;
      }
    });
  }

  onConsult(doctorId: string) {
    if (!localStorage.getItem('patientId')) {
      alert('Please sign in as a patient first');
      this.router.navigate(['/patient/login']);
      return;
    }
    this.router.navigate(['/consultation', doctorId]);
  }
}
