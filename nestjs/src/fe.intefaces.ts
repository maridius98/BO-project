export interface ISession extends Lobby { 
    turn: number;
    roll: number;
    discardPile: ICard[];
    deckSize: number;
    monsterDeckSize: number;
    monsters: ICard[];
}

export class Lobby {
    _id: string = undefined;
    code: string = undefined;
    player: IPlayer = undefined;
    opponent?: IOpponent = undefined;
}

export interface ICard  {
    _id?: string;
    name: string;
    description: string;
    imageURL: string;
    isPlayable: boolean;
    cardType: string;
}

export class IPlayer {
    _id: string = undefined;
    username: string = undefined;
    isHost: boolean = undefined;
    actionPoints?: number = 0;
    hand?: ICard[];
    field?: ICard[];
}

export interface IOpponent {
    username: string;
    actionPoints?: number;
    handSize?: number;
    field?: ICard[];
}