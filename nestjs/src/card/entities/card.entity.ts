import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class Card extends Document {
  @Prop()
  name: string;

  @Prop()
  effects: string[];

  @Prop({ default: false })
  usedEffect: boolean;

  @Prop()
  description: string;

  @Prop()
  imageURL: string;

  @Prop({ default: true })
  isPlayable: boolean;

  cardType: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
