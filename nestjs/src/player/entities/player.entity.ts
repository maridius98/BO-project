import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Session } from 'src/session/entities/session.entity';
import { Document, Types } from 'mongoose';
import { Card } from 'src/card/entities/card.entity';

@Schema()
export class Player extends Document {
  @Prop()
  username: string;

  @Prop({ default: false })
  isHost: boolean;

  @Prop({ default: 0 })
  actionPoints: number;

  @Prop({ type: Types.ObjectId, ref: 'Session' })
  session: Session;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  hand: Card[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  field: Card[];
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
