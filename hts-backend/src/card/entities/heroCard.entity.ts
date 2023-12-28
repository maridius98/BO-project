import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class HeroCard extends Card {
    @Prop()
    defeatRoll: number;

    @Prop()
    victoryRoll: number;

    @Prop()
    class: string;

    @Prop()
    effects: string[];

    @Prop({default: true})
    isFirstTurn: boolean;
}

export const HeroCardSchema = SchemaFactory.createForClass(HeroCard);
