import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ReactiveFormsModule,FormsModule,CommonModule,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiService]
})
export class AppComponent {
  title = 'express-angular';
  userForm: FormGroup;
  data: any=[];

  constructor(private fb: FormBuilder,public api:ApiService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
ngOnInit(): void {
  this.api.getDataExp()
  .subscribe((data) => {
    console.log('Data from Express API:', data);
    this.data=data;
  })
}
  onSubmit() {
    console.log('Form Submitted!', this.userForm.value);
    if (this.userForm.valid) {
      this.api.post("/api/create", this.userForm.value).subscribe((res:any) => {
        console.log('Data sent to Express API:', res);
      });

    }
  }
}
