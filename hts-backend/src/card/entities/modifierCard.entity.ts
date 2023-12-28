import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseCard } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class ModifierCard extends BaseCard {
    @Prop()
    positive: number;

    @Prop()
    negative: number;
}

export const ModifierCardSchema = SchemaFactory.createForClass(ModifierCard);
