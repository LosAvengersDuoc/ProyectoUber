import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  ngOnInit() {}

  resetPassword() {
    if (this.password === this.confirmPassword) {
      this.router.navigate(['/login']);
    } else {
      alert('Passwords do not match');
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
