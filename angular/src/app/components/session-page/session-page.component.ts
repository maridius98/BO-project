import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { SessionService } from '../../session.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ICard, IPlayer, ISession } from '../../interfaces';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.css'],
})
export class SessionPageComponent {
  firstDice: number = 1;
  secondDice: number = 1;
  firstOpponentDice: number = 1;
  secondOpponentDice: number = 1;
  actionPoints: number = 2;
  opponentHandNumber: number = 5;
  playerHandNumber: number = 8;
  monsterNumber: number = 3;
  turn: number = 1;
  monstersWon: number = 0;
  showPickedCard: boolean = false;
  showPickedMonster: boolean = false;
  selectedValue: number | null = null;
  myTurn: boolean = true;
  chosen: boolean = false;
  rotateDiv: boolean = false;
  //@ViewChild('diceImg', { static: true }) diceImg: ElementRef | undefined;
  opponent$: BehaviorSubject<IPlayer | null>;
  session$: BehaviorSubject<ISession | null>;
  player$: BehaviorSubject<IPlayer | null>;

  constructor(private sessionService: SessionService) {
    this.opponent$ = sessionService.opponent$;
    this.player$ = sessionService.player$;
    this.session$ = sessionService.session$;
  }

  NumberOfCards(array: ISession | null): number {
    if (array == null || array.player.hand == undefined) return 0;
    return array.player.hand.length;
  }

  NumberOfMonsterCards(broj: number | undefined): number {
    if (broj == undefined) return 0;
    return broj;
  }

  DiceRoll() {
    if (this.chosen) {
      this.rotateDiv = true;
      this.firstDice = Math.floor(Math.random() * 6) + 1;
      this.secondDice = Math.floor(Math.random() * 6) + 1;
      this.chosen = false;
      this.showPickedCard = false;
      this.showPickedMonster = false;
      this.rotateDiv = true;
      setTimeout(() => {
        this.rotateDiv = false;
      }, 1000);
    }
  }

  offPickedImage() {
    if (!this.chosen && this.showPickedCard) this.showPickedCard = false;
  }

  range(range: number): number[] {
    const rangeArray = [];
    for (let i = 0; i <= range - 1; i++) {
      rangeArray.push(i);
    }
    return rangeArray;
  }

  onCardHover(value: number): void {
    if (!this.chosen) {
      this.selectedValue = value;
      console.log(this.selectedValue);
      this.showPickedCard = true;
    }
  }

  onCardLeave() {
    if (!this.chosen) this.showPickedCard = false;
  }
  chooseCard(index: number) {
    if (!this.chosen) {
      this.showPickedCard = true;
      this.chosen = true;
    }
  }

  chooseMonster() {
    this.showPickedMonster = true;

    this.chosen = true;
  }
  onMonsterLeave() {
    if (!this.chosen) this.showPickedMonster = false;
  }
  onMonsterHover(value: number) {
    if (!this.chosen) {
      this.selectedValue = value;
      console.log(this.selectedValue);
      this.showPickedMonster = true;
    }
  }

  pickedCardDisplay(array: ISession | null, index: number | null): string {
    if (array == null || array.player.hand == undefined || index == null)
      return '';
    return array.player.hand[index].name;
  }

  pickedMonsterDisplay(array: ISession | null, index: number | null): string {
    if (
      array == null ||
      array.monsters == undefined ||
      index == null ||
      array.monsters[index] == undefined
    )
      return '';
    return array.monsters[index].name;
  }
}
