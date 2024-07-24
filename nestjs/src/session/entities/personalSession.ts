import { Player } from 'src/player/entities/player.entity';
import { Session } from './session.entity';
import { Card } from 'src/card/entities/card.entity';
import { MonsterCard } from 'src/card/entities/monsterCard.entity';
import { State } from 'src/utility';

export class PersonalSession {
  constructor(session: Session, index: number) {
    this._id = session._id;
    this.code = session.code;
    this.turn = session.turn;
    this.roll = session.roll;
    this.state = session.state;
    this.deckSize = session.deck.length;
    this.monsterDeckSize = session.monsterDeck.length;
    this.player = new RevealedPlayer(session.players[index]);
    this.opponent = new Opponent(session.players[Math.abs(index - 1)]);
    this.monsters = session.monsters.map((m) => new IMonster(m as MonsterCard));
  }

  _id?: string;
  code: string;
  turn: number;
  roll: number;
  state: State;
  discardPile: ICard[];
  deckSize: number;
  monsterDeckSize: number;
  monsters: IMonster[];
  player: IPlayer;
  opponent: Opponent;
}

export class ICard {
  constructor(card: Card) {
    this._id = card._id;
    this.name = card.name;
    this.description = card.description;
    this.imageURL = card.imageURL;
    this.isPlayable = card.isPlayable;
    this.cardType = card.cardType;
  }

  _id?: string;
  name: string;
  description: string;
  imageURL: string;
  isPlayable: boolean;
  cardType: string;
}

export class IMonster extends ICard {
  constructor(monsterCard: MonsterCard) {
    super(monsterCard);
    this.defeatRoll = monsterCard.defeatRoll;
    this.victoryRoll = monsterCard.victoryRoll;
  }

  defeatRoll: number;
  victoryRoll: number;
}

class IPlayer {
  constructor(player: Player) {
    this.username = player.username;
    this.actionPoints = player.actionPoints;
    this.field = player.field.map((card) => new ICard(card));
  }

  username: string;
  actionPoints: number;
  field: ICard[];
}

export class RevealedPlayer extends IPlayer {
  constructor(player: Player) {
    super(player);
    this._id = player._id;
    this.isHost = player.isHost;
    this.hand = player.hand.map((card) => new ICard(card));
  }
  _id?: string;
  username: string;
  isHost: boolean;
  actionPoints: number;
  hand: ICard[];
  field: ICard[];
}

export class Opponent extends IPlayer {
  constructor(player: Player) {
    super(player);
    this.handSize = player.hand.length;
  }

  username: string;
  actionPoints: number;
  handSize: number;
  field: ICard[];
}
