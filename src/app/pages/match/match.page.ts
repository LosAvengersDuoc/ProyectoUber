import { Storage } from '@ionic/storage-angular';
import { Component, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-match',
  templateUrl: './match.page.html',
  styleUrls: ['./match.page.scss'],
})
export class MatchPage {
  @ViewChild('servicesLoading', { static: false }) servicesLoading!: HTMLIonLoadingElement;

  destination: string = '';
  noMatchesFound: boolean = false;
  showToast: boolean = false;

  selectedRide: any = null; // Almacena el viaje solicitado

  matches: any[] = [];
  currentUser: any = null;

  constructor(private storage: Storage, private toastController: ToastController) {}

  async ngOnInit() {
    await this.storage.create();
    this.loadCurrentUser();
    this.findMatches();
  }

  async loadCurrentUser() {
    const username = localStorage.getItem('username');
    if (username) {
      this.currentUser = await this.storage.get(`route_${username}`);
      console.log('Usuario actual:', this.currentUser);
  
      // Cargar la solicitud activa del usuario
      const currentUserKey = `rides_${this.currentUser.userName}`;
      this.selectedRide = await this.storage.get(currentUserKey);
      console.log('Viaje activo:', this.selectedRide);
    }
  }
  
  

  async findMatches() {
    await this.servicesLoading.present();

    if (this.currentUser && this.currentUser.role === 'pasajero') {
      const allUsers = await this.getAllUsers();
      const userLat = this.currentUser.passengerDestination.lat;
      const userLon = this.currentUser.passengerDestination.lon;

      console.log('Usuarios disponibles:', allUsers);

      this.matches = allUsers
        .filter(user => 
          //user.role === 'conductor' && // Solo conductores
          this.calculateProximity(user.passengerDestination.lat, user.passengerDestination.lon, userLat, userLon) > 0 // Proximidad
        )
        .map(user => ({
          ...user,
          proximity: this.calculateProximity(user.passengerDestination.lat, user.passengerDestination.lon, userLat, userLon),
        }));

      this.noMatchesFound = this.matches.length === 0;
      console.log('Coincidencias encontradas:', this.matches);
    } else {
        console.log(this.currentUser.role)
    }

    await this.servicesLoading.dismiss();
  }

  async getAllUsers() {
    const keys = await this.storage.keys();
    const userKeys = keys.filter(key => key.startsWith('route_'));
    const users = await Promise.all(userKeys.map(key => this.storage.get(key)));
    return users;
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

  async requestRide(match: any) {
    if (this.selectedRide) {
      // Mostrar confirmación si ya hay un viaje seleccionado
      const alert = document.createElement('ion-alert');
      alert.header = 'Confirmar reemplazo';
      alert.message = 'Ya tienes un viaje solicitado. ¿Quieres reemplazarlo con este?';
      alert.buttons = [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Reemplazar',
          handler: async () => {
            await this.replaceRide(match);
          },
        },
      ];
      document.body.appendChild(alert);
      await alert.present();
    } else {
      // Solicitar un nuevo viaje
      await this.saveRide(match);
    }
  }
  
  async saveRide(match: any) {
    this.selectedRide = match; // Guardar el viaje solicitado
    const currentUserKey = `rides_${this.currentUser.userName}`;
    await this.storage.set(currentUserKey, match);
    console.log('Viaje solicitado:', match);
  
    // Mostrar Toast de confirmación
    const toast = await this.toastController.create({
      message: 'Viaje solicitado exitosamente',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }
  
  async replaceRide(match: any) {
    this.selectedRide = match; // Reemplazar el viaje solicitado
    const currentUserKey = `rides_${this.currentUser.userName}`;
    await this.storage.set(currentUserKey, match);
    console.log('Viaje reemplazado:', match);
  
    // Mostrar Toast de reemplazo
    const toast = await this.toastController.create({
      message: 'El viaje ha sido reemplazado exitosamente',
      duration: 2000,
      position: 'bottom',
      color: 'warning',
    });
    await toast.present();
  }
  
}
