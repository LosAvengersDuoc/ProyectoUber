import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('datePicker', { static: false }) datePicker!: IonDatetime;

  firstName: string = '';
  lastName: string = '';
  educationLevel: string = '';
  birthDate: string = '';
  hasVehicle: boolean = false;
  username: string = '';
  isEditing: boolean = false;

  constructor(
    private router: Router,
    private storage: Storage,
    private alertController: AlertController // Importamos AlertController
  ) {
    this.storage.create();
  }

  async ngOnInit() {
    this.username = localStorage.getItem('username') || "";

    if(this.username.length >= 1) {
        console.log(`Cargando perfil para el usuario: ${this.username}`);
    }

    this.loadProfile();

    if (!this.birthDate) {
      this.birthDate = '2000-01-01';
    }
  }

  onDateChange(event: any) {
    const selectedDate = new Date(event.detail.value);
    if (!isNaN(selectedDate.getTime())) {
      this.birthDate = selectedDate.toISOString().split('T')[0];
    } else {
      this.showAlert('Fecha no válida', 'La fecha seleccionada no es válida.');
    }
  }

  validateFields(): boolean {
    return !!(this.firstName && this.lastName && this.educationLevel && this.birthDate);
  }

  async showValidationAlert() {
    const alert = await this.alertController.create({
      header: 'Campos incompletos',
      message: 'Por favor, complete todos los campos antes de guardar.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async confirmSaveProfile() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas guardar los cambios?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => this.saveProfileData(),
        },
      ],
    });

    await alert.present();
  }

  async saveProfile() {
    if (!this.validateFields()) {
      await this.showValidationAlert();
      return;
    }
    // Llamamos a la confirmación antes de guardar los cambios
    await this.confirmSaveProfile();
  }

  async saveProfileData() {
    const profile = {
      firstName: this.firstName,
      lastName: this.lastName,
      educationLevel: this.educationLevel,
      birthDate: this.birthDate,
      hasVehicle: this.hasVehicle
    };

    await this.storage.set(`profile_${this.username}`, profile);
    this.showAlert('Perfil guardado', 'Perfil guardado correctamente.');
    this.isEditing = false;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  enableEditing() {
    this.isEditing = true;
  }

  async loadProfile() {
    const savedProfile = await this.storage.get(`profile_${this.username}`);
    if (savedProfile) {
      this.firstName = savedProfile.firstName;
      this.lastName = savedProfile.lastName;
      this.educationLevel = savedProfile.educationLevel;
      this.birthDate = savedProfile.birthDate;
      this.hasVehicle = savedProfile.hasVehicle;
    }
  }

  getFormattedBirthDate(): string {
    if (!this.birthDate) return '';

    const date = new Date(this.birthDate);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  async clearStorage() {
    await this.storage.clear();
    this.showAlert('Almacenamiento borrado', 'Memoria de almacenamiento vaciada.');
  }
}
