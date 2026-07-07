import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { 
  IonContent, IonCard, IonCardContent, IonButton, IonIcon, 
  IonAvatar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, shieldCheckmarkOutline, cameraOutline, 
  fingerPrintOutline, timeOutline, logOutOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonCard, IonCardContent, IonButton, 
    IonIcon, IonAvatar
  ]
})
export class InicioPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = 'Usuario';
  fecha = new Date().toLocaleDateString();

  accesos = [
    { icono: 'camera-outline', titulo: 'Face ID', descripcion: 'Reconocimiento facial activo' },
    { icono: 'fingerprint-outline', titulo: 'Seguridad', descripcion: 'Acceso biométrico habilitado' },
    { icono: 'shield-checkmark-outline', titulo: 'Sistema', descripcion: 'Protección en tiempo real' }
  ];

  constructor() {
    addIcons({ personCircleOutline, shieldCheckmarkOutline, cameraOutline, fingerPrintOutline, timeOutline, logOutOutline });
  }

  ngOnInit() {
    // Ajusta esto según cómo guardes el nombre en tu AuthService
    this.usuario = this.authService.getNombre() || 'Invitado';
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}