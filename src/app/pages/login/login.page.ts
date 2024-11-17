import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { LoaderService } from '../../services/loader.service'; // Importar el servicio de Loader

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  message: string = '';

  // Lista de usuarios permitidos
  users: { username: string; password: string }[] = [
    { username: 'admin', password: '1234' },
    { username: 'admin1', password: '1234' },
    { username: 'admin2', password: '1234' },
    { username: 'admin3', password: '1234' },
  ];

  constructor(
    private readonly router: Router,
    private storage: Storage,
    private loaderService: LoaderService // Inyectar el LoaderService
  ) {}

  // Método para validar el inicio de sesión
  async validateLogin() {
    // Validar formato del username
    const usernameRegex = /^[A-Za-z0-9]{3,8}$/;
    if (!usernameRegex.test(this.username)) {
      this.message =
        'El nombre de usuario debe tener entre 3 y 8 caracteres alfanuméricos.';
      return;
    }

    // Validar formato del password
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(this.password)) {
      this.message = 'La contraseña debe ser un número de 4 dígitos.';
      return;
    }

    // Mostrar el loader
    await this.loaderService.show('Validando datos...');

    try {
      // Buscar usuario en la lista
      const user = this.users.find(
        (u) => u.username === this.username && u.password === this.password
      );

      if (user) {
        // Configuración inicial del almacenamiento
        await this.storage.create();

        // Guardar username en localStorage
        localStorage.setItem('username', this.username);

        // Obtener perfil asociado (si existe)
        const profile = await this.storage.get(`profile_${this.username}`);

        if (profile) {
          localStorage.setItem(
            'displayName',
            `${profile.firstName} ${profile.lastName}`
          );
        }

        // Configurar navegación con parámetros adicionales
        let extras: NavigationExtras = {
          state: { user: this.username },
        };

        // Ocultar loader y navegar al Home
        await this.loaderService.hide();
        this.router.navigate(['/home'], extras);
      } else {
        // Ocultar loader y mostrar mensaje de error
        await this.loaderService.hide();
        this.message = 'Usuario o contraseña incorrectos.';
      }
    } catch (error) {
      // Manejo de errores, ocultar loader y mostrar mensaje
      await this.loaderService.hide();
      this.message = 'Ocurrió un error al procesar el login.';
      console.error('Error en el login:', error);
    }
  }
}
