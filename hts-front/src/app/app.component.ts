import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WebSocketService } from './services/web-socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'here-to-slay';
  

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.webSocketService.listen('test event').subscribe((data)=>{
      console.log(data);
    })
  }

}
