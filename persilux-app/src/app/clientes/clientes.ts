import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss'
})
export class ClientesComponent implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);
  
  mostrarFormulario = false;
  modoEdicion = false; // <-- NUEVO: Para saber si estamos editando
  clienteIdEdicion: any = null; // <-- NUEVO: Para saber a quién editamos
  
  clientes: any[] = [];
  nuevoCliente = { nombre: '', telefono: '', direccion: '', correo: '' };
  rolActual = '';
  ngOnInit() {
    this.rolActual = localStorage.getItem('rolUsuario') || 'Empleado'; 
    this.cargarClientes();
  }

  cargarClientes() {
    this.http.get('http://localhost:3000/api/clientes').subscribe((data: any) => {
      this.clientes = data;
      this.cdr.detectChanges();
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario(); // Limpiar si cancela
  }

  // --- NUEVA FUNCIÓN: Llenar el formulario con datos existentes ---
  editarCliente(cliente: any) {
    this.modoEdicion = true;
    this.clienteIdEdicion = cliente.id;
    this.nuevoCliente = { ...cliente }; // Copiamos los datos al formulario
    this.mostrarFormulario = true;
  }

  // --- NUEVA FUNCIÓN: Eliminar ---
  eliminarCliente(id: number) {
    if(confirm('¿Estás seguro de eliminar este cliente?')) {
      this.http.delete('http://localhost:3000/api/clientes/' + id).subscribe(() => {
        this.cargarClientes();
      });
    }
  }

  // --- MODIFICADA: Guarda (POST) o Actualiza (PUT) ---
guardarCliente() {
    // 1. Buscamos si ya existe alguien con el mismo nombre exacto (ignorando mayúsculas y espacios extra)
    const clienteDuplicado = this.clientes.find(
      c => c.nombre.toLowerCase().trim() === this.nuevoCliente.nombre.toLowerCase().trim()
    );

    // 2. Si existe y estamos creando uno nuevo, lanzamos error y frenamos todo
    if (clienteDuplicado && !this.modoEdicion) {
      alert('Error: Ya existe un cliente registrado con ese nombre exacto.');
      return; 
    }

    // 3. Si pasa la validación, guardamos normal
    if (this.modoEdicion) {
      this.http.put('http://localhost:3000/api/clientes/' + this.clienteIdEdicion, this.nuevoCliente).subscribe(() => {
        alert('Cliente actualizado');
        this.resetearFormulario();
        this.cargarClientes();
      });
    } else {
      this.http.post('http://localhost:3000/api/clientes', this.nuevoCliente).subscribe(() => {
        alert('Cliente guardado');
        this.resetearFormulario();
        this.cargarClientes();
      });
    }
  }

  resetearFormulario() {
    this.nuevoCliente = { nombre: '', telefono: '', direccion: '', correo: '' };
    this.modoEdicion = false;
    this.clienteIdEdicion = null;
    this.mostrarFormulario = false;
  }
}