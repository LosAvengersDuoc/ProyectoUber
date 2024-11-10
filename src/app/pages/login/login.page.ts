import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage-angular'; // Asegúrate de importar Storage

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  message: string = '';

  users: { username: string, password: string }[] = [
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

    const user = this.users.find(u => u.username === this.username && u.password === this.password);
    if (user) {
            await this.storage.create();
            
        localStorage.setItem('username', this.username);

        const profile = await this.storage.get(`profile_${this.username}`);
        
        if (profile) {
            localStorage.setItem('displayName', `${profile.firstName} ${profile.lastName}`);
        }

        let extras: NavigationExtras = {
            state: { user: this.username }
        };

        this.router.navigate(['/home'], extras);
    } else {
        this.message = 'Login con error';
    }

    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
