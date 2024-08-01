import { Component, EventEmitter, Output } from '@angular/core';
import { SessionService } from '../../lobby.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPlayer, ISession } from '../../interfaces';

@Component({
  selector: 'app-lobby-page',
  templateUrl: './lobby-page.component.html',
  styleUrl: './lobby-page.component.css',
})
export class LobbyPageComponent {
  @Output() valueChanged = new EventEmitter<{ param: number }>();
  private sessionDataSubscription: Subscription;
  private sessionInfo: ISession | undefined;
  playVideo: boolean = false;
  sessionData: any;
  isLoading: boolean = true;
  sessionCode: string = '';
  ready: boolean = false;
  opponentUsername:string='';
  playerUsername:string='';
  host:boolean=false;
  waitingMessages: string[] = [
    "Sharpening your swords",
    "Gathering heroes",
    "Preparing the battlefield",
    "Strategizing your moves",
    "Summoning mystical creatures",
    "Loading epic adventures",
    "Assembling your party",
    "Rolling the dice of destiny",
    "Setting up traps and treasures",
    "Finalizing game setup"
  ];
  loadingSentence:string='';
  randomIndex:number = 0;


  generateRandomNumber(): number {
    return Math.floor(Math.random() * 10); // Generiše broj između 0 i 9
  }

  constructor(private sessionService: SessionService, private router: Router) {
    this.sessionDataSubscription = this.sessionService.session$.subscribe(
      (data) => {
        this.sessionData = data;
      }
      
    );
    this.valueChanged.emit({ param: 1 });
    this.randomIndex = this.generateRandomNumber();
    this.loadingSentence = this.waitingMessages[this.randomIndex];
    this.sessionCode = sessionService.getSessionCode();
    this.playerUsername = this.sessionService.getPlayerUsername();
    this.host=this.sessionService.isHost();
    setTimeout(() => {
      this.playVideo = true;
      this.isLoading = false;
      this.sessionService.opponentData$.subscribe(data =>{
        if (data) {
          if(this.host)
          {
            this.isLoading=true;
            setTimeout(() => {
              this.opponentUsername = this.sessionService.getOpponentUsername();
              console.log(this.opponentUsername);
              this.ready = true;
              this.isLoading = false;
            }, 3000);
          }
          else
          {
            this.opponentUsername = this.sessionService.getOpponentUsername();
            console.log(this.opponentUsername);
            this.ready = true;
            this.sessionService.sessionData$.subscribe(session =>{
              if(session)
              {
                this.isLoading=true;
                setTimeout(() => {
                  this.valueChanged.emit({ param: 2 });
                }, 3000);
              }
            });
          }
          
        }
      });
      
    }, 2000);
    
     
  }
  onPlay(){
    this.isLoading = true;
    this.sessionService.startGame();
        setTimeout(() => {
          this.valueChanged.emit({ param: 2 });
    }, 2000);
  }
}
