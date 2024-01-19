import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketIoModule } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'hts-frontend';
}
