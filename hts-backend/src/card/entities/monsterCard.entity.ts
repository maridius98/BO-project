import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class MonsterCard extends Card {
    @Prop()
    defeatRoll: number;

    @Prop()
    victoryRoll: number;

    @Prop()
    effects: string[]; 
    
    @Prop({default: false})
    isPlayable: boolean;
}

export const MonsterCardSchema = SchemaFactory.createForClass(MonsterCard);
