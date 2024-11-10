import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
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
  originalProfile: any = {};

  constructor(private router: Router, private storage: Storage) {
    this.storage.create();
  }

  async ngOnInit() {
    this.username = localStorage.getItem('username') || "";
    this.loadProfile();
    if (!this.birthDate) this.birthDate = '2000-01-01';
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isEditing) {
      $event.returnValue = true;
    }
  }

  async saveProfile() {
    if (!this.validateFields()) {
      alert('Por favor, complete todos los campos antes de guardar.');
      return;
    }

    if (confirm('¿Está seguro de que desea guardar los cambios?')) {
      const profile = {
        firstName: this.firstName,
        lastName: this.lastName,
        educationLevel: this.educationLevel,
        birthDate: this.birthDate,
        hasVehicle: this.hasVehicle
      };
      await this.storage.set(`profile_${this.username}`, profile);
      alert('Perfil guardado correctamente.');
      this.isEditing = false;
      this.originalProfile = { ...profile };
    }
  }

  enableEditing() {
    this.isEditing = true;
    this.originalProfile = {
      firstName: this.firstName,
      lastName: this.lastName,
      educationLevel: this.educationLevel,
      birthDate: this.birthDate,
      hasVehicle: this.hasVehicle
    };
  }

  async loadProfile() {
    const savedProfile = await this.storage.get(`profile_${this.username}`);
    if (savedProfile) {
      this.firstName = savedProfile.firstName;
      this.lastName = savedProfile.lastName;
      this.educationLevel = savedProfile.educationLevel;
      this.birthDate = savedProfile.birthDate;
      this.hasVehicle = savedProfile.hasVehicle;
      this.originalProfile = { ...savedProfile };
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate($event: Event) {
    if (this.isEditing && !this.profileUnchanged()) {
      const confirmation = confirm('Hay cambios sin guardar. ¿Desea salir sin guardar?');
      if (!confirmation) $event.preventDefault();
    }
  }

  profileUnchanged(): boolean {
    return this.firstName === this.originalProfile.firstName &&
           this.lastName === this.originalProfile.lastName &&
           this.educationLevel === this.originalProfile.educationLevel &&
           this.birthDate === this.originalProfile.birthDate &&
           this.hasVehicle === this.originalProfile.hasVehicle;
  }

  validateFields(): boolean {
    return !!(this.firstName && this.lastName && this.educationLevel && this.birthDate);
  }  
}
