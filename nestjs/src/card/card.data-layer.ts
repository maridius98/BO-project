import { Injectable } from "@nestjs/common";
import { Card } from "./entities/card.entity";
import { Player } from "src/player/entities/player.entity";
import { Session } from "src/session/entities/session.entity";
import { HeroCard } from "./entities/heroCard.entity";

export interface CardExecData {
    card: Card;
    player: Player;
    session: Session;
}

interface Command {
    exec(value: number, target: Player): Session;
}

class Draw implements Command {
    exec(value: number, target: Player){
        for (let i = 0; i < value; i ++){
            target.hand.push(target.session.deck.pop());
        }
        return target.session;
    }
}

/*class Discard implements Command {
    exec(value, target){
        player = database.fetch(target);
        for (let i = 0; i < value; i++){
            Player.hand.push(session.deck.pop());
        }
    }
}

class Sacrifice implements Command {
    exec(value, target){
        return {}
    }
}

class Destroy implements Command {
    exec(value, target){

    }
}
*/

class CommandFactory {
    build(commandName: string): Command{
        switch (commandName) {
            case "Draw":
                return new Draw();
/*
            case "Discard":
                return new Discard();
            case "Sacrifice":
                return new Sacrifice();
            case "Destroy":
                return new Destroy();
*/
            }
    }
}

@Injectable()
export class CardDataLayer{
    commandFactory: CommandFactory;
    
    shuffle(cards: Card[], length = cards.length){
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

    playEffect(cardExecData: CardExecData){
        cardExecData.card.effects.forEach(effect => {
            const [commandName, value, target] = effect.split(";");
            const command = this.commandFactory.build(commandName);
            const player = cardExecData.session.players.find(p => {p.id == target});
            cardExecData.session = command.exec(Number(value), player);
        })
        return cardExecData.session;
    }

    playCard(cardExecData: CardExecData){
        cardExecData.player.hand.filter(c => {
            c != cardExecData.card
        });
        if (cardExecData.card instanceof HeroCard){
            cardExecData.player.field.push(cardExecData.card);
            cardExecData.session.roll = this.rollNumber(6, 2); 
        } else {
            cardExecData.session.discardPile.push(cardExecData.card);
        }
        return cardExecData;
    }

    rollNumber(diceSize: number, diceCount: number){
        let sum = 0;
        for (let i = 0; i < diceCount; i++){
            sum += Math.floor(Math.random() * diceSize + 1);
        }
        return sum;
    }

    populateEffects(card: Card, target: [{effectIndex: number, target: string}]){
        target.forEach(p => {
            card.effects[p.effectIndex] += p.target;
        })
        return card;
    }
}