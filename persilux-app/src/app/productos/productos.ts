import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class ProductosComponent implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);
  
  mostrarFormulario = false;
  modoEdicion = false;
  productoIdEdicion: any = null;
  
  productos: any[] = [];
  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: 0
  };
  rolActual = '';
  ngOnInit() {
    this.rolActual = localStorage.getItem('rolUsuario') || 'Empleado'; 
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get('http://localhost:3000/api/productos').subscribe((data: any) => {
      this.productos = data;
      this.cdr.detectChanges();
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario();
  }

  editarProducto(producto: any) {
    this.modoEdicion = true;
    this.productoIdEdicion = producto.id;
    this.nuevoProducto = { ...producto };
    this.mostrarFormulario = true;
  }

  eliminarProducto(id: number) {
    if(confirm('¿Seguro que deseas eliminar este producto?')) {
      this.http.delete('http://localhost:3000/api/productos/' + id).subscribe(() => {
        this.cargarProductos();
      });
    }
  }

  guardarProducto() {
    // 1. Buscamos si ya existe un producto con el mismo nombre (ignorando mayúsculas y espacios)
    const productoDuplicado = this.productos.find(
      p => p.nombre.toLowerCase().trim() === this.nuevoProducto.nombre.toLowerCase().trim()
    );

    // 2. Si existe y estamos creando uno nuevo, lanzamos error y detenemos el proceso
    if (productoDuplicado && !this.modoEdicion) {
      alert('Error: Ya existe un producto registrado con ese nombre exacto.');
      return; 
    }

    // 3. Si pasa la validación, guardamos o actualizamos normal
    if (this.modoEdicion) {
      this.http.put('http://localhost:3000/api/productos/' + this.productoIdEdicion, this.nuevoProducto).subscribe(() => {
        alert('Producto actualizado');
        this.resetearFormulario();
        this.cargarProductos();
      });
    } else {
      this.http.post('http://localhost:3000/api/productos', this.nuevoProducto).subscribe(() => {
        alert('Producto guardado');
        this.resetearFormulario();
        this.cargarProductos();
      });
    }
  }

  resetearFormulario() {
    this.nuevoProducto = { nombre: '', descripcion: '', precio:0 };
    this.modoEdicion = false;
    this.productoIdEdicion = null;
    this.mostrarFormulario = false;
  }
}