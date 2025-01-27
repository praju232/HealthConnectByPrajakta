import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Doctor APIs
  doctorSignup(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/doctors/signup`, formData);
  }

  doctorSignin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/doctors/signin`, data);
  }

  getDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors`, { headers: this.getAuthHeaders() });
  }

  getDoctorById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/${id}`, { headers: this.getAuthHeaders() });
  }

  getDoctorProfile(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctors/${doctorId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  getDoctorAppointments(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/appointments?doctorId=${doctorId}`, { headers: this.getAuthHeaders() });

    // return this.http.get<any[]>(`${this.apiUrl}/doctors/appointments`, { headers: this.getAuthHeaders() });
  }

  getDoctorStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/doctors/stats`, { headers: this.getAuthHeaders() });
  }

  updateDoctorProfile(formData: FormData): Observable<any> {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      throw new Error('Doctor ID not found');
    }
    return this.http.put(`${this.apiUrl}/doctors/${doctorId}`, formData, { headers: this.getAuthHeaders() });
  }

  // Patient APIs
  patientSignup(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients/signup`, formData);
  }

  patientSignin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients/signin`, data);
  }

  getPatientById(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/patients/${id}`, { headers: this.getAuthHeaders() });
  }

  updatePatientProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/patients/${profileData._id}`, profileData, { headers: this.getAuthHeaders() });
  }
  // Consultation APIs
  createConsultation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultations`, data, { headers: this.getAuthHeaders() });
  }

  getDoctorConsultations(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/consultations/doctor/${doctorId}`);
  }

  getPatientConsultations(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/consultations/patient/${patientId}`, { headers: this.getAuthHeaders() });
  }

  updatePrescription(consultationId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/consultations/${consultationId}/prescription`, data, { headers: this.getAuthHeaders() });
  }

  getConsultationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/consultations/${id}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentDetails(appointmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/${appointmentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  savePrescription(prescriptionData: any) {
    return this.http.post(`${this.apiUrl}/prescriptions/`, prescriptionData,{ headers: this.getAuthHeaders() });
  }
  // Get prescription by appointment ID
  getPrescription(appointmentId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/prescriptions/${appointmentId}`,
      { headers: this.getAuthHeaders() }
    );
  }
  uploadPrescriptionPDF(formData: FormData, appointmentId: string): Observable<{ pdfUrl: string | null }> {
    return this.http.post<{ pdfUrl: string | null }>(
      `${this.apiUrl}/consultations/${appointmentId}/prescription/upload`, 
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  sendPrescriptionEmail(appointmentId: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/prescriptions/${appointmentId}/send`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  sendPrescriptionEmailWithPdf(formData: FormData): Observable<any> {
    return this.http.post( `${this.apiUrl}/prescriptions/send`, formData);
  }
  // Download prescription as PDF
  downloadPrescription(appointmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/prescriptions/${appointmentId}/download`, {
      responseType: 'blob'
    });
  }
}
