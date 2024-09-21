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
    // Asegúrate de que el valor recibido sea una fecha válida
    const selectedDate = new Date(event.detail.value);
    if (!isNaN(selectedDate.getTime())) {
      // Guarda la fecha en el formato ISO
      this.birthDate = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
  
  // Método para obtener la fecha formateada para mostrarla
  getFormattedBirthDate(): string {
    if (!this.birthDate) return ''; // Retorna vacío si birthDate no está definido
  
    const date = new Date(this.birthDate);
    if (isNaN(date.getTime())) return ''; // Retorna vacío si la fecha es inválida
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  }

  clearLocalStorage() {
    localStorage.clear();  // Elimina todos los datos en Local Storage
    alert('Memoria local vaciada.');
  } 
}
