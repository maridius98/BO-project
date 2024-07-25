import { Component, OnDestroy } from '@angular/core';
import { SessionService } from '../../session.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.css'],
})
export class SessionPageComponent {
  prva: number = 0;
  druga: number = 0;
  prvaOponent: number = 0;
  drugaOponent: number = 0;

  DiceRoll() {
    this.prva = Math.floor(Math.random() * 6) + 1;
    this.druga = Math.floor(Math.random() * 6) + 1;
  }
}
