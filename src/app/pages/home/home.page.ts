import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {


  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: L.Map;
  markerLayer!: L.LayerGroup;
  routeLayer!: L.LayerGroup;
  destinationMarker: any;
  displayName: string = localStorage.getItem('displayName') || '';
  distanceInfo: string = '';
  passengerDestination: string = '';
  driverDestination: string = '';



  constructor(
    private router: Router,
    private alertController: AlertController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.loadUserName();
  }

  ngAfterViewInit() {
    // Ajustar el mapa después de que el DOM esté completamente cargado
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 500);
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

