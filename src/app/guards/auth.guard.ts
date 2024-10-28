import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(): boolean {
    console.log('Executing AuthGuard!');
    const user = localStorage.getItem('username');
    if (!user) {
      console.log('User is not authenticated, redirecting to Login!');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}