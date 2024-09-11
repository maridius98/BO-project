import { Component, EventEmitter, Output } from '@angular/core';
import { SessionService } from '../../session.service';
import { BehaviorSubject } from 'rxjs';
import { IPlayer } from '../../interfaces';

@Component({
  selector: 'app-lobby-page',
  templateUrl: './lobby-page.component.html',
  styleUrl: './lobby-page.component.css',
})
export class LobbyPageComponent {
  @Output() valueChanged = new EventEmitter<{ param: number }>();
  opponent$: BehaviorSubject<IPlayer | null>;
  player$: BehaviorSubject<IPlayer | null>;
  playVideo: boolean = false;
  isLoading: boolean = true;
  isHost: boolean = false;
  sessionCode: string = '';
  ready: boolean = false;
  playerUsername: string = '';
  waitingMessages: string[] = [
    'Sharpening your swords',
    'Gathering heroes',
    'Preparing the battlefield',
    'Strategizing your moves',
    'Summoning mystical creatures',
    'Loading epic adventures',
    'Assembling your party',
    'Rolling the dice of destiny',
    'Setting up traps and treasures',
    'Finalizing game setup',
  ];
  loadingSentence: string = '';

  generateRandomNumber(): number {
    return Math.floor(Math.random() * 10);
  }

  constructor(private sessionService: SessionService) {
    this.opponent$ = sessionService.opponent$;
    this.player$ = sessionService.player$;
    this.isHost = this.player$.getValue()!.isHost;
    this.valueChanged.emit({ param: 1 });
    this.loadingSentence = this.waitingMessages[this.generateRandomNumber()];
    this.sessionCode = sessionService.getSessionCode();

    setTimeout(() => {
      this.playVideo = true;
      this.isLoading = false;
      this.sessionService.opponent$.subscribe((data) => {
        if (data) {
          if (this.isHost) {
            this.isLoading = true;
            setTimeout(() => {
              this.ready = true;
              this.isLoading = false;
            }, 3000);
          } else {
            this.ready = true;
            this.sessionService.session$.subscribe((session) => {
              if (session) {
                this.isLoading = true;
                setTimeout(() => {
                  this.valueChanged.emit({ param: 2 });
                }, 1000);
              }
            });
          }
        }
      });
    }, 1000);
  }

  onPlay() {
    this.isLoading = true;
    this.sessionService.startGame();
    setTimeout(() => {
      this.valueChanged.emit({ param: 2 });
    }, 1000);
  }
}
