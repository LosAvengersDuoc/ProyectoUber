import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { Storage } from '@ionic/storage-angular';

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
  destinationMarker: any;
  displayName: string = localStorage.getItem('displayName') || '';
  distanceInfo: string = '';
  destinationQuery: string = '';

  // Coordenadas de Duoc UC San Joaquín como origen fijo
  private readonly duocUcSanJoaquin = { lat: -33.502916, lon: -70.613207 };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.loadUserName();
  }

  private async loadUserName() {
    const username = localStorage.getItem('username');
    if (username) {
      const profile = await this.storage.get(`profile_${username}`);
      if (profile) {
        this.displayName = `${profile.firstName} ${profile.lastName}`;
      }
    }
  }

  ngAfterViewInit() {
    this.initMap();

    // Ajustar el mapa después de que el DOM esté completamente cargado
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 500);
  }

  ionViewDidEnter() {
    if (this.map) {
      this.map.invalidateSize(); // Recalcular dimensiones del mapa al volver a la vista
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapElement.nativeElement).setView(
      [this.duocUcSanJoaquin.lat, this.duocUcSanJoaquin.lon],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    const originIcon = L.icon({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Marcador de origen fijo
    const originMarker = L.marker(
      [this.duocUcSanJoaquin.lat, this.duocUcSanJoaquin.lon],
      { icon: originIcon }
    ).bindPopup('Origen: Duoc UC San Joaquín');
    this.markerLayer.addLayer(originMarker);
  }

  async traceRoute() {
    const origin = this.duocUcSanJoaquin; // Origen fijo
    const destination = await this.searchLocation(this.destinationQuery, true);

    if (destination) {
      const routeService = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
      fetch(routeService)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.routes && data.routes.length > 0) {
            const routeCoordinates = data.routes[0].geometry.coordinates;
            const latLngs = routeCoordinates.map((coord: any) => [
              coord[1],
              coord[0],
            ]);
            const routeLine = L.polyline(latLngs, { color: 'blue', weight: 4 });

            this.routeLayer.clearLayers();
            this.routeLayer.addLayer(routeLine);
            this.map.fitBounds(routeLine.getBounds());

            const distance = data.routes[0].distance / 1000;
            const durationInSeconds = data.routes[0].duration;
            const carTime = Math.ceil(durationInSeconds / 60);
            const walkingTime = Math.ceil((durationInSeconds * 1.5) / 60);

            this.distanceInfo = `Distancia: ${distance.toFixed(
              2
            )} km. En auto: ${carTime} mins, caminando: ${walkingTime} mins`;

            // Guardar la ruta en el localStorage
            this.saveRoute({
              origin: this.duocUcSanJoaquin,
              destination: destination,
              route: latLngs,
              distance: distance,
              duration: carTime,
            });
          }
        })
        .catch((error) => {
          console.error('Error al trazar la ruta:', error);
          alert('Hubo un problema al trazar la ruta.');
        });
    } else {
      alert('Por favor, ingresa un destino válido.');
    }
  }

  async searchLocation(query: string, isDestination: boolean) {
    if (!query) return null;

    const geocodeService = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=CL&q=${encodeURIComponent(
      query
    )}`;
    const response = await fetch(geocodeService);
    const data = await response.json();

    if (data && data.length > 0) {
      const location = data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      const markerIcon = L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      if (isDestination) {
        if (this.destinationMarker)
          this.markerLayer.removeLayer(this.destinationMarker);
        this.destinationMarker = L.marker([lat, lon], { icon: markerIcon })
          .bindPopup(`Destino: ${query}`)
          .openPopup();
        this.markerLayer.addLayer(this.destinationMarker);
      }

      this.map.setView([lat, lon], 14);

      return { lat, lon };
    } else {
      alert('No se encontró la ubicación.');
      return null;
    }
  }

  // Guardar la ruta en el localStorage
  private saveRoute(route: any) {
    const storedRoutes = JSON.parse(localStorage.getItem('sharedRoutes') || '[]');
    storedRoutes.push(route);
    localStorage.setItem('sharedRoutes', JSON.stringify(storedRoutes));
  }

  async shareLocation() {
    // Verifica si hay una ruta trazada antes de mostrar el mensaje
    if (!this.destinationQuery || !this.distanceInfo) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, traza una ruta antes de compartir.',
        buttons: ['Cerrar'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: '¡Ruta compartida!',
      message: `
            Ruta guardada con éxito, ¡se está buscando un auto-parner para ti!
      `,
      buttons: [
        {
          text: 'Aceptar',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });

    await alert.present();
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
          handler: () => {
            this.displayName = '';
            localStorage.removeItem('username');
            this.router.navigate(['/login']);
          },
        },
      ],
    });

    await alert.present();
  }
}
