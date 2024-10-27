import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { LoginService } from '../services/login.service';


export const noAuthGuard: CanActivateFn = (route, state) => {
  return false;
};

@Injectable({
  providedIn: 'root'
})
export class NoAuthenticationGuard implements CanActivate {
  constructor(
      private readonly router: Router,
      private readonly loginService: LoginService
  ){ }
  async canActivate() {

    console.log('Ejecutando no-guard!')
    const auth = await this.loginService.isAuthenticated();
    if (auth) {
        console.log('Usuario autenticado, redireccionando a Home!')
        await this.router.navigate(['/home']);
    }
    return !auth;
  }
}
