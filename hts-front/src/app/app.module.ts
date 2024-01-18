import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };



@NgModule({
  declarations: [],
  imports: [
    CommonModule,SocketIoModule.forRoot(config)
  ]
})
export class AppModule { }
