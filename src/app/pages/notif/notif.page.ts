import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-notif',
  templateUrl: './notif.page.html',
  styleUrls: ['./notif.page.scss'],
})
export class NotifPage implements OnInit {
  selectedRide: any = null; // Almacena el viaje solicitado del usuario
  currentUser: any = null; // Información del usuario actual
  isConductor: boolean = false; // Variable para verificar si el usuario es conductor

  constructor(
    private storage: Storage,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.loadCurrentUser();
    await this.loadCurrentRide();
  }

  // Cargar el usuario actual y verificar si es conductor
  async loadCurrentUser() {
    const username = localStorage.getItem('username');
    if (username) {
      this.currentUser = await this.storage.get(`route_${username}`);
      if (this.currentUser && this.currentUser.role === 'conductor') {
        this.isConductor = true; // El usuario es conductor
      }
    }
  }

  // Cargar el viaje solicitado desde el almacenamiento
  async loadCurrentRide() {
    if (this.currentUser) {
      const currentUserKey = `rides_${this.currentUser.userName}`;
      this.selectedRide = await this.storage.get(currentUserKey);
      console.log('Viaje solicitado cargado:', this.selectedRide);
    }
  }

  // Confirmar eliminación del viaje
  async confirmDeleteRide() {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Estás seguro de que deseas cancelar este viaje?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            await this.deleteRide();
          },
        },
      ],
    });
    await alert.present();
  }

  // Eliminar el viaje del almacenamiento
  async deleteRide() {
    const currentUserKey = `rides_${this.currentUser.userName}`;
    await this.storage.remove(currentUserKey);
    this.selectedRide = null;

    // Mostrar mensaje de confirmación
    const toast = await this.toastController.create({
      message: 'El viaje ha sido cancelado.',
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }
}
