import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'cards', discriminatorKey: 'cardType' })
export class BaseCard extends Document {
    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    imageURL: string;

    @Prop({default: true})
    isPlayable: boolean;
}

export const BaseCardSchema = SchemaFactory.createForClass(BaseCard);
