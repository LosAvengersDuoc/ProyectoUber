import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage {
  // Variables para el destino y los filtros
  destination: string = '';
  filterProximity: boolean = false;
  filterVehicleAvailability: boolean = false;

  // Lista de coincidencias (sería poblada dinámicamente más adelante)
  matches: any[] = [];

  constructor() {}

  // Función para aplicar los filtros
  applyFilter() {
    console.log('Aplicando filtros...');
    console.log('Filtro por cercanía:', this.filterProximity);
    console.log('Filtro por disponibilidad de vehículo:', this.filterVehicleAvailability);
    // Aquí es donde implementarías la lógica para aplicar los filtros
  }

  // Función para buscar coincidencias
  findMatch() {
    console.log('Buscando coincidencias para el destino:', this.destination);
    // Aquí es donde implementarías la lógica para buscar las coincidencias
    // Puedes simular resultados con un array de ejemplo
    this.matches = [
      { name: 'Juan Pérez', destination: this.destination, proximity: 2 },
      { name: 'María González', destination: this.destination, proximity: 5 },
      { name: 'Carlos López', destination: this.destination, proximity: 1 },
    ];
    console.log('Coincidencias encontradas:', this.matches);
  }

  // Función para solicitar un viaje
  requestRide(match: any) {
    console.log('Solicitando viaje con:', match.name);
    // Aquí es donde podrías implementar la lógica para solicitar el viaje
    // Podrías abrir una pantalla de confirmación o iniciar un proceso de solicitud
  }
}
