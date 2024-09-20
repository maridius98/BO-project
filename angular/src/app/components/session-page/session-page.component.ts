import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../session.service';
import { BehaviorSubject } from 'rxjs';
import { ICard, IPlayer, ISession, State } from '../../interfaces';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  styleUrls: ['./session-page.component.css'],
})
export class SessionPageComponent implements OnInit {
  isDialogVisible: boolean = false;
  playerDice: number[] = [1, 1];
  tmpDice: number[] = [1, 1];
  opponentDice: number[] = [1, 1];
  actionPoints: number = 2;
  monsterNumber: number = 3;
  showPickedCard: boolean = false;
  selectedPlayersCardIndex: number = -1;
  showPickedMonster: boolean = false;
  selectedValue: number | null = null;
  challengeCardId$: BehaviorSubject<string>;
  chosen: boolean = false;
  rotateDiv: boolean = false;
  rotateOppDiv: boolean = false;
  opponent$: BehaviorSubject<IPlayer | null>;
  session$: BehaviorSubject<ISession | null>;
  player$: BehaviorSubject<IPlayer | null>;
  playCard$: BehaviorSubject<ICard | null>;
  isInHand: boolean = false;
  boardCardId: number = -1;
  magicCard: boolean = false;
  prevState: State | null = null;
  monsterAttack: boolean[] = [false, false, false];
  alreadyAttacking: boolean = false;
  selectedCards: number[] = [];

  constructor(private sessionService: SessionService) {
    this.opponent$ = sessionService.opponent$;
    this.player$ = sessionService.player$;
    this.session$ = sessionService.session$;

    this.playCard$ = sessionService.playCard$;
    this.challengeCardId$ = sessionService.challengeCardId$;
  }

  TurnForSpecialCards(card: ICard | null): number {
    if (card?.cardType == 'ChallengeCard') {
      if (this.prevState == State.canChallenge) {
        return 1;
      }
      return 2;
    }
    let oppPts = this.opponent$.getValue()!.actionPoints;
    if (oppPts == 0) return 1;
    return 2;
  }

