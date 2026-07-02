import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- Importamos Router
import { AuthService } from '../services/auth.service'; // <-- Ajusta la ruta a tu servicio

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonAvatar, 
  IonHeader, 
  IonToolbar, 
  IonTitle 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  shieldCheckmarkOutline,
  cameraOutline,
  fingerPrintOutline,
  timeOutline,
  logOutOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonAvatar
  ]
})
export class InicioPage implements OnInit {
  
  // Inyectamos las dependencias
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = 'Usuario';
  fecha = new Date().toLocaleString();

  accesos = [
    {
      icono: 'camera-outline',
      titulo: 'Reconocimiento Facial',
      descripcion: 'Sistema biométrico activo'
    },
    {
      icono: 'fingerprint-outline',
      titulo: 'Autenticación',
      descripcion: 'Acceso seguro habilitado'
    },
    {
      icono: 'shield-checkmark-outline',
      titulo: 'Protección',
      descripcion: 'Sesión protegida'
    }
  ];

  constructor() {
    addIcons({
      personCircleOutline,
      shieldCheckmarkOutline,
      cameraOutline,
      fingerPrintOutline,
      timeOutline,
      logOutOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    // Usamos el servicio para obtener los datos centralizados
    const emailReal = this.authService.getEmail();
    const nombreReal = this.authService.getNombre();

    // Si hay un nombre, lo muestra. Si no, muestra el email. Si todo falla, dice 'Usuario'.
    this.usuario = nombreReal || emailReal || 'Usuario';
  }

  cerrarSesion() {
    // Usamos las funciones oficiales del servicio y del enrutador de Angular
    this.authService.cerrarSesion();
    this.router.navigate(['/login'], { replaceUrl: true }); // replaceUrl evita que puedan volver con el botón "Atrás"
  }
}