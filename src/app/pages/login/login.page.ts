import { Component, ViewChild } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  @ViewChild('loginLoading', { static: false }) loginLoading!: HTMLIonLoadingElement;


  username: string = '';
  password: string = '';
  message: string = '';
  isLoading: boolean = false;

  users: { username: string; password: string }[] = [
    { username: 'admin', password: '1234' },
    { username: 'admin1', password: '1234' },
    { username: 'admin2', password: '1234' },
    { username: 'admin3', password: '1234' },
  ];

  constructor(private readonly router: Router, private storage: Storage) {}

  async validateLogin() {
    const usernameRegex = /^[A-Za-z0-9]{3,8}$/;
    if (!usernameRegex.test(this.username)) {
      this.message = 'El nombre de usuario debe tener entre 3 y 8 caracteres alfanuméricos.';
      return;
    }
  
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(this.password)) {
      this.message = 'La contraseña debe ser un número de 4 dígitos.';
      return;
    }
  
    this.isLoading = true;
  
    try {
      const user = this.users.find(
        (u) => u.username === this.username && u.password === this.password
      );
  
      if (user) {
        await this.loginLoading.present();

        setTimeout(async () => {
          this.loginLoading.dismiss()
          await this.storage.create();
          localStorage.setItem('username', this.username);
  
          const profile = await this.storage.get(`profile_${this.username}`);
          if (profile) {
            localStorage.setItem(
              'displayName',
              `${profile.firstName} ${profile.lastName}`
            );
          }
  
          let extras: NavigationExtras = {
            state: { user: this.username },
          };
  
          this.isLoading = false; // Desactivar el estado de carga antes de navegar
          this.router.navigate(['/home'], extras);
        }, 1500);
      } else {
        this.isLoading = false; // Desactivar el estado de carga si no se encuentra el usuario
        this.message = 'Usuario o contraseña incorrectos.';
      }
    } catch (error) {
      this.isLoading = false; // Desactivar el estado de carga en caso de error
      this.message = 'Ocurrió un error al procesar el login.';
      console.error('Error en el login:', error);
    }
  }
  
}
