import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Session } from 'src/session/entities/session.entity';
import { Document, Types } from 'mongoose';
import { Card } from 'src/card/entities/card.entity';
import { State } from 'src/utility';
import { HeroCard } from 'src/card/entities/heroCard.entity';

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
  field: HeroCard[];

  @Prop({ default: State.wait })
  state: State;

  @Prop({ default: 0 })
  defeatedMonsters: number;

  @Prop({ default: 0 })
  cardSelectCount: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
