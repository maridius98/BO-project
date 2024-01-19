import { Component, OnDestroy } from '@angular/core';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { SocketIoModule } from 'ngx-socket-io';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.css']
})
export class SessionPageComponent implements OnDestroy{
  username: string = '';
  sessionCode: string = '';
  sessionData: any; 

  private sessionDataSubscription: Subscription;

  constructor(private sessionService: SessionService) {
    this.sessionDataSubscription = this.sessionService.sessionData$.subscribe(data => {
      this.sessionData = data;
    });
  }

  onJoinSession() {
    const createPlayerDto = { username: this.username, sessionCode: this.sessionCode };
    this.sessionService.joinSession(createPlayerDto);
  }

  onCreateSession() {
    const createPlayerDto = { username: this.username, sessionCode: this.sessionCode };
    this.sessionService.createSession(createPlayerDto);
  }

  ngOnDestroy(){
    this.sessionDataSubscription.unsubscribe();
  }
}
