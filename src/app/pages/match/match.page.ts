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

  matches: any[] = [];
  currentUser: any = null; // Datos del usuario conectado

  constructor(private storage: Storage, private toastController: ToastController) {}

  async ngOnInit() {
    await this.storage.create();
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    const username = localStorage.getItem('username');
    if (username) {
      this.currentUser = await this.storage.get(`route_${username}`);
      console.log('Usuario actual:', this.currentUser);
    }
  }

  async findMatches() {
    await this.servicesLoading.present();

    if (this.currentUser && this.currentUser.role === 'pasajero') {
      const allUsers = await this.getAllUsers();
      const userLat = this.currentUser.passengerDestination.lat;
      const userLon = this.currentUser.passengerDestination.lon;

      this.matches = allUsers
        .filter(user => 
          user.role === 'conductor' && // Solo conductores
          user.username !== localStorage.getItem('username') && // Excluir al usuario actual
          this.calculateProximity(user.passengerDestination.lat, user.passengerDestination.lon, userLat, userLon) <= 10 // Proximidad
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
    console.log(`Solicitando viaje con ${match.username} hacia ${match.passengerDestination}`);
    this.showToast = true;

    const toast = await this.toastController.create({
      message: 'Match completado',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });

    await toast.present();
  }
}
