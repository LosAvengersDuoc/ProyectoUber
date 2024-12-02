import { Storage } from '@ionic/storage-angular';
import { Component, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage {
  @ViewChild('servicesLoading', { static: false }) servicesLoading!: HTMLIonLoadingElement;

  destination: string = '';
  filterProximity: boolean = false;
  filterVehicleAvailability: boolean = false;
  noMatchesFound: boolean = false;
  showToast: boolean = false;

  matches: any[] = [];

  otherUsers = [
    { name: 'Usuario 1', destination: 'Centro Comercial', lat: -33.4602, lon: -70.6483 },
    { name: 'Usuario 2', destination: 'Duoc UC San Joaquín', lat: -33.4949, lon: -70.7217 },
    { name: 'Usuario 3', destination: 'Parque Arauco', lat: -33.4675, lon: -70.6111 },
    { name: 'Usuario 4', destination: 'Plaza de Maipú', lat: -33.4597, lon: -70.8505 },
  ];

  constructor(private storage: Storage, private toastController: ToastController) {}

  
  ngOnInit() {
    this.storage.create();
  }

  async findMatches() {
    await this.servicesLoading.present();

    this.getUserLocation();

    this.servicesLoading.dismiss();
  }

  async getUserLocation() {
    const username = localStorage.getItem('username');
    if (username) {
      const routeData = await this.storage.get(`route_${username}`);
      if (routeData && routeData.passengerDestination) {
        const { lat, lon } = routeData.passengerDestination;
        console.log(`Ubicación del usuario: Lat: ${lat}, Lon: ${lon}`);
        
        this.findMatch(lat, lon);
      } else {
        console.log('No se encontró la ubicación del usuario en Storage');
      }
    } else {
      console.log('No hay nombre de usuario en el localStorage');
    }
  }

  calculateProximity(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }
  

  findMatch(userLat: number, userLon: number) {
    this.matches = this.otherUsers.map(user => {
      const distance = this.calculateProximity(user.lat, user.lon, userLat, userLon);
      if (distance <= 10) {
        return {
          ...user,
          proximity: distance,
        };
      }
    }).filter(match => match !== undefined);

    this.noMatchesFound = this.matches.length === 0;

    console.log('Coincidencias encontradas:', this.matches);
  }

  async requestRide(match: any) {
    console.log(`Solicitando viaje con ${match.name} hacia ${match.destination}`);

    this.showToast = true;

    const toast = await this.toastController.create({
      message: 'Match completado',
      duration: 2000, // Duración del toast en milisegundos
      position: 'bottom', // Posición en la pantalla
      color: 'success' // Color del toast
    });

    // Mostrar el toast
    await toast.present();

    // Puedes agregar aquí cualquier lógica adicional si es necesario
  }
}
