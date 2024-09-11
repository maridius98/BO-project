import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Session } from 'src/session/entities/session.entity';
import { Document, Types } from 'mongoose';
import { Card } from 'src/card/entities/card.entity';
import { State } from 'src/utility';

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

  @Prop({ default: 0 })
  roll: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  hand: Card[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  field: Card[];

  @Prop({ default: State.wait })
  state: State;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
