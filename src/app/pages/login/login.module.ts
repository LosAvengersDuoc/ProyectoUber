import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { IonicModule } from '@ionic/angular'; // Importa IonicModule
import { RouterModule } from '@angular/router';

import { LoginPage } from './login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,       // Añade FormsModule
    IonicModule,       // Añade IonicModule
    RouterModule.forChild([{ path: '', component: LoginPage }])
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
