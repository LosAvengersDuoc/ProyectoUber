import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons'; // Importa los iconos
import { home, apps, reader, person } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  username: string = '';
  firstName: string = '';
  lastName: string = '';
  educationLevel: string = '';  // Modelo para el select
  birthDate: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({ home, apps, reader, person });
  }

  ngOnInit() {
    
    this.activatedRoute.queryParams.subscribe(params => {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as { user?: string };
      if (state && state.user) {
        this.username = state.user;
      }
    });
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Información del Usuario',
      message: `Nombre: ${this.firstName} ${this.lastName} 
      Nivel de Educación: ${this.educationLevel}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  clearFields() {
    this.firstName = '';
    this.lastName = '';
    this.educationLevel = '';  
  }
}
