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
  actionPoints: number = 2;
  monsterNumber: number = 3;
  showPickedCard: boolean = false;
  selectedPlayersCardIndex: number = -1;
  showPickedMonster: boolean = false;
  selectedValue: number | null = null;
  chosen: boolean = false;
  rotateDiv: boolean = false;
  opponent$: BehaviorSubject<IPlayer | null>;
  session$: BehaviorSubject<ISession | null>;
  player$: BehaviorSubject<IPlayer | null>;
  isInHand: boolean = false;
  boardCardId: number = -1;
  magicCard: ICard | null = null;

  constructor(private sessionService: SessionService) {
    this.opponent$ = sessionService.opponent$;
    this.player$ = sessionService.player$;
    this.session$ = sessionService.session$;
  }

  NumberOfCards(session: ISession | null): number {
    if (session == null || session.player.hand == undefined) return 0;
    return session.player.hand.length;
  }
  NumberOfMonsterCards(broj: number | undefined): number {
    if (!broj) return 0;
    return broj;
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
  onCardHover(value: number, inHand: boolean): void {
    if (!this.chosen) {
      this.selectedValue = value;
      this.isInHand = inHand;
      this.showPickedCard = true;
    }
  }
  onCardLeave() {
    if (!this.chosen) this.showPickedCard = false;
  }
  chooseCard(cards: ICard[] | undefined, id: number) {
    if (this.Turn(this.session$.getValue())) {
      if (cards != undefined) {
        this.sessionService.playCard({
          cardId: cards[id]._id,
          playerId: this.player$.getValue()?._id,
          target: { effectIndex: 0, target: 'self' },
          index: id,
        });
        if (cards[id].cardType == 'MagicCard') {
          //this.magicCard = cards[id];
          console.log('magic ccard');
          setTimeout(() => {
            this.sessionService.UseEffect({
              cardId: cards[id]._id,
              playerId: this.player$.getValue()?._id,
              target: { effectIndex: 0, target: 'self' },
              index: id,
            });
          }, 3000);
        }
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
      this.showPickedMonster = true;
    }
  }
  pickedCardDisplay(
    session: ISession | null | undefined,
    index: number | null | undefined,
    isHand: boolean
  ) {
    if (isHand) {
      if (session!.player.hand![index!] == undefined) return '';
      return session!.player.hand![index!].name;
    } else {
      if (session!.player.field![index!] == undefined) return '';
      return session!.player.field![index!]!.name;
    }
  }
  pickedMonsterDisplay(session: ISession | null, index: number | null) {
    if (!session!.monsters[index!]) return '';
    return session!.monsters[index!].name;
  }
  showBoardPlayerCard(cards: ICard[] | undefined, id: number): string {
    if (!cards![id].name) return '';
    return cards![id].name;
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

  getActionPoints(session: ISession | null) {
    let oppPts = session!.opponent!.actionPoints;
    let plPts = session!.player!.actionPoints;
    if (oppPts == 0) return plPts;
    return oppPts;
  }
  Turn(session: ISession | null) {
    let oppPts = session!.opponent!.actionPoints;
    //console.log('turn: ', oppPts);
    if (oppPts == 0) return 1;
    return 2;
  }

  rollForPickedCard(index: number) {
    if (this.player$.getValue() != null) {
      if (this.player$.getValue()!._id != undefined) {
        this.chosen = true;
        this.sessionService.Roll(this.player$.getValue()!._id!);
        this.boardCardId = index;
      }
    }
  }

  async DiceRoll() {
    if (this.chosen) {
      this.rotateDiv = true;
      if (this.session$.getValue()!.roll != undefined) {
        this.firstDice = Math.floor(this.session$.getValue()!.roll / 2);
        this.secondDice = this.session$.getValue()!.roll - this.firstDice;
      }
      this.chosen = false;
      this.showPickedCard = false;
      this.showPickedMonster = false;
      this.rotateDiv = true;
      setTimeout(() => {
        this.rotateDiv = false;

        this.sessionService.ResolveRoll({
          cardId:
            this.session$.getValue()?.player!.field![this.boardCardId]._id,
          playerId: this.player$.getValue()?._id,
          target: { effectIndex: 0, target: 'self' },
          index: this.boardCardId,
        });
        this.boardCardId = -1;
      }, 1000);
    }
  }
  ReturnDices(session: ISession | null): number[] {
    if (this.Turn(session) == 1 || session!.roll == 0) return [1, 1];
    return [
      Math.floor(session!.roll / 2),
      session!.roll - Math.floor(session!.roll / 2),
    ];
  }
}
