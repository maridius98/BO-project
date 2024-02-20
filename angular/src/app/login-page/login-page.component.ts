import { Component, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';
import { SessionService } from '../session.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnDestroy{

  @Input() selectedCheckbox:boolean = true;
  username: string = '';
  sessionCode: string = '';
  sessionData: any; 
  selectedTab: string = 'tab1';

  private sessionDataSubscription: Subscription;

  constructor(private sessionService: SessionService, private router: Router) {
    this.sessionDataSubscription = this.sessionService.sessionData$.subscribe(data => {
      this.sessionData = data;
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onJoinSession() {
    const createPlayerDto = { username: this.username, sessionCode: this.sessionCode };
    this.sessionService.joinSession(createPlayerDto);
    setTimeout(()=>{
      if(this.sessionService.getPlayerUsername() && this.sessionService.getSessionCode())
      {
        this.router.navigate(['/session-page']);
      }
      else{
        console.log("greska pri pravljenju sesije");
      }
    },100); 
  }

  onCreateSession() {
    const createPlayerDto = { username: this.username };
    console.log(createPlayerDto);
    this.sessionService.createSession(createPlayerDto);
    setTimeout(()=>{
      if(this.sessionService.getPlayerUsername() && this.sessionService.getSessionCode())
      {
        this.router.navigate(['/session-page']);
      }
      else{
        console.log("greska pri pravljenju sesije");
      }
    },100);
  }

  ngOnDestroy(){
    this.sessionDataSubscription.unsubscribe();
  }
}
