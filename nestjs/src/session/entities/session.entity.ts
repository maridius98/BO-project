import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Player } from 'src/player/entities/player.entity';
import { Document, Types } from 'mongoose';
import { Card } from 'src/card/entities/card.entity';

@Schema()
export class Session extends Document {
  @Prop()
  code: string;

  @Prop({ default: '' })
  turn: string;

  @Prop({ default: 0 })
  roll: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  discardPile: Card[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  deck: Card[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  monsterDeck: Card[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Card' }] })
  monsters: Card[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }] })
  players: Player[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
