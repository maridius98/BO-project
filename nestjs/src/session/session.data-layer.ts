import { Injectable } from '@nestjs/common';
import { CardDataLayer } from 'src/card/card.data-layer';
import { Session } from './entities/session.entity';
import { Card } from 'src/card/entities/card.entity';
import { MonsterCard } from 'src/card/entities/monsterCard.entity';
import { CardExecData } from 'src/card/card.data-layer';
import { HeroCard } from 'src/card/entities/heroCard.entity';
import { PersonalSession } from './entities/personalSession';
import { State } from 'src/utility';
import { Player } from 'src/player/entities/player.entity';

@Injectable()
export class SessionDataLayer {
  constructor(private readonly cardDataLayer: CardDataLayer) {}

  generateSession(monsters: MonsterCard[], cards: Card[], session: Session): Session {
    session.deck = this.cardDataLayer.shuffle(cards);
    session.monsterDeck = this.cardDataLayer.shuffle(monsters);
    session.monsters = session.monsterDeck.splice(0, 3);
    session.players.map((player) => {
      const mageIndex = session.deck.findIndex(
        (c) => c.cardType === 'HeroCard' && (c as HeroCard).class == 'Mage',
      );
      let mage = null;
      if (mageIndex != -1) {
        mage = session.deck.splice(mageIndex, 1)[0];
      }
      player.hand = session.deck.splice(0, 5);
      if (player.isHost) {
        if (mage) {
          player.hand.push(mage);
        }
        player.state = State.makeMove;
        player.actionPoints = 3;
        session.turn = player.id;
      } else {
        player.actionPoints = 0;
      }
    });
    return session;
  }

  getSplitSessions(session: Session): Map<string, PersonalSession> {
    const splitSessions = new Map<string, PersonalSession>();
    splitSessions.set(session.players[0]._id, new PersonalSession(session, 0));
    splitSessions.set(session.players[1]._id, new PersonalSession(session, 1));
    return splitSessions;
  }

  resolveRoll(player: Player, card: HeroCard) {
    return true; //to remove
    if (player.roll >= card.victoryRoll) {
      return true;
    }
  }

  has4Classes(player: Player) {
    const classSet = new Set<string>(player.field.map((m) => m.class));
    return classSet.size >= 4;
  }

  checkWinner(session: Session) {
    session.players.forEach((p) => {
      if (p.defeatedMonsters == 2 || this.has4Classes(p)) {
        return p._id.toString();
      }
    });
  }
}
