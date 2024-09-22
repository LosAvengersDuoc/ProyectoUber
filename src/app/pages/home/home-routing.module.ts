import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})


/*@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        component: HomePage,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'home',
          },
          {
            path: 'home',
            loadChildren: () => import('src/app/pages/home/home-page.module').then((m) => m.HomePageModule),
          },
          {
            path: 'profile',
            loadChildren: () => import('src/app/pages/profile/profile-page.module').then((m) => m.ProfilePageModule),
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})*/
export class HomePageRoutingModule {}
