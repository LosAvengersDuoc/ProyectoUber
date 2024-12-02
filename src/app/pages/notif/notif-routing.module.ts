import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotifPage } from './notif.page';

const routes: Routes = [
  {
    path: '',
    component: NotifPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotifPageRoutingModule {}
