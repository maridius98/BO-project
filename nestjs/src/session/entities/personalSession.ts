import { Player } from "src/player/entities/player.entity";
import { Session } from "./session.entity";
import { Card } from "src/card/entities/card.entity";
import { MonsterCard } from "src/card/entities/monsterCard.entity";

export class PersonalSession { 
    constructor (session: Session, index: number) {
        this._id = session._id;
        this.code = session.code;
        this.turn = session.turn;
        this.roll = session.roll;
        this.deckSize = session.deck.length;
        this.monsterDeckSize = session.monsterDeck.length;
        this.player = new IPlayer(session.players[index]);
        this.opponent = new IOpponent(session.players[Math.abs(index - 1)]);
        this.monsters = session.monsters.map(m => 
            new IMonster(m as MonsterCard)
        );
    }
    _id?: string;
    code: string;
    turn: number;
    roll: number;
    discardPile: ICard[];
    deckSize: number;
    monsterDeckSize: number;
    monsters: IMonster[];
    player: IPlayer;
    opponent: IOpponent;
}

export class ICard  {
    constructor (card: Card) {
        this._id = card._id;
        this.name = card.name;
        this.description = card.description;
        this.imageURL = card.imageURL;
        this.isPlayable = card.isPlayable;
    }
    _id?: string;
    name: string;
    description: string;
    imageURL: string;
    isPlayable: boolean;
}

export class IMonster extends ICard {
    constructor (monsterCard: MonsterCard) {
        super(monsterCard);
        this.defeatRoll = monsterCard.defeatRoll;
        this.victoryRoll = monsterCard.victoryRoll;
    }
    defeatRoll: number;
    victoryRoll: number;
}

export class IPlayer {
    constructor(player: Player) {

    }
    _id?: string;
    username: string;
    isHost: boolean;
    actionPoints: number;
    hand: ICard[];
    field: ICard[];
}

export class IOpponent {
    constructor(player: Player) {

    }
    username: string;
    actionPoints: number;
    handSize: number;
    field: ICard[];
}