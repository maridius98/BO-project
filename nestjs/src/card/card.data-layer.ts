import { Injectable } from '@nestjs/common';
import { Card } from './entities/card.entity';
import { Player } from 'src/player/entities/player.entity';
import { Session } from 'src/session/entities/session.entity';
import { HeroCard } from './entities/heroCard.entity';
import { getMutablePlayer, getOpposingPlayer, State } from 'src/utility';

export interface CardExecData {
  card: Card;
  player: Player;
  session: Session;
  index: number;
  targets?: number[];
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
    player.hand.filter((_, index) => !value.includes(index));
    return session;
  }
}

class Sacrifice extends Target implements Command {
  state = State.selectSacrifice;
  exec(value: number[], target: Player, session: Session) {
    for (const index in value) {
      target.session.discardPile.push(target.field[index]);
    }
    target.field.filter((_, index) => !value.includes(index));
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
    if (cardExecData.targets) {
      if (cardExecData.targets.length > Number(value)) {
        throw new Error('Unplayable');
      }
    }
    command.exec(cardExecData.targets || Number(value), player, cardExecData.session);
    if (cardExecData.index + 1 < cardExecData.card.effects.length) {
      player.state = this.setNextState(cardExecData, cardExecData.index + 1);
    } else {
      this.evaluateTurnSwap(player, cardExecData.session);
    }
    return cardExecData.session;
  }

  evaluateTurnSwap(player: Player, session: Session) {
    if (player.actionPoints > 1) {
      player.state = State.makeMove;
    } else {
      player.state = State.wait;
      const opposingPlayer = getOpposingPlayer(player, session);
      opposingPlayer.state = State.makeMove;
      opposingPlayer.actionPoints = 3;
    }
  }

  startEffect(cardExecData: CardExecData) {
    const player = getMutablePlayer(cardExecData.player, cardExecData.session);
    player.state = this.setNextState(cardExecData, 0);
    return cardExecData.session;
  }

  setNextState(cardExecData: CardExecData, index: number) {
    const effect = cardExecData.card.effects[index];
    const state = this.commandFactory.build(effect.split(';')[0], cardExecData.player).state;
    return state;
  }

  playCard(cardExecData: CardExecData) {
    const player = getMutablePlayer(cardExecData.player, cardExecData.session);
    const opponent = getOpposingPlayer(cardExecData.player, cardExecData.session);
    if (cardExecData.card.cardType == 'HeroCard') {
      player.field.push(cardExecData.card);
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
}
