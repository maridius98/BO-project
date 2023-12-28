import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseCard } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class ChallengeCard extends BaseCard {
    @Prop()
    positive: number;

    @Prop()
    class: string;
}

export const ChallengeCardSchema = SchemaFactory.createForClass(ChallengeCard);
