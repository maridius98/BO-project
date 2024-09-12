import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Card } from './card.entity';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class MonsterCard extends Card {
  @Prop()
  defeatRoll: number;

  @Prop()
  victoryRoll: number;

  @Prop({ default: false })
  isPlayable: boolean;

  @Prop({ default: [] })
  requiredHeroes: string[];
}

export const MonsterCardSchema = SchemaFactory.createForClass(MonsterCard);
