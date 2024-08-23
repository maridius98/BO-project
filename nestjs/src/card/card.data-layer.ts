import { Injectable } from '@nestjs/common';
import { Card } from './entities/card.entity';
import { Player } from 'src/player/entities/player.entity';
import { Session } from 'src/session/entities/session.entity';
import { HeroCard } from './entities/heroCard.entity';
import { State } from 'src/utility';

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
  exec(value: number | number[], target: Player): Session;
}

class Target {
  target: Player;
  constructor(target: Player) {
    this.target = target;
  }
}

class Draw extends Target implements Command {
  state = State.makeMove;
  exec(value: number, target: Player) {
    for (let i = 0; i < value; i++) {
      target.hand.push(target.session.deck.pop());
    }
    return target.session;
  }
}

class Discard extends Target implements Command {
  state = State.selectDiscard;
  exec(value: number[], target: Player) {
    for (const index in value) {
      target.session.discardPile.push(target.hand[index]);
    }
    target.hand.filter((_, index) => !value.includes(index));
    return target.session;
  }
}

class Sacrifice extends Target implements Command {
  state = State.selectSacrifice;
  exec(value: number[], target: Player) {
    for (const index in value) {
      target.session.discardPile.push(target.field[index]);
    }
    target.field.filter((_, index) => !value.includes(index));
    return target.session;
  }
}

class Destroy extends Target implements Command {
  state = State.selectDestroy;
  exec(value: number[], target: Player) {
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
      if (cardExecData.session.roll < cardExecData.card.victoryRoll)
        cardExecData.session.state = State.makeMove;
      return cardExecData.session;
    }
    const effect = cardExecData.card.effects[cardExecData.index];
    const [commandName, target, value] = effect.split(';');
    let player: Player;
    if (target === 'self') {
      player = cardExecData.session.players.find((p) => {
        p === player;
      });
    } else {
      player = cardExecData.session.players.find((p) => {
        p != player;
      });
    }
    const command = this.commandFactory.build(commandName, player);
    if (cardExecData.targets) {
      if (cardExecData.targets.length > Number(value)) {
        throw new Error('Unplayable');
      }
    }
    command.exec(cardExecData.targets || Number(value), player);
    if (cardExecData.index + 1 < cardExecData.card.effects.length) {
      cardExecData.session.state = this.setNextState(cardExecData, cardExecData.index + 1);
    } else {
      if (cardExecData.player.actionPoints > 1) {
        cardExecData.session.state = State.makeMove;
        cardExecData.player.actionPoints--;
      } else {
        cardExecData.session.state = State.skip;
      }
    }
    return cardExecData.session;
  }

  startEffect(cardExecData: CardExecData) {
    cardExecData.session.state = this.setNextState(cardExecData, 0);
    return cardExecData.session;
  }

  setNextState(cardExecData: CardExecData, index: number) {
    const effect = cardExecData.card.effects[index];
    console.log('Setting effect: ' + effect);
    const state = this.commandFactory.build(effect.split(';')[0], cardExecData.player).state;
    console.log(state);
    return state;
  }

  playCard(cardExecData: CardExecData) {
    console.log('In card datalayer play');
    const player = cardExecData.session.players.find((player) => {
      return player._id.toString() === cardExecData.player._id.toString();
    });
    if (cardExecData.card.cardType == 'HeroCard') {
      player.field.push(cardExecData.card);
    } else {
      cardExecData.session.discardPile.push(cardExecData.card);
    }
    player.hand.splice(cardExecData.index, 1);
    player.actionPoints--;
    return cardExecData.session;
  }
}
