import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- Necesario para el *ngIf del HTML

import { 
  IonContent, 
  IonCard, 
  IonCardContent, 
  IonItem, 
  IonIcon, 
  IonInput, 
  IonButton,
  NavController,
  ToastController 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { scanCircleOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

// Importamos el plugin que descargamos
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, // <-- Agregado
    ReactiveFormsModule,
    IonContent, 
    IonCard, 
    IonCardContent, 
    IonItem, 
    IonIcon, 
    IonInput, 
    IonButton
  ] 
})
export class LoginPage implements OnInit {
  private router = inject(Router);
  private navCtrl = inject(NavController); 
  private http = inject(HttpClient); 
  private toastController = inject(ToastController); 

  private API_URL = 'https://app-facial.vercel.app/login';
  
  // Variable que controla si mostramos el formulario o el botón gigante del rostro
  biometriaActiva = false; 

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  constructor() {
    addIcons({ scanCircleOutline, mailOutline, lockClosedOutline });
  }

  // Se ejecuta al cargar la página. Revisa si ya hay un rostro guardado.
  async ngOnInit() {
    try {
      const biometriaDisponible = await NativeBiometric.isAvailable();
      if (biometriaDisponible.isAvailable) {
        const credenciales = await NativeBiometric.getCredentials({ server: 'AppFacialSecure' });
        // Si hay credenciales guardadas de sesiones anteriores, bloqueamos el formulario normal
        if (credenciales && credenciales.username) {
          this.biometriaActiva = true;
        }
      }
    } catch (error) {
      // Si falla, significa que es la primera vez o no hay rostro, se queda biometriaActiva en false
      console.log('No hay credenciales biométricas guardadas aún.');
    }
  }

  // LOGIN 1: El inicio de sesión normal por primera vez
  iniciarSesion() {
    const correoIngresado = this.loginForm.value.email!;
    const passwordIngresado = this.loginForm.value.password!;
    
    // Tu puerta trasera para admins
    if (!correoIngresado) {
      this.router.navigate(['/inicio'], { queryParams: { usuario: 'Administrador' } });
      return;
    }

    const credenciales = {
      email: correoIngresado,
      password: passwordIngresado
    };

    this.http.post(this.API_URL, credenciales).subscribe({
      next: async (respuesta: any) => {
        // GUARDA LAS CREDENCIALES EN EL ROSTRO DEL USUARIO PARA FUTUROS LOGINS
        try {
          const available = await NativeBiometric.isAvailable();
          if (available.isAvailable) {
            await NativeBiometric.setCredentials({
              username: correoIngresado,
              password: passwordIngresado,
              server: 'AppFacialSecure' // Identificador de tu app
            });
          }
        } catch (e) {
          console.error("Error guardando biometría", e);
        }

        await this.mostrarMensaje(respuesta.mensaje, 'success');
        this.router.navigate(['/inicio'], { queryParams: { usuario: respuesta.usuario } });
      },
      error: async (err) => {
        const mensajeError = err.error?.error || 'Error al conectar con el servidor';
        await this.mostrarMensaje(mensajeError, 'danger');
      }
    });
  }

  // LOGIN 2: El botón que solo exige el rostro a partir del segundo ingreso
  async loginBiometrico() {
    try {
      // Pedimos el rostro. useFallback: false prohíbe usar PIN o Patrón numérico.
      await NativeBiometric.verifyIdentity({
        title: 'Acceso Biométrico',
        reason: 'Usa tu rostro para entrar a AppFacial',
        useFallback: false 
      });

      // Si el rostro es exitoso, sacamos las credenciales seguras que ocultamos la primera vez
      const creds = await NativeBiometric.getCredentials({ server: 'AppFacialSecure' });

      // Hacemos el login transparente al backend usando esos datos ocultos
      this.http.post(this.API_URL, { email: creds.username, password: creds.password }).subscribe({
        next: async (respuesta: any) => {
          await this.mostrarMensaje('¡Rostro reconocido!', 'success');
          this.router.navigate(['/inicio'], { queryParams: { usuario: respuesta.usuario } });
        },
        error: async () => {
          await this.mostrarMensaje('La contraseña guardada ya no es válida', 'danger');
        }
      });

    } catch (error) {
      // El rostro no coincidió o el usuario canceló
      this.mostrarMensaje('No se reconoció el rostro', 'warning');
    }
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}