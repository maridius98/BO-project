import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class ModifierCard extends Card {
    @Prop()
    positive: number;

    @Prop()
    negative: number;
}

export const ModifierCardSchema = SchemaFactory.createForClass(ModifierCard);
