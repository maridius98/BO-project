import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SessionService } from '../../session.service';
import { BehaviorSubject } from 'rxjs';
import { ICard, IPlayer, ISession, State } from '../../interfaces';

@Component({
  selector: 'app-session-page',
  standalone: false,
  templateUrl: './session-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./session-page.component.css'],
})
export class SessionPageComponent implements OnInit {
  isDialogVisible: boolean = false;
  playerDice: number[] = [1, 1];
  tmpDice: number[] = [1, 1];
  opponentDice: number[] = [1, 1];
  actionPoints: number = -1;
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
  magicCard$ = new BehaviorSubject<string>('');
  prevState: State | null = null;
  monsterAttack: boolean[] = [false, false, false];
  alreadyAttacking: boolean = false;
  selectedCards: number[] = [];
  selectedDiscardCards: number[] = [];
  selectedDestroyCards: number[] = [];
  inUseCardId: string = '';
  inUseCardIndex: number = -1;
  playedCardList: string[] = [];
  wasPrevChallenge: boolean = false;
  activatedCard: number = -1;

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
    this.playCard$.subscribe(async (data) => {
      if (data != null) {
        if (data.cardType == 'ChallengeCard') {
          this.wasPrevChallenge = true;
        }
        this.magicCard$.next(data._id!);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (this.magicCard$.getValue() == data._id!) {
          this.magicCard$.next('');
        }
        this.prevState = null;
      }
    });
    this.session$.subscribe(async (data) => {
      if (data != null) {
        // if (
        //   data.player.actionPoints == 0 &&
        //   this.player$.getValue()!.state == State.makeMove
        // ) {
        //   this.sessionService.evaluateTurnSwap(this.player$.getValue()!._id!);
        // }
        if (
          data.player.actionPoints == 3 &&
          (this.actionPoints == 0 || this.actionPoints == -1)
        ) {
          this.playedCardList = [];
        }
        this.actionPoints = data.player.actionPoints!;

        //await new Promise((resolve) => setTimeout(resolve, 1000));

        if (this.wasPrevChallenge) {
          this.wasPrevChallenge = false;
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
              if (this.boardCardId > -1) this.DiceRoll();
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
    //if (!this.chosen) {
    this.selectedValue = value;
    this.isInHand = inHand;
    this.showPickedCard = true;
    //}
  }

  onCardLeave() {
    if (!this.chosen) this.showPickedCard = false;
  }

  getSoecialCardUrl(url: string) {
    return `url(${url})`;
  }

  getUrl(session: ISession | null, i: number) {
    if (session) {
      return `url(${session!.player.hand![i].imageURL})`;
    }
    return '';
  }

  async chooseCard(cards: ICard[] | undefined, id: number, roll: boolean) {
    console.log('here');

    if (cards != undefined) {
      const card = cards[id];
      if (this.player$.getValue()?.state == State.selectDiscard) {
        let length =
          this.player$.getValue()!.hand!.length <
          this.player$.getValue()!.cardSelectCount
            ? this.player$.getValue()!.hand!.length
            : this.player$.getValue()!.cardSelectCount;
        if (this.selectedDiscardCards.length == 0) {
          this.selectedDiscardCards = [id];
          if (this.selectedDiscardCards.length == length) {
            this.Discard();
          }
        } else {
          if (this.canSelectDiscardCard(id)) {
            this.selectedDiscardCards.push(id);
            if (this.selectedDiscardCards.length == length) {
              this.Discard();
            }
          }
        }
      } else if (card.cardType == 'ChallengeCard') {
        if (this.player$.getValue()?.state == State.canChallenge) {
          this.prevState = State.canChallenge;
          await this.challenge(card, id);
        }
      } else if (
        this.Turn(this.session$.getValue()) &&
        this.player$.getValue()?.state == State.makeMove
      ) {
        this.inUseCardIndex = 0;
        this.sessionService
          .playCard({
            cardId: card._id,
            playerId: this.player$.getValue()?._id,
            target: { effectIndex: 0, target: 'self' },
            index: id,
          })
          .then(async (flag: boolean) => {
            if (!flag) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            if (flag || this.sessionService.challengeCardId$.getValue()) {
              if (roll == true) {
                await this.rollForPickedCard(
                  this.player$.getValue()!.field!.length - 1
                );
                this.boardCardId = this.player$.getValue()!.field!.length - 1;
                this.activatedCard = -1;
              } else if (card.cardType === 'MagicCard')
                await this.sessionService.UseEffect({
                  cardId: card._id,
                  playerId: this.player$.getValue()?._id,
                  target: { effectIndex: 0, target: 'self' },
                  index: id,
                });

              this.activatedCard = -1;
            }
          });
        await this.sessionService.evaluateTurnSwap(
          this.player$.getValue()!._id!
        );
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
      return `url(${session!.player.hand![index!].imageURL}`;
    } else {
      if (session!.player.field![index!] == undefined) return '';
      return `url(${session!.player.field![index!]!.imageURL}`;
    }
  }

  pickedMonsterDisplay(session: ISession | null, index: number | null) {
    if (!session!.monsters[index!]) return '';
    return `url(${session!.monsters[index!].imageURL})`;
  }

  showBoardPlayerCard(cards: ICard[] | undefined, id: number): string {
    if (!cards![id].name) return '';
    return `url(${cards![id].imageURL})`;
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
    this.showPickedCard = false;
    if (this.player$.getValue()?.state == State.makeMove) {
      if (
        this.playedCardList.findIndex(
          (data) => data == this.player$.getValue()!.field![index]!._id!
        ) == -1
      ) {
        this.chosen = true;
        this.inUseCardId = this.player$.getValue()!.field![index]!._id!;
        this.inUseCardIndex = 0;
        await this.sessionService
          .Roll(this.player$.getValue()!._id!)
          .then(() => {
            this.boardCardId = index;
          });
        this.playedCardList.push(this.inUseCardId);
      }
    }
    if (this.player$.getValue()?.state == State.selectSacrifice) {
      let length =
        this.player$.getValue()!.field!.length <
        this.player$.getValue()!.cardSelectCount
          ? this.player$.getValue()!.field!.length
          : this.player$.getValue()!.cardSelectCount;
      if (this.selectedCards.length == 0) {
        this.selectedCards = [index];
        if (this.selectedCards.length == length) {
          this.Sacrifice();
        }
      } else {
        if (this.canSelectCard(index)) {
          this.selectedCards.push(index);
          if (this.selectedCards.length == length) {
            this.Sacrifice();
          }
        }
      }
    }
    this.activatedCard = -1;
  }
  canSelectCard(index: number) {
    return this.selectedCards!.findIndex((data) => data == index) == -1;
  }

  canSelectDiscardCard(index: number) {
    return this.selectedDiscardCards!.findIndex((data) => data == index) == -1;
  }

  canSelectDesroyCard(index: number) {
    return this.selectedDestroyCards!.findIndex((data) => data == index) == -1;
  }

  async SelectForDestroy(index: number) {
    if (this.player$.getValue() != null) {
      if (this.player$.getValue()?.state == State.selectDestroy) {
        let length =
          this.opponent$.getValue()!.field!.length <
          this.player$.getValue()!.cardSelectCount
            ? this.opponent$.getValue()!.field!.length
            : this.player$.getValue()!.cardSelectCount;

        if (this.selectedDestroyCards.length == 0) {
          this.selectedDestroyCards = [index];
          if (this.selectedDestroyCards.length == length) {
            this.Destroy();
          }
        } else {
          if (this.canSelectDesroyCard(index)) {
            this.selectedDestroyCards.push(index);
            if (this.selectedDestroyCards.length == length) {
              this.Destroy();
            }
          }
        }
      }
    }
  }

  async DiceRoll() {
    console.log(this.chosen);
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
      console.log(this.rotateDiv);
      this.chosen = false;
      this.showPickedCard = false;
      this.showPickedMonster = false;
      const card = this.session$.getValue()!.player!.field![this.boardCardId];
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.rotateDiv = false;
      console.log(this.rotateDiv);
      const wasDraw = await this.sessionService.ResolveRoll({
        cardId: card._id,
        playerId: this.player$.getValue()?._id,
        target: { effectIndex: 0, target: 'self' },
        index: this.boardCardId,
      });
      if (wasDraw) {
        console.log('draw');
        this.inUseCardIndex++;
      }
      this.boardCardId = -1;
    }

    // this.chosen = false;
    // this.showPickedCard = false;
    // this.showPickedMonster = false;
    // setTimeout(() => {
    //   this.rotateDiv = false;
    //   console.log(this.boardCardId);
    //   this.sessionService.ResolveRoll({
    //     cardId: this.session$.getValue()!.player!.field![this.boardCardId]._id!,
    //     playerId: this.player$.getValue()!._id,
    //     target: { effectIndex: 0, target: 'self' },
    //     index: this.boardCardId,
    //   });
    //   setTimeout(() => (this.boardCardId = -1), 100);
    // }, 1000);

    //}
  }

  DrawCard() {
    if (this.player$.getValue()?.state == State.makeMove) {
      this.activatedCard = -1;

      this.sessionService.DrawCard(this.player$.getValue()!._id);
    }
  }

  DialogText(player: IPlayer | null) {
    if (player != null) {
      let dialog = '';
      let n = this.player$.getValue()!.cardSelectCount;
      let sacrifice =
        this.player$.getValue()!.field!.length <
        this.player$.getValue()!.cardSelectCount
          ? this.player$.getValue()!.field!.length
          : this.player$.getValue()!.cardSelectCount;
      let discard =
        this.player$.getValue()!.hand!.length <
        this.player$.getValue()!.cardSelectCount
          ? this.player$.getValue()!.hand!.length
          : this.player$.getValue()!.cardSelectCount;
      let destroy =
        this.opponent$.getValue()!.field!.length <
        this.player$.getValue()!.cardSelectCount
          ? this.opponent$.getValue()!.field!.length
          : this.player$.getValue()!.cardSelectCount;
      switch (player.state) {
        case State.selectDiscard:
          if (discard == 0) {
            this.selectedDiscardCards = [];
            this.Discard();
          } else if (discard == 1)
            dialog = `Select ${discard} card to discard.`;
          else dialog = `Select ${discard} cards to discard.`;
          break;
        case State.selectSacrifice:
          if (sacrifice == 0) {
            this.selectedCards = [];
            this.Sacrifice();
          } else if (sacrifice == 1)
            dialog = `Select ${sacrifice} card from the field to sacrifice.`;
          else
            dialog = `Select ${sacrifice} cards from the field to sacrifice.`;
          break;
        case State.selectDestroy:
          if (destroy == 0) {
            this.selectedDestroyCards = [];
            this.Destroy();
          } else if (destroy == 1)
            dialog = `Select ${destroy} card from enemy field to destroy.`;
          else dialog = `Select ${destroy} cards from enemy field to destroy.`;
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
    return '';
  }

  ReturnDices(session: ISession | null): number[] {
    if (session!.opponent!.roll == 0) {
      return [this.opponentDice[0], this.opponentDice[1]];
    }
    this.opponentDice[0] = Math.floor(session!.opponent!.roll / 2);
    this.opponentDice[1] = session!.opponent!.roll - this.opponentDice[0];
    this.rotateOppDiv = true;
    setTimeout(() => {
      this.rotateOppDiv = false;
    }, 1000);
    return [this.opponentDice[0], this.opponentDice[1]];
  }

  openPrompt(hand: ICard[] | undefined, id: number) {
    if (hand) {
      if (
        hand[id].cardType == 'HeroCard' &&
        this.player$.getValue()?.state == State.makeMove
      ) {
        this.activatedCard = id;
      } else {
        this.chooseCard(hand, id, false);
        this.activatedCard = -1;
      }
    }
  }

  activateDiv(sesija: ISession | null, i: number): boolean {
    if (this.activatedCard == i) return true;
    return false;
  }

  ChooseAndRoll(hand: ICard[] | undefined, id: number) {
    // this.activatedCard = -1;
    this.chooseCard(hand, id, true);
  }

  async useEffect(cardList: number[]) {
    const nextIndex = await this.sessionService.UseEffect({
      cardId: this.inUseCardId,
      playerId: this.player$.getValue()?._id,
      target: { effectIndex: this.inUseCardIndex, target: 'self' },
      cardList,
    });
    if (nextIndex == -1) {
      this.inUseCardIndex = 0;
    } else {
      this.inUseCardIndex = nextIndex;
    }
  }

  async Sacrifice() {
    await this.useEffect(this.selectedCards);
    this.selectedCards = [];
  }

  async Destroy() {
    await this.useEffect(this.selectedDestroyCards);
    this.selectedDestroyCards = [];
  }

  async Discard() {
    console.log('discard');
    await this.useEffect(this.selectedDiscardCards);
    this.selectedDiscardCards = [];
  }
}
