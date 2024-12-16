import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
  currentUser: any = null;
  isConductor: boolean = false;

  constructor(private storage: Storage) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  // Método para cargar el usuario y verificar su rol
  async loadCurrentUser() {
    const username = localStorage.getItem('username');
    if (username) {
      this.currentUser = await this.storage.get(`route_${username}`);
      // Validar si el usuario es conductor o pasajero
      if (this.currentUser && this.currentUser.role === 'conductor') {
        this.isConductor = true;
      }
    }
  }
}
