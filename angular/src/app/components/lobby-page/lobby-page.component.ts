import { Component } from '@angular/core';
import { SessionService } from '../../session.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby-page',
  templateUrl: './lobby-page.component.html',
  styleUrl: './lobby-page.component.css'
})
export class LobbyPageComponent {

  private sessionDataSubscription: Subscription;
  playVideo:boolean=false;
  sessionData: any; 
  isLoading:boolean=true;
  sessionCode: string = '';

  constructor(private sessionService: SessionService, private router: Router) {
    this.sessionDataSubscription = this.sessionService.sessionData$.subscribe(data => {
      this.sessionData = data;
    });
    this.sessionCode=sessionService.getSessionCode();
    setTimeout(()=>{
      this.playVideo=true;
      this.isLoading=false;
    },2000);
    
  }
}
