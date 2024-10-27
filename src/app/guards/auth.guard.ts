import { CanActivateFn, Router } from '@angular/router';
import { Injectable } from "@angular/core";
import { CanActivate } from '@angular/router';
import { LoginService } from "../services/login.service";

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  constructor(
      private readonly router: Router,
      private readonly loginService: LoginService
  ){ }
  async canActivate() {
      console.log('Ejecutando guard!')
      const auth = await this.loginService.isAuthenticated();
      if (!auth) {
          console.log('El Usuario no esta autenticado, redireccionando a Login!')
          await this.router.navigate(['/login']);
      }
      return auth;
  }
}

