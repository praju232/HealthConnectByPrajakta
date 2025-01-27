import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../api.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-consultation-form',
  templateUrl: './consultation-form.component.html',
  styleUrls: ['./consultation-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ConsultationFormComponent implements OnInit {
  currentStep = 1;
  consultationForm: FormGroup;
  doctorId: string = '';
  doctor: any;
  qrCodeUrl: string = '';
  upiId = '8080232160';
  amount = '600';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.consultationForm = this.fb.group({
      // Step 1
      currentIllness: ['', Validators.required],
      recentSurgery: [''],
      surgeryTimespan: [''],
      dateTime:[new Date()],
      // Step 2
      isDiabetic: [false],
      allergies: [''],
      otherConditions: [''],

      // Step 3
      transactionId: ['', Validators.required],
      consent: [false, Validators.requiredTrue],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.doctorId = params['id'];
    });
    this.loadDoctorDetails();
  }

  loadDoctorDetails() {
    this.apiService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.generateQRCode(doctor.upiId, doctor.consultationFee);
      },
      error: (error) => {
        alert('Failed to load doctor details');
        this.router.navigate(['/doctors']);
      }
    });
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    if (this.consultationForm.valid) {
      const consultationData = {
        ...this.consultationForm.value,
        doctorId: this.doctorId,
        patientId: localStorage.getItem('patientId')
      };

      this.apiService.createConsultation(consultationData).subscribe({
        next: () => {
          alert('Consultation request submitted successfully!');
          this.router.navigate(['/doctors']);
        },
        error: (error) => {
          alert('Failed to submit consultation request. Please try again.');
        }
      });
    }
  }

  private async generateQRCode(upiId: string, amount: number) {
    try {
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(this.doctor.name)}&am=${amount}&cu=INR`;
      console.log('UPI URL:', upiUrl);
      this.qrCodeUrl = await QRCode.toDataURL(upiUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      this.qrCodeUrl = 'assets/fallback-qr.png';
    }
  }
}
