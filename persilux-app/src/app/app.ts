import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesComponent } from './clientes/clientes';
import { PedidosComponent } from './pedidos/pedidos';
import { ProductosComponent } from './productos/productos';
import { EmpleadosComponent } from './empleados/empleados';
import { InstalacionesComponent } from './instalaciones/instalaciones';
import { LoginComponent } from './login/login';
import { CotizacionesComponent } from './cotizaciones/cotizaciones'; 
import { ReportesComponent } from './reportes/reportes';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ClientesComponent, PedidosComponent, ProductosComponent, EmpleadosComponent, InstalacionesComponent, LoginComponent, CotizacionesComponent,ReportesComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  estaAutenticado = false; 
  vistaActual = 'clientes';
  rolActual: string = 'Administrador';
  alEntrar() {
    this.estaAutenticado = true;
  }
}