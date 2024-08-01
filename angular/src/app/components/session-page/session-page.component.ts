import { Component, OnDestroy } from '@angular/core';
import { SessionService } from '../../lobby.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.css'],
})
export class SessionPageComponent {
  prva: number = 1;
  druga: number = 1;
  prvaOpponent: number = 1;
  drugaOpponent: number = 1;
  playerActionPoints:number = 3;
  opponentActionPoints:number = 3;

  DiceRoll() {
    this.prva = Math.floor(Math.random() * 6) + 1;
    this.druga = Math.floor(Math.random() * 6) + 1;
  }
}
