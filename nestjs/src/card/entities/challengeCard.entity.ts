import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class ChallengeCard extends Card {
  @Prop()
  positiveModifier: number;

  @Prop()
  class: string;
}

export const ChallengeCardSchema = SchemaFactory.createForClass(ChallengeCard);
