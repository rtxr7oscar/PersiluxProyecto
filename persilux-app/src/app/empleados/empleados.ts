import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.scss'
})
export class EmpleadosComponent implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);
  
  mostrarFormulario = false;
  modoEdicion = false;
  empleadoIdEdicion: any = null;
  rolActual = '';
  empleados: any[] = [];
  nuevoEmpleado = { id: '', nombre: '', rol: '', telefono: '' }; // Agregamos el campo ID

  ngOnInit() {
    this.rolActual = localStorage.getItem('rolUsuario') || 'Empleado'; 
    this.cargarEmpleados();
  }
  
  cargarEmpleados() {
    this.http.get('http://localhost:3000/api/empleados').subscribe((data: any) => {
      this.empleados = data;
      this.cdr.detectChanges();
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario();
  }

  editarEmpleado(empleado: any) {
    this.modoEdicion = true;
    this.empleadoIdEdicion = empleado.id;
    this.nuevoEmpleado = { ...empleado };
    this.mostrarFormulario = true;
  }

  eliminarEmpleado(id: string) {
    if(confirm('¿Dar de baja a este empleado?')) {
      this.http.delete('http://localhost:3000/api/empleados/' + id).subscribe(() => {
        this.cargarEmpleados();
      });
    }
  }

guardarEmpleado() {
    // 1. Buscamos si ya existe alguien con el mismo ID (Matrícula)
    const idDuplicado = this.empleados.find(
      e => String(e.id).toLowerCase().trim() === String(this.nuevoEmpleado.id).toLowerCase().trim()
    );

    // 2. Buscamos si ya existe alguien con el mismo Nombre exacto
    const nombreDuplicado = this.empleados.find(
      e => e.nombre.toLowerCase().trim() === this.nuevoEmpleado.nombre.toLowerCase().trim()
    );

    // Si es un empleado nuevo, verificamos que no se repita nada
    if (!this.modoEdicion) {
      if (idDuplicado) {
        alert('Error: Ya existe un empleado registrado con esa Matrícula (ID).');
        return; 
      }
      if (nombreDuplicado) {
        alert('Error: Ya existe un empleado registrado con ese Nombre exacto.');
        return; 
      }
    }

    // 3. Si pasa las dos validaciones, guardamos normal
    if (this.modoEdicion) {
      this.http.put('http://localhost:3000/api/empleados/' + this.empleadoIdEdicion, this.nuevoEmpleado).subscribe(() => {
        alert('Empleado actualizado');
        this.resetearFormulario();
        this.cargarEmpleados();
      });
    } else {
      this.http.post('http://localhost:3000/api/empleados', this.nuevoEmpleado).subscribe(() => {
        alert('Empleado guardado');
        this.resetearFormulario();
        this.cargarEmpleados();
      });
    }
  }

  resetearFormulario() {
    this.nuevoEmpleado = { id: '', nombre: '', rol: '', telefono: '' };
    this.modoEdicion = false;
    this.empleadoIdEdicion = null;
    this.mostrarFormulario = false;
  }
}