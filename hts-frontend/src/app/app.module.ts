import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { SessionPageComponent } from './session-page/session-page.component';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [AppComponent, SessionPageComponent],
  imports: [SocketIoModule.forRoot(config), CommonModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}