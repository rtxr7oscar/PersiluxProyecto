import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // <-- IMPORTANTE: Agregamos HttpClient

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  http = inject(HttpClient); // <-- Lo inyectamos para poder hacer la petición
  
  @Output() loginExitoso = new EventEmitter<void>();
  
  usuario = { username: '', password: '' };
  error = false;

  entrar() {
    this.error = false; // Reiniciamos el error cada vez que da clic

    // Mandamos los datos al backend
    this.http.post('http://localhost:3000/api/login', this.usuario).subscribe({
      next: (respuesta: any) => {
        if (respuesta.exito) {
          // ¡MAGIA! Guardamos el rol en la memoria del navegador
          localStorage.setItem('rolUsuario', respuesta.rol);
          localStorage.setItem('nombreUsuario', respuesta.nombre); // Opcional, por si quieres mostrar su nombre luego
          
          // Le avisamos a app.ts que ya puede quitar la pantalla de login
          this.loginExitoso.emit();
        }
      },
      error: (err) => {
        console.error('Fallo el login:', err);
        this.error = true; // Mostramos el mensaje rojo de "Credenciales incorrectas"
      }
    });
  }
}