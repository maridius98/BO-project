import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionPageComponent } from './session-page/session-page.component';

const routes: Routes = [
  {
      path: '',
      redirectTo: '/session',
      pathMatch: 'full'
    },
    {
      path: 'session',
      component: SessionPageComponent
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
