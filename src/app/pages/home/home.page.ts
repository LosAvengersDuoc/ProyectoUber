import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: L.Map;
  markerLayer!: L.LayerGroup;
  routeLayer!: L.LayerGroup;
  originMarker: any;
  destinationMarker: any;
  displayName: string = '';
  originQuery: string = '';
  destinationQuery: string = '';
  distanceInfo: string = '';
  showCreateTrip: boolean = true;
  suggestedDestinations: any[] = [];
  filteredSuggestions: any[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.loadSuggestedDestinations();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapElement.nativeElement).setView([-33.4372, -70.6506], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);
  }

  private async searchLocation(query: string, isDestination: boolean) {
    if (!query) return null;
    const geocodeService = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=CL&q=${encodeURIComponent(query)}`;
    const response = await fetch(geocodeService);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const location = data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);
      const markerIcon = L.icon({
        iconUrl: isDestination
          ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
      
      if (isDestination) {
        if (this.destinationMarker) this.markerLayer.removeLayer(this.destinationMarker);
        this.destinationMarker = L.marker([lat, lon], { icon: markerIcon })
          .bindPopup(`Destino: ${query}`)
          .openPopup();
        this.markerLayer.addLayer(this.destinationMarker);
      } else {
        if (this.originMarker) this.markerLayer.removeLayer(this.originMarker);
        this.originMarker = L.marker([lat, lon], { icon: markerIcon })
          .bindPopup(`Origen: ${query}`)
          .openPopup();
        this.markerLayer.addLayer(this.originMarker);
      }
      this.map.setView([lat, lon], 14);

      return { lat, lon };
    } else {
      alert('No se encontró la ubicación.');
      return null;
    }
  }

  async traceRoute() {
    const origin = await this.searchLocation(this.originQuery, false);
    const destination = await this.searchLocation(this.destinationQuery, true);

    if (origin && destination) {
      const routeService = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
      fetch(routeService)
        .then(response => response.json())
        .then(data => {
          if (data && data.routes && data.routes.length > 0) {
            const routeCoordinates = data.routes[0].geometry.coordinates;
            const latLngs = routeCoordinates.map((coord: any) => [coord[1], coord[0]]);
            const routeLine = L.polyline(latLngs, { color: 'blue', weight: 4 });
            this.routeLayer.clearLayers();
            this.routeLayer.addLayer(routeLine);
            this.map.fitBounds(routeLine.getBounds());

            const distance = data.routes[0].distance / 1000;
            const durationInSeconds = data.routes[0].duration;
            const carTime = Math.ceil(durationInSeconds / 60);
            const walkingTime = Math.ceil((durationInSeconds * 1.5) / 60);

            this.distanceInfo = `Distancia: ${distance.toFixed(2)} km. En auto: ${carTime} mins, caminando: ${walkingTime} mins`;
          }
        })
        .catch(error => {
          console.error('Error en la traza de ruta:', error);
          alert('Hubo un problema al trazar la ruta.');
        });
    }
  }

  // Función para mostrar el mensaje emergente con solo el nombre de origen y destino
  async shareLocation() {
    const alert = await this.alertController.create({
      header: 'Ubicación Compartida',
      message: `
        <div style="text-align: left;">
          <p><strong>Origen:</strong> ${this.originQuery || 'No especificado'}</p>
          <p><strong>Destino:</strong> ${this.destinationQuery || 'No especificado'}</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          cssClass: 'secondary',
        },
      ],
    });

    await alert.present();
  }

  // Cargar sugerencias de destinos
  private loadSuggestedDestinations() {
    this.suggestedDestinations = [
      { place: 'Parque Arauco', description: 'Centro comercial' },
      { place: 'Costanera Center', description: 'Centro comercial y oficinas' }
    ];
    this.filteredSuggestions = [...this.suggestedDestinations];
  }

  // Filtrar destinos según el término de búsqueda
  filterDestinations(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm) {
      this.filteredSuggestions = this.suggestedDestinations.filter(destination =>
        destination.place.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredSuggestions = [...this.suggestedDestinations];
    }
  }

  // Navegar a la sección de viajes
  goToTravels() {
    this.showCreateTrip = false;
  }

  // Mostrar formulario para añadir destino
  goToAddDestination() {
    this.showCreateTrip = true;
  }

  // Cerrar sesión
  logout() {
    this.displayName = '';
    this.router.navigate(['/login']);
  }
}
