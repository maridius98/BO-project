export interface ISession extends Lobby {
  turn: number;
  discardPile: ICard[];
  deckSize: number;
  monsterDeckSize: number;
  monsters: ICard[];
}

export enum State {
  selectDiscard,
  selectDestroy,
  selectSacrifice,
  makeMove,
  resolveRoll,
  roll,
  skip,
  wait,
  canChallenge,
}

export interface Lobby {
  _id?: string;
  code: string;
  player: IPlayer;
  opponent?: IOpponent;
}

export interface ICard {
  _id?: string;
  name: string;
  description: string;
  imageURL: string;
  isPlayable: boolean;
  cardType: string;
}

export interface IPlayer {
  _id?: string;
  username: string;
  isHost: boolean;
  actionPoints?: number;
  roll: number;
  hand?: ICard[];
  field?: ICard[];
}

export interface IOpponent {
  username: string;
  actionPoints?: number;
  handSize?: number;
  field?: ICard[];
}