  ngOnInit() {
    this.playCard$.subscribe((data) => {
      if (data != null) {
        this.magicCard = true;
        setTimeout(() => {
          this.magicCard = false;
          this.prevState = null;
        }, 3000);
      }
    });
    this.session$.subscribe(async (data) => {
      if (data != null) {
        this.isDialogVisible = true;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.isDialogVisible = false;
        if (data.player.roll > 0 && data.opponent!.roll > 0) {
          this.rotateDiv = true;

          this.playerDice[0] = Math.floor(data.player.roll / 2);
          this.playerDice[1] = data.player.roll - this.playerDice[0];
          setTimeout(() => {
            this.rotateDiv = false;
          }, 1000);
        } else {
          if (data.player.roll > 0) {
            this.tmpDice[0] = Math.floor(data.player.roll / 2);
            this.tmpDice[1] = data.player.roll - this.tmpDice[0];
            if (this.alreadyAttacking) {
              this.rotateDiv = true;

              this.playerDice[0] = Math.floor(data.player.roll / 2);
              this.playerDice[1] = data.player.roll - this.playerDice[0];
              setTimeout(() => {
                this.rotateDiv = false;
              }, 1000);
            } else {
              this.DiceRoll();
            }
          }
        }
      }
    });
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

  async chooseCard(cards: ICard[] | undefined, id: number) {
    if (cards != undefined) {
      const card = cards[id];
      if (card.cardType == 'ChallengeCard') {
        if (this.player$.getValue()?.state == State.canChallenge) {
          this.prevState = State.canChallenge;
          await this.challenge(card, id);
        }
      } else if (this.Turn(this.session$.getValue())) {
        this.sessionService
          .playCard({
            cardId: card._id,
            playerId: this.player$.getValue()?._id,
            target: { effectIndex: 0, target: 'self' },
            index: id,
          })
          .then(async (flag: boolean) => {
            if (flag) {
              if (card.cardType === 'MagicCard')
                this.sessionService.UseEffect({
                  cardId: card._id,
                  playerId: this.player$.getValue()?._id,
                  target: { effectIndex: 0, target: 'self' },
                  index: id,
                });
            }
          });
        this.showPickedCard = false;
      }
    }
  }

  async challenge(card: ICard, id: number) {
    await this.sessionService.Challenge({
      cardId: card._id,
      playerId: this.player$.getValue()?._id,
      target: { effectIndex: 0, target: 'self' },
      index: id,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    this.sessionService.Roll(this.player$.getValue()!._id!, true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await this.sessionService.ResolveChallenge({
      cardId: this.challengeCardId$.getValue(),
      playerId: this.player$.getValue()?._id,
      target: { effectIndex: 0, target: 'self' },
      index: id,
    });
    this.showPickedCard = false;
  }

  chooseMonster(id: number) {
    if (
      this.alreadyAttacking == false &&
      this.player$.getValue()!.actionPoints! >= 2
    ) {
      this.alreadyAttacking = true;
      const filteredRequiredHeroes = this.session$
        .getValue()!
        .monsters[id].requiredHeroes.filter((hero) => hero !== 'wildcard');
      filteredRequiredHeroes.every((requiredHero) =>
        this.player$
          .getValue()!
          .field!.some((card) => card.class === requiredHero)
      );

      if (
        this.player$.getValue()!.field!.length >=
        this.session$.getValue()!.monsters[id].requiredHeroes.length
      ) {
        this.monsterAttack[id] = true;
      }
    }
  }

  async DontAttack(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.monsterAttack[id] = false;
    this.alreadyAttacking = false;
  }

  async Attack(id: number) {
    this.monsterAttack[id] = false;
    this.showPickedMonster = true;
    this.chosen = true;
    await this.sessionService.Roll(this.player$.getValue()!._id!, false);
    // setTimeout(() => {
    //   this.sessionService.AttackMonster({
    //     cardId: this.session$.getValue()!.monsters[id]._id!,
    //     playerId: this.player$.getValue()!._id!,
    //   });
    //   setTimeout(() => {
    //     this.showPickedMonster = false;
    //     this.chosen = false;
    //     this.alreadyAttacking = false;
    //   }, 1500);
    // }, 1000);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await this.sessionService.AttackMonster({
      cardId: this.session$.getValue()!.monsters[id]._id!,
      playerId: this.player$.getValue()!._id!,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.showPickedMonster = false;
    this.chosen = false;
    this.alreadyAttacking = false;
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
    if (oppPts == 0) return 1;
    return 2;
  }

  async rollForPickedCard(index: number) {
    if (this.player$.getValue()?.state == State.makeMove) {
      this.chosen = true;
      this.sessionService.Roll(this.player$.getValue()!._id!).then(() => {
        this.boardCardId = index;
      });
    }
    if (this.player$.getValue()?.state == State.selectSacrifice) {
      let length = this.player$.getValue()!.field!.length;
      if (this.selectedCards.length == 0) {
        this.selectedCards = [index];
        if (
          this.selectedCards.length == this.player$.getValue()?.cardSelectCount
        ) {
          console.log(this.player$.getValue()!.field![length - 1]);
          //if (this.player$.getValue()!.field![index].cardType === 'MageCard') {
          await this.sessionService.UseEffect({
            cardId: this.player$.getValue()!.field![length - 1]._id,
            playerId: this.player$.getValue()?._id,
            target: { effectIndex: 0, target: 'self' },
            index: index,
            cardList: this.selectedCards,
          });
          //}
          this.selectedCards = [];
        }
      } else {
        if (this.canSelectCard(index)) {
          this.selectedCards.push(index);
          if (
            this.selectedCards.length ==
            this.player$.getValue()?.cardSelectCount
          ) {
            console.log(this.player$.getValue()!.field![length - 1]);
            await this.sessionService.UseEffect({
              cardId: this.player$.getValue()!.field![length - 1]._id,
              playerId: this.player$.getValue()?._id,
              target: { effectIndex: 0, target: 'self' },
              index: index,
              cardList: this.selectedCards,
            });
            this.selectedCards = [];
          }
        }
      }
    }
  }
  canSelectCard(index: number) {
    return this.selectedCards!.findIndex((data) => data == index) == -1;
  }

  SelectForDiscard(id: number) {
    if (this.player$.getValue() != null) {
      if (this.player$.getValue()?.state == State.selectDestroy) {
      }
    }
  }

  DiceRoll() {
    if (this.chosen) {
      if (
        this.playerDice[0] == this.tmpDice[0] &&
        this.playerDice[1] == this.tmpDice[1]
      ) {
        this.rotateDiv = false;
      } else {
        this.rotateDiv = true;
        this.playerDice[0] = this.tmpDice[0];
        this.playerDice[1] = this.tmpDice[1];
      }

      this.chosen = false;
      this.showPickedCard = false;
      this.showPickedMonster = false;
      setTimeout(() => {
        this.rotateDiv = false;

        this.sessionService.ResolveRoll({
          cardId:
            this.session$.getValue()?.player!.field![this.boardCardId]._id!,
          playerId: this.player$.getValue()?._id,
          target: { effectIndex: 0, target: 'self' },
          index: this.boardCardId,
        });
        this.boardCardId = -1;
      }, 1000);
    }
  }

  async DrawCard() {
    await this.sessionService.DrawCard(this.player$.getValue()!._id);
  }

  DialogText(player: IPlayer | null) {
    if (player != null) {
      let dialog = '';
      let n = player.cardSelectCount;
      switch (player.state) {
        case State.selectDiscard:
          if (n == 1) dialog = `Select ${n} card to discard.`;
          else dialog = `Select ${n} cards to discard.`;
          break;
        case State.selectSacrifice:
          if (n == 1) dialog = `Select ${n} card from the field to sacrifice.`;
          else dialog = `Select ${n} cards from the field to sacrifice.`;
          break;
        case State.selectDestroy:
          if (n == 1) dialog = `Select ${n} card from enemy field to destroy.`;
          else dialog = `Select ${n} cards from enemy field to destroy.`;
          break;
        case State.wait:
          dialog = `Wait for enemy to make a move!`;
          break;
        case State.canChallenge:
          dialog = `Challenge enemy card?`;
          break;
        case State.makeMove:
          dialog = `Make a move!`;
          break;
      }
      if (dialog != '') return dialog;
    }
    this.isDialogVisible = false;
    return '';
  }

  ReturnDices(session: ISession | null): number[] {
    if (session!.opponent!.roll == 0) {
      return [this.opponentDice[0], this.opponentDice[1]];
    }
    this.rotateOppDiv = true;
    setTimeout(() => {
      this.rotateOppDiv = false;
    }, 1000);
    this.opponentDice[0] = Math.floor(session!.opponent!.roll / 2);
    this.opponentDice[1] = session!.opponent!.roll - this.opponentDice[0];
    return [this.opponentDice[0], this.opponentDice[1]];
  }
}
