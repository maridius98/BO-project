import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionPageComponent } from './session-page/session-page.component';
import { LoginPageComponent } from './login-page/login-page.component';

const routes: Routes = [
  {
      path: '',
      redirectTo: '/login',
      pathMatch: 'full'
    },
    {
      path: 'login',
      component: LoginPageComponent
    },
    { path: 'session-page', 
      component: SessionPageComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
