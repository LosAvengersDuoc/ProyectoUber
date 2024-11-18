import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import * as L from 'leaflet';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @ViewChild('logoutLoading', { static: false }) logoutLoading!: HTMLIonLoadingElement;
  
  map!: L.Map;
  markerLayer!: L.LayerGroup;
  routeLayer!: L.LayerGroup;
  originMarker: any;
  destinationMarker: any;
  displayName: string = localStorage.getItem('displayName') || '';  // Aquí se almacenará el nombre del usuario
  originQuery: string = '';
  distanceInfo: string = '';
  showCreateTrip: boolean = true;
  suggestedDestinations: any[] = [];
  filteredSuggestions: any[] = [];

  // Coordenadas del Duoc UC San Joaquín como destino fijo
  private readonly duocUcSanJoaquin = { lat: -33.502916, lon: -70.613207 };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.loadUserName();
    this.loadSuggestedDestinations();
  }

  private async loadUserName() {
    const username = localStorage.getItem('username'); // Obtener el username del localStorage
    if (username) {
      const profile = await this.storage.get(`profile_${username}`);  // Obtener el perfil del Storage
      if (profile) {
        this.displayName = `${profile.firstName} ${profile.lastName}`;  // Asignar el nombre completo
      }
    }
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

    // Agregar el marcador de destino fijo al inicializar el mapa
    const destinationIcon = L.icon({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    this.destinationMarker = L.marker([this.duocUcSanJoaquin.lat, this.duocUcSanJoaquin.lon], {
      icon: destinationIcon
    })
      .bindPopup('Destino: Duoc UC San Joaquín')
      .openPopup();
    this.markerLayer.addLayer(this.destinationMarker);
  }

  async traceRoute() {
    const origin = await this.searchLocation(this.originQuery, false);
    const destination = this.duocUcSanJoaquin;

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

  // Función para cargar sugerencias de destinos
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

  // Función para compartir la ubicación
  async shareLocation() {
    const alert = await this.alertController.create({
      header: 'Ubicación Compartida',
      message: `
        <div style="text-align: left;">
          <p><strong>Origen:</strong> ${this.originQuery || 'No especificado'}</p>
          <p><strong>Destino:</strong> Duoc UC San Joaquín</p>
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

  // Mostrar formulario para añadir destino
  goToAddDestination() {
    this.showCreateTrip = true;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar cierre de sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            // Muestra el ion-loading
            await this.logoutLoading.present();

            // Simula el cierre de sesión (puedes reemplazarlo con la lógica real)
            setTimeout(() => {
              this.displayName = '';
              localStorage.removeItem('username');
              this.router.navigate(['/login']);
              this.logoutLoading.dismiss(); // Cierra el ion-loading después de completar la lógica
            }, 2000);
          },
        },
      ],
    });

    await alert.present();
  }
  // Función para buscar ubicación
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
          .bindPopup(`Destino: Duoc UC San Joaquín`)
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
}
