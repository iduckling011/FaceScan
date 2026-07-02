import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UsuarioSesion {
  nombre?: string;
  email?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Asegúrate de poner tu URL real de Vercel aquí. 
  // OJO: Tu Flask no tiene prefijo '/api', así que quité el '/api' del final para que coincida con tus rutas de Python
  private apiUrl = 'https://app-facial.vercel.app'; 
  
  private http = inject(HttpClient);
  private usuarioActual: UsuarioSesion | null = null;

  constructor() {
    this.cargarSesion();
  }

  // ==========================================
  //  PETICIONES HTTP (CONEXIÓN CON FLASK)
  // ==========================================

  registrar(datos: { nombre: string; email: string; password: string }): Observable<any> {
    // Flask espera 'nombre', 'email' y 'password'
    return this.http.post(`${this.apiUrl}/register`, datos); // Cambié a /register según tu Flask
  }

  loginTradicional(email: string, password: string): Observable<any> {
    // CORRECCIÓN: Flask espera 'email' y 'password', no 'correo' y 'contrasena'
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        // Tu Flask retorna { mensaje, usuario } (donde usuario es el email)
        if (res && res.usuario) {
          this.setUsuario({
            email: res.usuario
          });
        }
      })
    );
  }

  // ... (El resto de tus métodos de sesión y biometría se quedan EXACTAMENTE igual) ...
  
  setUsuario(usuario: UsuarioSesion): void {
    this.usuarioActual = usuario;
    localStorage.setItem('usuarioSesion', JSON.stringify(usuario));
  }

  getUsuario(): UsuarioSesion | null {
    if (!this.usuarioActual) {
      this.cargarSesion();
    }
    return this.usuarioActual;
  }

  getEmail(): string {
    return this.usuarioActual?.email || '';
  }

  getNombre(): string {
    return this.usuarioActual?.nombre || '';
  }

  estaAutenticado(): boolean {
    if (!this.usuarioActual) {
      this.cargarSesion();
    }
    return this.usuarioActual !== null;
  }

  cerrarSesion(): void {
    this.usuarioActual = null;
    localStorage.removeItem('usuarioSesion');
  }

  private cargarSesion(): void {
    const sesion = localStorage.getItem('usuarioSesion');
    if (sesion) {
      try {
        this.usuarioActual = JSON.parse(sesion);
      } catch (e) {
        this.usuarioActual = null;
      }
    }
  }

  vincularRostro(email: string, activado: boolean): void {
    localStorage.setItem(`face_auth_enabled_${email}`, activado ? 'true' : 'false');
  }

  tieneRostroVinculado(email: string): boolean {
    return localStorage.getItem(`face_auth_enabled_${email}`) === 'true';
  }
}