import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(): boolean {
    console.log('Executing NoAuthGuard!');
    const user = localStorage.getItem('username');
    if (user) {
      console.log('User is already authenticated, redirecting to Home!');
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
