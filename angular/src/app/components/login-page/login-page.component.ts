import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2 } from '@angular/core';
import { SessionService } from '../../session.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnDestroy{
  @Output() valueChanged = new EventEmitter<{param:number}>();
  @Input() selectedCheckbox:boolean = true;
  username: string = '';
  sessionCode: string = '';
  sessionData: any; 
  selectedTab: string = 'tab1';
  isLoading:boolean=false;

  private sessionDataSubscription: Subscription;

  constructor(private sessionService: SessionService, private router: Router) {
    this.sessionDataSubscription = this.sessionService.sessionData$.subscribe(data => {
      this.sessionData = data;
    });
    this.valueChanged.emit({param:0});
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
        this.isLoading=true;
        setTimeout(()=>{
          this.valueChanged.emit({param:2});
        },5000);        
      }
      else{
        console.log("greska pri pravljenju sesije");
      }
    },100);
  }

  onCreateSession() {
    const createPlayerDto = { username: this.username };
    
    this.sessionService.createSession(createPlayerDto);

    console.log(this.sessionService);
    setTimeout(()=>{
      if(this.sessionService.getPlayerUsername() && this.sessionService.getSessionCode())
      {
        this.isLoading=true;
        setTimeout(()=>{
          this.valueChanged.emit({param:1});
        },5000);  
      }
      else{
        console.log(this.sessionService.getSessionCode());
      }
    },100);
  }

  ngOnDestroy(){
    this.sessionDataSubscription.unsubscribe();
  }
}
