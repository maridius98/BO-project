import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class HeroCard extends Card {
  @Prop()
  victoryRoll: number;

  @Prop()
  class: string;
}

export const HeroCardSchema = SchemaFactory.createForClass(HeroCard);
