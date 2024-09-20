import { Injectable } from '@nestjs/common';
import { Card } from './entities/card.entity';
import { Player } from 'src/player/entities/player.entity';
import { Session } from 'src/session/entities/session.entity';
import { HeroCard } from './entities/heroCard.entity';
import { getMutablePlayer, getOpposingPlayer, State } from 'src/utility';
import { MonsterCard } from './entities/monsterCard.entity';

export interface CardExecData {
  card: Card;
  player: Player;
  session: Session;
  index?: number;
  cardList?: number[];
}

interface Command {
  state: State;
  target: Player;
  exec(value: number | number[], target: Player, session: Session): Session;
}

class Target {
  target: Player;
  constructor(target: Player) {
    this.target = target;
  }
}

class Draw extends Target implements Command {
  state = State.skip;
  exec(value: number, target: Player, session: Session) {
    const player = getMutablePlayer(target, session);
    for (let i = 0; i < value; i++) {
      player.hand.push(session.deck.pop());
    }
    return session;
  }
}

class Discard extends Target implements Command {
  state = State.selectDiscard;
  exec(value: number[], target: Player, session: Session) {
    const player = getMutablePlayer(target, session);
    for (const index in value) {
      session.discardPile.push(player.hand[index]);
    }
    player.hand = player.hand.filter((_, index) => !value.includes(index));
    return session;
  }
}

class Sacrifice extends Target implements Command {
  state = State.selectSacrifice;
  exec(value: number[], target: Player, session: Session) {
    const player = getMutablePlayer(target, session);
    for (const index in value) {
      session.discardPile.push(player.field[index]);
    }
    player.field = player.field.filter((_, index) => !value.includes(index));
    return target.session;
  }
}

class Destroy extends Target implements Command {
  state = State.selectDestroy;
  exec(value: number[], target: Player, session: Session) {
    for (const index in value) {
      target.session.discardPile.push(target.field[index]);
    }
    target.field.filter((_, index) => !value.includes(index));
    return target.session;
  }
}

@Injectable()
export class CommandFactory {
  build(commandName: string, target: Player): Command {
    switch (commandName) {
      case 'Draw':
        return new Draw(target);
      case 'Discard':
        return new Discard(target);
      case 'Sacrifice':
        return new Sacrifice(target);
      case 'Destroy':
        return new Destroy(target);
    }
  }
}

@Injectable()
export class CardDataLayer {
  constructor(private commandFactory: CommandFactory) {}
  drawCard(player: Player, session: Session) {
    if (player.actionPoints == 0) {
      return session;
    }
    const command = this.commandFactory.build('Draw', player);
    const updatedSession = command.exec(1, player, session);
    const mutablePlayer = getMutablePlayer(player, updatedSession);
    mutablePlayer.actionPoints -= 1;
    this.evaluateTurnSwap(mutablePlayer, session);
    return updatedSession;
  }

  shuffle(cards: Card[], length = cards.length) {
    const shuffledCards = [...cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    if (length != cards.length) {
      shuffledCards.splice(length);
    }
    return shuffledCards;
  }

  playEffect(cardExecData: CardExecData) {
    if (cardExecData.card instanceof HeroCard) {
      if (cardExecData.player.roll < cardExecData.card.victoryRoll) {
        cardExecData.player.state = State.makeMove;
        return cardExecData.session;
      }
    }
    const effect = cardExecData.card.effects[cardExecData.index];
    const [commandName, value, target] = effect.split(';');
    let player: Player;
    if (target === 'self') {
      player = getMutablePlayer(cardExecData.player, cardExecData.session);
    } else {
      player = getOpposingPlayer(cardExecData.player, cardExecData.session);
    }
    const command = this.commandFactory.build(commandName, player);
    if (cardExecData.cardList) {
      if (cardExecData.cardList.length > Number(value)) {
        throw new Error('Unplayable');
      }
    }
    command.exec(cardExecData.cardList || Number(value), player, cardExecData.session);
    cardExecData.index++;
    this.setNextState(cardExecData);
  }

  evaluateTurnSwap(player: Player, session: Session) {
    const mutablePlayer = getMutablePlayer(player, session);
    if (player.actionPoints >= 1) {
      mutablePlayer.state = State.makeMove;
    } else {
      mutablePlayer.state = State.wait;
      const opposingPlayer = getOpposingPlayer(player, session);
      opposingPlayer.state = State.makeMove;
      opposingPlayer.actionPoints = 3;
    }
  }

  setNextState(cardExecData: CardExecData) {
    const effect = cardExecData.card.effects[cardExecData.index];
    if (!effect) {
      this.evaluateTurnSwap(cardExecData.player, cardExecData.session);
      return;
    }
    const [commandName, value, _] = effect.split(';');
    const command = this.commandFactory.build(commandName, cardExecData.player);
    const player = getMutablePlayer(cardExecData.player, cardExecData.session);
    player.state = command.state;
    player.cardSelectCount = parseInt(value);
    cardExecData.index += 1;
  }

  playCard(cardExecData: CardExecData) {
    const player = getMutablePlayer(cardExecData.player, cardExecData.session);
    const opponent = getOpposingPlayer(cardExecData.player, cardExecData.session);
    if (cardExecData.card.cardType === 'HeroCard') {
      player.field.push(cardExecData.card as HeroCard);
    } else {
      cardExecData.session.discardPile.push(cardExecData.card);
    }
    if (
      !(
        cardExecData.card.cardType == 'ChallengeCard' ||
        cardExecData.card.cardType == 'ModifierCard'
      )
    ) {
      player.state = State.wait;
      opponent.state = State.canChallenge;
      player.actionPoints--;
    } else if (cardExecData.card.cardType == 'ChallengeCard') {
      player.state = State.roll;
      opponent.state = State.roll;
    }

    player.hand.splice(cardExecData.index, 1);
    return cardExecData.session;
  }

  isEveryRequiredHeroPresent(playerField: HeroCard[], requiredHeroes: string[]): boolean {
    const filteredRequiredHeroes = requiredHeroes.filter((hero) => hero !== 'wildcard');

    return (
      filteredRequiredHeroes.every((requiredHero) =>
        playerField.some((card) => card.class === requiredHero),
      ) && playerField.length >= requiredHeroes.length
    );
  }

  attackMonster(cardData: CardExecData) {
    if (cardData.player.actionPoints < 2) {
      return cardData.session;
    }
    const monster = cardData.card as MonsterCard;
    if (!this.isEveryRequiredHeroPresent(cardData.player.field, monster.requiredHeroes)) {
      return cardData.session;
    }

    if (cardData.player.roll >= monster.victoryRoll) {
      this.defeatMonster(cardData.player, cardData.session, monster);
    } else if (cardData.player.roll <= monster.defeatRoll) {
      this.loseAgainstMonster(cardData.player, cardData.session, monster);
    }
    const player = getMutablePlayer(cardData.player, cardData.session);
    player.actionPoints -= 2;
    player.roll = 0;
    this.evaluateTurnSwap(player, cardData.session);
    return cardData.session;
  }

  defeatMonster(player: Player, session: Session, monster: MonsterCard) {
    const mutablePlayer = getMutablePlayer(player, session);
    mutablePlayer.defeatedMonsters += 1;
    session.monsters = session.monsters.filter((m) => m._id.toString() != monster._id);
    session.monsters.push(session.monsterDeck.pop());
  }

  loseAgainstMonster(player: Player, session: Session, monster: MonsterCard) {}
}
