import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  username: string = '';
  password: string = '';
  message: string = '';

  constructor(private router: Router) {}

  validateLogin() {
   
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

    if (this.username === 'admin' && this.password === '1234') {
      let extras: NavigationExtras = {
        state: { user: this.username }
      }
      this.router.navigate(['/home'], extras);
    } else {
      this.message = 'Login con error';
    }

    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
