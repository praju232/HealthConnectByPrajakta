import { Routes } from '@angular/router';
import { PatientAuthComponent } from './components/patient/patient-auth/patient-auth.component';
import { DoctorAuthComponent } from './components/doctor/doctor-auth/doctor-auth.component';
import { DoctorListComponent } from './components/doctor/doctor-list/doctor-list.component';
import { ConsultationFormComponent } from './components/consultation/consultation-form/consultation-form.component';
import { DoctorDashboardComponent } from './components/doctor/doctor-dashboard/doctor-dashboard.component';
import { PrescriptionComponent } from './components/prescription/prescription.component';
import { PatientProfileComponent } from './components/patient/patient-profile/patient-profile.component';
import { DoctorProfileComponent } from './components/doctor/doctor-profile/doctor-profile.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
  // Default route
  // { path: '', redirectTo: '/patient/login', pathMatch: 'full' },
  { path: '', component: LandingPageComponent }, // Default route for the landing page

  // Patient routes
  {
    path: 'patient',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: PatientAuthComponent, data: { isSignUp: false } },
      { path: 'signup', component: PatientAuthComponent, data: { isSignUp: true } },
      {
        path: 'dashboard',
        children: [
          { path: '', redirectTo: 'doctors', pathMatch: 'full' },
          { path: 'doctors', component: DoctorListComponent },
          { path: 'consultation/:doctorId', component: ConsultationFormComponent },
          { path: 'profile', component: PatientProfileComponent } // Add patient profile route

        ]
      }
    ]
  },
  
  // Doctor routes
  {
    path: 'doctor',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: DoctorAuthComponent, data: { isSignUp: false } },
      { path: 'signup', component: DoctorAuthComponent, data: { isSignUp: true } },
      {
        path: 'dashboard',
        children: [
          { path: '', redirectTo: 'consultations', pathMatch: 'full' },
          { path: 'consultations', component: ConsultationFormComponent },
          { path: 'profile', component: DoctorDashboardComponent },
          // { path: 'dashboard', component: DoctorListComponent },
          { path: 'doctor-profile', component: DoctorProfileComponent }
        ]
      },
      {
        path: 'prescription',
        children: [
          { path: ':id', component: PrescriptionComponent },
          { path: 'new/:consultationId', component: PrescriptionComponent },
          { path: 'edit/:consultationId', component: PrescriptionComponent }
        ]
      }
    ]
  },
  
  // Consultation routes
  {
    path: 'consultation',
    children: [
      { path: '', redirectTo: '/patient/dashboard/doctors', pathMatch: 'full' },
      { path: ':id', component: ConsultationFormComponent },
      { path: 'new/:doctorId', component: ConsultationFormComponent }
    ]
  },
  
  // Prescription routes
  // {
  //   path: 'prescription/:id',
  //   component: PrescriptionComponent
  // },
  
  // Catch-all route for 404
  { path: '**', redirectTo: '/patient/login' }
];
