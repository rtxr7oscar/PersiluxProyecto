import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.scss'
})
export class CotizacionesComponent implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  mostrarFormulario = false;
  cotizaciones: any[] = [];
  clientes: any[] = [];
  productos: any[] = [];

  nuevaCotizacion = {
    cliente_id: '',
    producto_id: '',
    medidas: '',
    cantidad: 1,
    total: 0
  };
  modoEdicion = false;
  cotizacionIdEdicion: any = null;
  

  ngOnInit() {
    this.cargarCotizaciones();
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarCotizaciones() {
    this.http.get('http://localhost:3000/api/cotizaciones').subscribe((data: any) => {
      this.cotizaciones = data;
      this.cdr.detectChanges();
    });
  }

  cargarClientes() {
    this.http.get('http://localhost:3000/api/clientes').subscribe((data: any) => this.clientes = data);
  }

  cargarProductos() {
    this.http.get('http://localhost:3000/api/productos').subscribe((data: any) => this.productos = data);
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario();
  }
  editarCotizacion(cot: any) {
    this.modoEdicion = true;
    this.cotizacionIdEdicion = cot.id;
    // Copiamos los datos de la fila al formulario
    this.nuevaCotizacion = { 
      cliente_id: cot.cliente_id, 
      producto_id: cot.producto_id, 
      medidas: cot.medidas, 
      cantidad: cot.cantidad, 
      total: cot.total 
    };
    this.mostrarFormulario = true;
  }
  calcularTotal() {
    const productoSeleccionado = this.productos.find(p => p.id == this.nuevaCotizacion.producto_id);
    if (productoSeleccionado && this.nuevaCotizacion.cantidad) {
      this.nuevaCotizacion.total = productoSeleccionado.precio * this.nuevaCotizacion.cantidad;
    } else {
      this.nuevaCotizacion.total = 0;
    }
  }

  guardarCotizacion() {
    if (this.modoEdicion) {
      this.http.put('http://localhost:3000/api/cotizaciones/' + this.cotizacionIdEdicion, this.nuevaCotizacion).subscribe(() => {
        alert('Cotización actualizada');
        this.resetearFormulario();
        this.cargarCotizaciones();
      });
    } else {
      this.http.post('http://localhost:3000/api/cotizaciones', this.nuevaCotizacion).subscribe(() => {
        alert('Cotización guardada exitosamente');
        this.resetearFormulario();
        this.cargarCotizaciones();
      });
    }
  }

  eliminarCotizacion(id: number) {
    if (confirm('¿Borrar esta cotización?')) {
      this.http.delete('http://localhost:3000/api/cotizaciones/' + id).subscribe(() => {
        this.cargarCotizaciones();
      });
    }
  }

  // --- LA MAGIA: PASAR DE COTIZACIÓN A VENTA ---
  convertirAVenta(cot: any) {
    if (confirm('¿El cliente aceptó? Esto pasará la cotización a la tabla de Pedidos (Ventas).')) {
      
      const nuevaVenta = {
        cliente_id: cot.cliente_id,
        producto_id: cot.producto_id,
        medidas: cot.medidas,
        cantidad: cot.cantidad,
        total: cot.total,
        estatus: 'Anticipo Pendiente' // Inicia pidiendo el 50%
      };

      // 1. Guardar en Pedidos
      this.http.post('http://localhost:3000/api/pedidos', nuevaVenta).subscribe(() => {
        // 2. Borrar de Cotizaciones porque ya es una venta real
        this.http.delete('http://localhost:3000/api/cotizaciones/' + cot.id).subscribe(() => {
          alert('¡Cotización convertida en Venta!');
          this.cargarCotizaciones();
        });
      });
    }
  }

  resetearFormulario() {
    this.nuevaCotizacion = { cliente_id: '', producto_id: '', medidas: '', cantidad: 1, total: 0 };
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.cotizacionIdEdicion = null;
  }
}