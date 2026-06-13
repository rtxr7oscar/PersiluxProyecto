import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class PedidosComponent implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  mostrarFormulario = false;
  pedidos: any[] = [];
  clientes: any[] = [];
  productos: any[] = [];
  empleados: any[] = [];

  rolActual = '';
  
  nuevoPedido = {
    cliente_id: '',
    producto_id: '',
    medidas: '',
    cantidad: 1,
    total: 0,
    anticipoUI: 0, // Solo para mostrar en pantalla
    saldoUI: 0,    // Solo para mostrar en pantalla
    estatus: 'Anticipo Pagado',
    vendedor_id: ''
  };

  ngOnInit() {
    this.rolActual = localStorage.getItem('rolUsuario') || 'Empleado';
    this.cargarPedidos();
    this.cargarClientes();
    this.cargarProductos();
    this.cargarEmpleados();
  }

  cargarPedidos() {
    this.http.get('http://localhost:3000/api/pedidos').subscribe((data: any) => {
      this.pedidos = data;
      this.cdr.detectChanges();
    });
  }

  cargarClientes() {
    this.http.get('http://localhost:3000/api/clientes').subscribe((data: any) => {
      this.clientes = data;
    });
  }

  cargarProductos() {
    this.http.get('http://localhost:3000/api/productos').subscribe((data: any) => {
      this.productos = data;
    });
  }
  cargarEmpleados() {
    this.http.get('http://localhost:3000/api/empleados').subscribe((data: any) => {
      this.empleados = data;
    });
  }
  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario();
  }

  // Al seleccionar producto o cambiar cantidad, sacamos el total y el 50/50
  calcularTotal() {
    const productoSeleccionado = this.productos.find(p => p.id == this.nuevoPedido.producto_id);
    if (productoSeleccionado && this.nuevoPedido.cantidad) {
      this.nuevoPedido.total = productoSeleccionado.precio * this.nuevoPedido.cantidad;
      this.nuevoPedido.anticipoUI = this.nuevoPedido.total * 0.5; // Calculamos 50%
      this.nuevoPedido.saldoUI = this.nuevoPedido.total * 0.5;    // Calculamos 50%
    } else {
      this.nuevoPedido.total = 0;
      this.nuevoPedido.anticipoUI = 0;
      this.nuevoPedido.saldoUI = 0;
    }
  }

  guardarPedido() {
    this.http.post('http://localhost:3000/api/pedidos', this.nuevoPedido).subscribe({
      next: () => {
        alert('¡Pedido registrado con su anticipo del 50%!');
        this.resetearFormulario();
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error al crear pedido:', err);
      }
    });
  }

  // Nueva función para cobrar el resto
  liquidarPedido(id: number) {
    if(confirm('¿Confirmas que el cliente ya liquidó el 50% restante?')) {
      this.http.put(`http://localhost:3000/api/pedidos/${id}/liquidar`, {}).subscribe(() => {
        alert('¡Pedido liquidado!');
        this.cargarPedidos(); // Recarga la tabla
      });
    }
  }

  eliminarPedido(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido de la base de datos?')) {
      this.http.delete('http://localhost:3000/api/pedidos/' + id).subscribe({
        next: () => {
          alert('Pedido eliminado');
          this.cargarPedidos(); // Recarga la tabla automáticamente
        },
        error: (err) => {
          console.error('Error al eliminar pedido:', err);
          alert('No se pudo eliminar el pedido.');
        }
      });
    }
  }

  resetearFormulario() {
    this.nuevoPedido = {
      cliente_id: '',
      producto_id: '',
      medidas: '',
      cantidad: 1,
      total: 0,
      anticipoUI: 0,
      saldoUI: 0,
      estatus: 'Anticipo Pagado',
      vendedor_id: ''
    };
    this.mostrarFormulario = false;
  }
}