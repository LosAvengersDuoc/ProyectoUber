import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, apps, reader, person } from 'ionicons/icons';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  displayName: string = '';
  username: string = localStorage.getItem('username') || '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private storage: Storage
  ) {
    addIcons({ home, apps, reader, person });
    this.storage.create();
  }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as { user?: string };
      if (state && state.user) {
        localStorage.setItem('username', state.user);
      }

      this.loadProfile();
    });
  }

  async loadProfile() {
    const savedProfile = await this.storage.get(`profile_${this.username}`);
    if (savedProfile) {
      this.displayName = savedProfile.firstName + " " + savedProfile.lastName;
    }
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Información del Usuario',
      message: `Nombre: ${this.displayName}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
    this.router.navigate(['/login']);
  }

  goToResetPassword() {
    this.router.navigate(['/reset-password']);
  }
}
