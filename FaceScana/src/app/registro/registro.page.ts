import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  IonContent, IonCard, IonCardContent, IonItem, IonInput, 
  IonButton, IonIcon, IonNote, IonList, IonText 
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    IonContent, IonCard, IonCardContent, IonItem, IonInput, 
    IonButton, IonIcon, IonNote, IonList, IonText
  ]
})
export class RegistroPage implements OnInit {
  registroForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister() {
    if (this.registroForm.valid) {
      console.log('Formulario enviado:', this.registroForm.value);
      // Aquí iría tu lógica de registro
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}