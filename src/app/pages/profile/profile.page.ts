import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { Router } from '@angular/router';

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

  isEditing: boolean = false;  // Estado de edición

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProfile();

    if (!this.birthDate) {
      this.birthDate = '2000-01-01';
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  onDateChange(event: any) {
    const selectedDate = new Date(event.detail.value);
    if (!isNaN(selectedDate.getTime())) {
      this.birthDate = selectedDate.toISOString().split('T')[0];
    } else {
      alert('Fecha seleccionada no es válida.');
    }
  }

  validateFields(): boolean {
    if (!this.firstName || !this.lastName || !this.educationLevel || !this.birthDate) {
      return false;
    }
    return true;
  }

  saveProfile() {
    if (!this.validateFields()) {
      alert('Por favor, complete todos los campos antes de guardar.');
      return;
    }

    const profile = {
      firstName: this.firstName,
      lastName: this.lastName,
      educationLevel: this.educationLevel,
      birthDate: this.birthDate,
      hasVehicle: this.hasVehicle
    };
    
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Perfil guardado correctamente.');
    this.isEditing = false;  // Deshabilitar la edición después de guardar
  }

  enableEditing() {
    this.isEditing = true;  // Habilitar el modo de edición
  }

  loadProfile() {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      this.firstName = profile.firstName;
      this.lastName = profile.lastName;
      this.educationLevel = profile.educationLevel;
      this.birthDate = profile.birthDate;
      this.hasVehicle = profile.hasVehicle;
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

  clearLocalStorage() {
    localStorage.clear();
    alert('Memoria local vaciada.');
  }
}
