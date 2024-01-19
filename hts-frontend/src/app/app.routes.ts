import { Routes } from '@angular/router';
import { SessionPageComponent } from './session-page/session-page.component';

export const routes: Routes = [
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
