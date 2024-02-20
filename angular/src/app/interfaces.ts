export interface ISession { 
    _id?: string;
    code: string;
    turn: number;
    roll: number;
    discardPile: ICard[];
    deckSize: number;
    monsterDeckSize: number;
    monsters: ICard[];
    player: IPlayer;
    opponent: IOpponent;
}

export interface ICard  {
    _id?: string;
    name: string;
    description: string;
    imageURL: string;
    isPlayable: boolean;
}

export interface IPlayer {
    _id?: string;
    username: string;
    isHost: boolean;
    actionPoints: number;
    hand: ICard[];
    field: ICard[];
}

export interface IOpponent {
    username: string;
    actionPoints: number;
    handSize: number;
    field: ICard[];
}