import { Component, ElementRef, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

import { 
  IonContent, IonCard, IonCardContent, IonItem, IonIcon, IonInput, 
  IonButton, ToastController, IonText, IonSpinner 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, scanOutline } from 'ionicons/icons';
import { FaceRecognitionService } from '../services/face-recognition.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonText, CommonModule, ReactiveFormsModule, IonContent, IonCard, 
    IonCardContent, IonItem, IonIcon, IonInput, IonButton, IonSpinner
  ] 
})
export class LoginPage implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private toastController = inject(ToastController); 
  private faceService = inject(FaceRecognitionService); 
  
  // SOLUCIÓN AL WARNING DE ANGULAR: Deshabilitamos los campos desde la definición del Control
  loginForm = new FormGroup({
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
    password: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(4)])
  });

  cargandoModelos = true;
  mostrandoCamara = false;
  streamReconocimiento: MediaStream | null = null;
  intervaloDeteccion: any;
  private faceapi: any;

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, scanOutline });
  }

  async ngOnInit() {
    try {
      await this.faceService.cargarModelos();
      this.faceapi = await this.faceService.obtenerFaceApi();
      await this.cargarImagenReferencia();
      this.cargandoModelos = false;
    } catch (error) {
      console.error('Error inicializando FaceAPI:', error);
      alert('Error crítico al cargar modelos de IA. Revisa la consola.');
      this.cargandoModelos = false;
    }
  }

  ngOnDestroy() {
    this.detenerCamara();
  }

  async cargarImagenReferencia() {
    try {
      // Intenta cargar la imagen. Asegúrate de que esté en src/assets/images/cr7.jpg
      const img = await this.faceapi.fetchImage('assets/images/cr7.jpg'); 
      const deteccion = await this.faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      
      if (deteccion) {
        const rostroReferencia = new this.faceapi.LabeledFaceDescriptors('Usuario Autorizado', [deteccion.descriptor]);
        const matcher = new this.faceapi.FaceMatcher(rostroReferencia, 0.6);
        this.faceService.guardarFaceMatcher(matcher);
        console.log('Rostro de referencia cargado correctamente.');
      } else {
        alert('ADVERTENCIA: Se cargó la foto "cr7.jpg", pero la IA no detectó ningún rostro en ella.');
      }
    } catch (error) {
      console.error('Error al procesar la imagen de referencia:', error);
      // ALERTA VISIBLE: Para que sepas inmediatamente si la ruta está mal
      alert('ERROR: No se encontró la imagen "assets/images/cr7.jpg". Asegúrate de haber copiado tu foto en la carpeta assets.');
    }
  }

  async iniciarReconocimiento() {
    const faceMatcher = this.faceService.obtenerFaceMatcher();
    
    if (!faceMatcher) {
      // Si llega aquí, te avisará en pantalla el porqué no hace nada
      alert('No se puede iniciar la cámara porque no hay un rostro de referencia cargado (Error con cr7.jpg).');
      return;
    }

    this.mostrandoCamara = true;

    try {
      this.streamReconocimiento = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      const video = this.videoElement.nativeElement;
      video.srcObject = this.streamReconocimiento;
      video.onplay = () => this.detectarRostroEnTiempoReal(faceMatcher);
    } catch (error) {
      alert('Error: No se pudo acceder a la cámara. ¿Diste los permisos en el navegador?');
      this.mostrandoCamara = false;
    }
  }

  detectarRostroEnTiempoReal(faceMatcher: any) {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    this.faceapi.matchDimensions(canvas, { width: video.videoWidth, height: video.videoHeight });

    this.intervaloDeteccion = setInterval(async () => {
      if (video.paused || video.ended) return;

      const detecciones = await this.faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const deteccionesRedimensionadas = this.faceapi.resizeResults(detecciones, { width: video.videoWidth, height: video.videoHeight });
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      
      const resultados = deteccionesRedimensionadas.map((d: any) => faceMatcher.findBestMatch(d.descriptor));

      resultados.forEach((resultado: any, i: number) => {
        const box = deteccionesRedimensionadas[i].detection.box;
        const texto = resultado.label; 
        const color = texto === 'unknown' ? 'red' : 'green';

        const drawBox = new this.faceapi.draw.DrawBox(box, { label: texto, boxColor: color });
        drawBox.draw(canvas);

        if (texto === 'Usuario Autorizado') {
          this.loginExitoso();
        }
      });
    }, 500); 
  }

  loginExitoso() {
    this.detenerCamara();
    this.faceService.registrarDiagnostico('Login Exitoso');
    this.mostrarMensaje('¡Rostro reconocido! Iniciando sesión...', 'success');
    this.router.navigate(['/inicio']);
  }

  detenerCamara() {
    if (this.intervaloDeteccion) clearInterval(this.intervaloDeteccion);
    if (this.streamReconocimiento) {
      this.streamReconocimiento.getTracks().forEach((track: any) => track.stop());
    }
    this.mostrandoCamara = false;
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