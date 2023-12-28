import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseCard } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class MagicCard extends BaseCard {
    @Prop()
    effects: string[];  
}

export const MagicCardSchema = SchemaFactory.createForClass(MagicCard);
