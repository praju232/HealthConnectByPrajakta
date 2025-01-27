import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { SafePipe } from '../../pipes/safe.pipe';
import jspdf, { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpErrorResponse } from '@angular/common/http';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafePipe]
})
export class PrescriptionComponent implements OnInit {
    prescriptionForm: FormGroup;
    appointmentId: string | undefined;
    appointment: any;
    doctorName: string = '';
    currentDate: Date = new Date();
    pdfUrl: string | null = null;
    isSending: boolean = false;
    isGenerating = false;
    isLoading!: boolean;
    successMessage: string | undefined;
    errorMessage: any;
    constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private api:ApiService,
    //   private toastr: ToastrService
      // Add your service
    ) {
      this.prescriptionForm = this.fb.group({
        careToBeTaken: ['', Validators.required],
        medicines: ['']
      });
    }
  
    ngOnInit() {
      this.appointmentId = this.route.snapshot.params['id'];
      this.loadAppointmentDetails();
      this.getPrescription()
    }
    getPrescription(){
        if (this.appointmentId) {
            console.error('appointmentId not found');
            return;
          }
        this.api.getPrescription(this.appointmentId).subscribe((res:any)=>{
            console.log(res);
            
        })
        
    }
    loadAppointmentDetails() {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
        console.error('Doctor ID not found');
        return;
      }
    this.api.getDoctorProfile(doctorId).subscribe({
        next: (response) => {
            this.appointment = response;
          // Assuming the doctor details are in the response
          this.doctorName = response.name || 'Dr. Not Available';
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        }
      });
    }
     // Submit the prescription form
  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = {
      ...this.prescriptionForm.value,
      appointmentId: this.appointmentId,
      doctorId:localStorage.getItem('doctorId'),
      patientId:localStorage.getItem('patientId')
    };

    this.api.savePrescription(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Prescription saved successfully!';
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error.message || 'Failed to save prescription';
        this.isLoading = false;
      }
    });
  }

  // Download the prescription as a PDF
  onDownload(): void {
    if (!this.appointmentId) {
        return;
      }
    this.isLoading = true;
    this.api.downloadPrescription(this.appointmentId).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        saveAs(blob, `prescription-${this.appointmentId}.pdf`);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error.message || 'Failed to download prescription';
        this.isLoading = false;
      }
    });
  }

onSendEmail(): void {
    this.isLoading = true;

    const content = document.getElementById('dd') as HTMLElement;

    if (!content) {
        this.errorMessage = 'Prescription content not found.';
        this.isLoading = false;
        // this.toastr.error(this.errorMessage); // Show error toast
        return;
    }

    html2canvas(content, {
        scale: 3,
        useCORS: true,
    }).then(canvas => {
        const pdf = new jsPDF('p', 'pt', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = 595.28; // A4 width in points
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            remainingHeight -= 841.89; // A4 height in points
            position -= 841.89;

            if (remainingHeight > 0) {
                pdf.addPage();
            }
        }

        const pdfBlob = pdf.output('blob');

        if (!this.appointmentId) {
            this.errorMessage = 'Appointment ID is required.';
            this.isLoading = false;
            // this.toastr.error(this.errorMessage); // Show error toast
            return;
        }

        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'prescription.pdf');
        formData.append('appointmentId', this.appointmentId);
        formData.append('notes', 'Take medication after meals');

        this.api.sendPrescriptionEmailWithPdf(formData).subscribe({
            next: () => {
                this.successMessage = 'Prescription sent to patient successfully!';
                this.isLoading = false;
                alert(this.successMessage); // Show success toast
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error.message || 'Failed to send prescription email';
                this.isLoading = false;
                // this.toastr.error(this.errorMessage); // Show error toast
            },
        });
    }).catch(error => {
        console.error('Error generating PDF:', error);
        this.errorMessage = 'Failed to generate the prescription PDF.';
        this.isLoading = false;
        // this.toastr.error(this.errorMessage); // Show error toast
    });
}
  
    async dd() {
      if (this.prescriptionForm.valid) {
    const content = document.getElementById('dd') as HTMLElement;

    html2canvas(content, {
        scale: 3, // Increase scale for higher resolution
        useCORS: true, // Enable cross-origin resource sharing if needed
      }).then(canvas => {
        // A4 dimensions in points (595.28 x 841.89)
        const a4Width = 595.28; // A4 width in points
      const a4Height = 841.89; // A4 height in points
      
      // Generate high-quality PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
  
      // Calculate the scaling factor to fit the canvas content into the PDF page width
      const imgWidth = a4Width; // Full width of the A4 page
      const imgHeight = (canvas.height * a4Width) / canvas.width; // Maintain aspect ratio
  
      const imgData = canvas.toDataURL("image/jpeg", 1.0); // Maximum quality
  
      // Check if the content height exceeds a single page
      let position = 0;
      let remainingHeight = imgHeight;
  
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        remainingHeight -= a4Height;
        position -= a4Height;
  
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
              pdf.save('prescription.pdf');
          })

      }
    }
  }