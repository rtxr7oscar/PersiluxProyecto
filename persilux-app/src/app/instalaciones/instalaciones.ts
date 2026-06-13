import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instalaciones.html',
  styleUrl: './instalaciones.scss' // Nota: Puedes copiar el CSS de pedidos aquí
})
export class InstalacionesComponent implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  mostrarFormulario = false;
  instalaciones: any[] = [];
  pedidos: any[] = [];
  empleados: any[] = [];

  nuevaInstalacion = {
    pedido_id: '',
    empleado_id: '',
    fecha_programada: '',
    direccion_instalacion: '',
    estatus: 'Pendiente'
  };

  ngOnInit() {
    this.cargarInstalaciones();
    this.cargarPedidos();
    this.cargarEmpleados();
  }

  cargarInstalaciones() {
    this.http.get('http://localhost:3000/api/instalaciones').subscribe((data: any) => {
      this.instalaciones = data;
      this.cdr.detectChanges();
    });
  }

  cargarPedidos() {
    // Solo traemos pedidos para mostrarlos en el select
    this.http.get('http://localhost:3000/api/pedidos').subscribe((data: any) => this.pedidos = data);
  }

  cargarEmpleados() {
    this.http.get('http://localhost:3000/api/empleados').subscribe((data: any) => {
      // Filtramos para que en la lista solo salgan los Instaladores
      this.empleados = data.filter((e: any) => e.rol === 'Instalador' || e.rol === 'Administrador');
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario();
  }

  guardarInstalacion() {
    this.http.post('http://localhost:3000/api/instalaciones', this.nuevaInstalacion).subscribe(() => {
      alert('Instalación agendada con éxito');
      this.resetearFormulario();
      this.cargarInstalaciones();
    });
  }

  cambiarEstatus(id: number, nuevoEstatus: string) {
    this.http.put(`http://localhost:3000/api/instalaciones/${id}/estatus`, { estatus: nuevoEstatus }).subscribe(() => {
      this.cargarInstalaciones();
    });
  }

  eliminarInstalacion(id: number) {
    if (confirm('¿Cancelar y borrar esta instalación de la agenda?')) {
      this.http.delete('http://localhost:3000/api/instalaciones/' + id).subscribe(() => {
        this.cargarInstalaciones();
      });
    }
  }

  resetearFormulario() {
    this.nuevaInstalacion = { pedido_id: '', empleado_id: '', fecha_programada: '', direccion_instalacion: '', estatus: 'Pendiente' };
    this.mostrarFormulario = false;
  }

  autocompletarDireccion() {
    const pedidoSeleccionado = this.pedidos.find(p => p.id == this.nuevaInstalacion.pedido_id);
    
    if (pedidoSeleccionado) {
      this.nuevaInstalacion.direccion_instalacion = pedidoSeleccionado.cliente_direccion;
    }
  }
}