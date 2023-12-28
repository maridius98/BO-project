import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseCard } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class MonsterCard extends BaseCard {
    @Prop()
    defeatRoll: number;

    @Prop()
    victoryRoll: number;
    
    @Prop({default: false})
    isPlayable: boolean;
}

export const MonsterCardSchema = SchemaFactory.createForClass(MonsterCard);
