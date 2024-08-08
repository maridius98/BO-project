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
  actionPoints:number=2;
  opponentHandNumber:number=5;
  playerHandNumber:number=8;
  turn:number=2;
  showPickedCard:boolean=false;
  selectedValue: number | null = null;
  myTurn:boolean=true;
  chosen:boolean=false;

  DiceRoll() {
    if(this.chosen)
    {

      this.prva = Math.floor(Math.random() * 6) + 1;
      this.druga = Math.floor(Math.random() * 6) + 1;
      this.chosen=false;
      this.showPickedCard=false;
    }
    
  }

  range(range:number): number[] {
    const rangeArray = [];
    for (let i = 0; i <= range-1; i++) {
      rangeArray.push(i);
    }
    return rangeArray;
  }

  onCardClick(value: number): void {
    if(!this.chosen)
    {

      this.selectedValue = value;
      console.log(this.selectedValue);
      this.showPickedCard = true;
    }
  }
  chooseCard():void{
    this.chosen=true;
  }
}
