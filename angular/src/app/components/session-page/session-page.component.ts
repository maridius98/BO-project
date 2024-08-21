import { Component } from '@angular/core';
import { SessionService } from '../../session.service';
import { BehaviorSubject } from 'rxjs';
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
  monsterNumber: number = 3;
  monstersWon: number = 0;
  showPickedCard: boolean = false;
  selectedPlayersCardIndex: number = -1;
  showPickedMonster: boolean = false;
  selectedValue: number | null = null;
  chosen: boolean = false;
  rotateDiv: boolean = false;
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
      //console.log(this.selectedValue);
      this.showPickedCard = true;
    }
  }
  onCardLeave() {
    if (!this.chosen) this.showPickedCard = false;
  }
  chooseCard(cards: ICard[] | undefined, id: number) {
    // if (!this.chosen) {
    //   this.showPickedCard = true;
    //   this.chosen = true;
    // }
    if (this.Turn(this.session$.getValue())) {
      if (cards != undefined) {
        //console.log('card:', cards[id]);
        this.sessionService.playCard({
          cardId: cards[id]._id,
          playerId: this.player$.getValue()?._id,
          target: [{ effectIndex: 0, target: 'self' }],
          index: id,
        });
        this.showPickedCard = false;
      }
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
      //console.log(this.selectedValue);
      this.showPickedMonster = true;
    }
  }
  pickedCardDisplay(
    array: ISession | null | undefined,
    index: number | null | undefined
  ): string {
    if (
      array == undefined ||
      array == null ||
      array.player == undefined ||
      array.player == null ||
      array.player.hand == undefined ||
      array.player.hand == null ||
      index == undefined ||
      index == null ||
      array.player.hand[index] == undefined ||
      array.player.hand[index] == null ||
      array.player.hand[index].name == undefined ||
      array.player.hand[index].name == null
    )
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
  showBoardPlayerCard(cards: ICard[] | undefined, id: number): string {
    if (
      cards == undefined ||
      cards[id] == undefined ||
      cards[id].name == undefined
    )
      return '';
    return cards[id].name;
  }
  canCardShow(cards: ICard[] | undefined, id: number): boolean {
    if (
      cards == undefined ||
      cards[id] == undefined ||
      cards[id].name == undefined
    )
      return false;
    return true;
  }

  getActionPoints(sesssion: ISession | null): number {
    if (
      sesssion == undefined ||
      sesssion == null ||
      sesssion.opponent == undefined ||
      sesssion.opponent == null ||
      sesssion.opponent.actionPoints == null ||
      sesssion.player == undefined ||
      sesssion.player == null ||
      sesssion.player.actionPoints == null
    )
      return 0;
    let oppPts = sesssion?.opponent?.actionPoints;
    let plPts = sesssion?.player.actionPoints;
    if (oppPts == 0) return plPts;
    return oppPts;
  }
  Turn(sesssion: ISession | null): number {
    if (
      sesssion == undefined ||
      sesssion == null ||
      sesssion.opponent == undefined ||
      sesssion.opponent == null ||
      sesssion.opponent.actionPoints == null
    )
      return 0;
    let oppPts = sesssion?.opponent?.actionPoints;
    if (oppPts == 0) return 1;
    return 2;
  }
}
