import { Component, OnDestroy } from '@angular/core';
import { SessionService } from '../session.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.css']
})
export class SessionPageComponent{
  private sessionDataSubscription: Subscription;
  sessionData: any; 
  sessionCode: string = '';

  constructor(private sessionService: SessionService, private router: Router) {
    this.sessionDataSubscription = this.sessionService.sessionData$.subscribe(data => {
      this.sessionData = data;
    });
    this.sessionCode=sessionService.getSessionCode();
  }


}
