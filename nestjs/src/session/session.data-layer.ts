import { Injectable } from "@nestjs/common";
import { CardDataLayer } from "src/card/card.data-layer";
import { Session } from "./entities/session.entity";
import { Card } from "src/card/entities/card.entity";
import { MonsterCard } from "src/card/entities/monsterCard.entity";
import { CardExecData } from "src/card/card.data-layer";
import { HeroCard } from "src/card/entities/heroCard.entity";
import { PersonalSession } from "./entities/personalSession";

@Injectable()
export class SessionDataLayer {
    constructor(private readonly cardDataLayer: CardDataLayer){}

    generateSession(monsters: MonsterCard[], cards: Card[], session: Session): Session{
        session.deck = this.cardDataLayer.shuffle(cards);
        const shuffledMonsters = this.cardDataLayer.shuffle(monsters);
        session.monsters = shuffledMonsters.slice(0, 3);
        session.monsterDeck = shuffledMonsters.splice(0, 3);
        session.players.map(player => {
            if (player.isHost) {
                player.actionPoints = 3
            }
            else {
                player.actionPoints = 0
            }
        })
        return session;
    }

    
    getSplitSessions(session: Session): Map<string, PersonalSession> {
        const splitSessions = new Map<string, PersonalSession>();
        splitSessions.set(session.players[0]._id, new PersonalSession(session, 0));
        splitSessions.set(session.players[1]._id, new PersonalSession(session, 1));
        return splitSessions;
    }
    
}