import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class MagicCard extends Card {
    
}

export const MagicCardSchema = SchemaFactory.createForClass(MagicCard);
