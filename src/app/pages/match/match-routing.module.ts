import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MatchPage } from './match.page';

const routes: Routes = [
  {
    path: '',
    component: MatchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MatchPageRoutingModule {}
