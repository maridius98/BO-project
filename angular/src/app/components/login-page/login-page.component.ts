import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';
import { SessionService } from '../../session.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  @Output() valueChanged = new EventEmitter<{ param: number }>();
  @Input() selectedCheckbox: boolean = true;
  username: string = '';
  sessionCode: string = '';
  selectedTab: string = 'tab1';
  isLoading: boolean = false;

  constructor(private sessionService: SessionService, private router: Router) {
    this.valueChanged.emit({ param: 0 });
  }

  playAudio() {
    const audio = new Audio('../assets/loginAudio.mp3');
    audio.autoplay = true;
    audio.muted = false;
    audio.loop = true;

    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onJoinSession() {
    const createPlayerDto = { username: this.username, code: this.sessionCode };
    this.sessionService.joinLobby(createPlayerDto);
    setTimeout(() => {
      if (this.sessionService.player$ && this.sessionService.getSessionCode()) {
        this.isLoading = true;
        setTimeout(() => {
          this.valueChanged.emit({ param: 1 });
          // this.playAudio();
        }, 2000);
      } else {
        console.log('greska pri pravljenju sesije');
      }
    }, 200);
  }

  onCreateSession() {
    const createPlayerDto = { username: this.username };

    this.sessionService.createLobby(createPlayerDto);

    setTimeout(() => {
      if (this.sessionService.player$ && this.sessionService.getSessionCode()) {
        this.isLoading = true;
        setTimeout(() => {
          this.valueChanged.emit({ param: 1 });
          //this.playAudio();
        }, 1000);
      } else {
      }
    }, 200);
  }
}
