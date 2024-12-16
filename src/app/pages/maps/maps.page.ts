import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: L.Map;
  markerLayer!: L.LayerGroup;
  routeLayer!: L.LayerGroup;
  destinationMarker: any;
  displayName: string = localStorage.getItem('displayName') || '';
  distanceInfo: string = '';
  passengerDestination: string = '';
  passengerCommune: string = '';
  passengerStreet: string = '';
  driverDestination: string = '';

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

  private async getUserRole(): Promise<string> {
    const username = localStorage.getItem('username');
    if (!username) {
      console.error('No se encontró el usuario.');
      return 'desconocido';
    }
  
    const profile = await this.storage.get(`profile_${username}`);
    if (profile) {
      return profile.hasVehicle ? 'conductor' : 'pasajero';
    } else {
      console.error('No se encontró el perfil del usuario.');
      return 'desconocido';
    }
  }
  

  async traceRoute() {
    const origin = this.duocUcSanJoaquin;
    this.logLocation(origin, 'Origen');
  
    // Cargar el rol del usuario (conductor o pasajero)
    const role = await this.getUserRole();
  
    // Buscar el destino del pasajero
    const passengerDestination1 = this.passengerStreet + ", " + this.passengerCommune;

    console.log(passengerDestination1)
    const passengerDestination = await this.searchLocation(passengerDestination1, true);
  
    if (passengerDestination) {
      const routeService = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${passengerDestination.lon},${passengerDestination.lat}?overview=full&geometries=geojson`;
  
      fetch(routeService)
        .then((response) => response.json())
        .then(async (data) => {
          if (data && data.routes && data.routes.length > 0) {
            const routeCoordinates = data.routes[0].geometry.coordinates;
            const latLngs = routeCoordinates.map((coord: any) => [coord[1], coord[0]]);
            const routeLine = L.polyline(latLngs, { color: 'blue', weight: 4 });
  
            // Mostrar la ruta en el mapa
            this.routeLayer.clearLayers();
            this.routeLayer.addLayer(routeLine);
            this.map.fitBounds(routeLine.getBounds());
  
            // Calcular distancia y tiempo
            const distance = data.routes[0].distance / 1000;
            const durationInSeconds = data.routes[0].duration;
            const carTime = Math.ceil(durationInSeconds / 60);
  
            this.distanceInfo = `Distancia total: ${distance.toFixed(2)} km. Tiempo estimado en auto: ${carTime} mins.`;
  
            const userName = this.displayName;

            // Guardar datos en Ionic Storage
            const username = localStorage.getItem('username');
            const routeData = {
              userName,
              passengerDestination1,
              origin,
              passengerDestination,
              distance: distance.toFixed(2),
              duration: carTime,
              coordinates: routeCoordinates,
              role,
            };
  
            if (username) {
              await this.storage.set(`route_${username}`, routeData);
              console.log('Ruta guardada exitosamente en el Storage:', routeData);
            } else {
              console.error('No se encontró el usuario.');
            }
          }
        })
        .catch((error) => {
          console.error('Error al trazar la ruta:', error);
          alert('Hubo un problema al trazar la ruta.');
        });
    } else {
      alert('Por favor, ingresa un destino válido para el pasajero.');
    }
  }
  

  async searchLocation(query: string, isPassenger: boolean) {
    if (!query) return null;

    const geocodeService = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=CL&q=${encodeURIComponent(query)}`;
    const response = await fetch(geocodeService);
    const data = await response.json();

    if (data && data.length > 0) {
      const location = data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      const markerIcon = L.icon({
        iconUrl: isPassenger
          ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lon], { icon: markerIcon }).bindPopup(
        isPassenger ? `Destino del pasajero: ${query}` : `Destino del conductor: ${query}`
      );

      this.markerLayer.addLayer(marker);

      this.map.setView([lat, lon], 14);

      return { lat, lon };
    } else {
      alert('No se encontró la ubicación.');
      return null;
    }
  }

  logLocation(location: any, label: string) {
    if (location && location.lon && location.lat) {
      console.log(`${label} - Coordenadas: Lon: ${location.lon}, Lat: ${location.lat}`);
    } else {
      console.error(`${label} - Datos de ubicación no válidos:`, location);
    }
  }

  async shareLocation() {
    const username = localStorage.getItem('username');
    const savedRoute = await this.storage.get(`route_${username}`);

    if (!savedRoute || !this.distanceInfo) {
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
      message: `Ruta guardada con éxito, ¡se está buscando un auto-parner para ti!`,
      buttons: [
        {
          text: 'Aceptar',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });

    await alert.present();

    console.log('Ruta compartida:', savedRoute);
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
