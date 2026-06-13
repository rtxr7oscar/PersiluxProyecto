import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss' // O el nombre de tus estilos
})
export class ReportesComponent implements OnInit {
  http = inject(HttpClient);

  // Variables para los filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  vendedor_id: string = 'todos';
  
  vendedores: any[] = [];
  
  // Variables para recibir los resultados
  detalleVentas: any[] = [];
  resumen = {
    ingresosVendidos: 0,
    ingresosRecaudados: 0,
    cantidadVentas: 0
  };

  ngOnInit() {
    this.cargarVendedores();
  }

  // Traemos a los empleados para llenar el selector
  cargarVendedores() {
    this.http.get('http://localhost:3000/api/empleados').subscribe((data: any) => {
      this.vendedores = data;
    });
  }
  

  // La función maestra que llama al backend con los filtros
  generarReporte() {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('¡Ojo! Necesitas seleccionar tanto la fecha de inicio como la de fin.');
      return;
    }

    // Armamos la ruta mandándole las fechas y el vendedor seleccionado
    const url = `http://localhost:3000/api/reportes/ventas?fechaInicio=${this.fechaInicio}&fechaFin=${this.fechaFin}&vendedor_id=${this.vendedor_id}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.resumen = data.resumen;
        this.detalleVentas = data.detalle;
      },
      error: (err) => {
        alert('Error al generar el reporte. Revisa la consola.');
        console.error(err);
      }
    });
  }
  exportarExcel() {
    if (this.detalleVentas.length === 0) {
      alert('No hay datos en la tabla para exportar.');
      return;
    }

    // Definimos los encabezados del archivo Excel
    let csv = 'Folio,Fecha,Cliente,Producto,Total,Estatus\n';

    // Recorremos los datos de tu tabla y los limpiamos para el archivo
    this.detalleVentas.forEach(v => {
      const fechaFormateada = new Date(v.fecha_registro).toLocaleDateString('es-MX');
      // Usamos comillas dobles en los textos por si el cliente tiene espacios o comas en su nombre
      csv += `${v.folio},${fechaFormateada},"${v.cliente_nombre}","${v.producto_nombre}",${v.total},"${v.estatus}"\n`;
    });

    // Creamos el archivo agregando la firma BOM (UTF-8) para que Excel reconozca los acentos perfectamente
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Reporte_Ventas_Persilux.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}